import StateManager from 'anotherstatemanager'
import { Service } from '../../core_old/Service'

//OSC stream frontend calls
class OSCService extends Service{

	name = 'osc'
	service = 'osc'
	static type = 'client'

	state = new StateManager();

	// Responses to Monitor
	routes = [
			{
				route: 'oscData',
				post: (self,graphOrigin,router,origin,...args) => {
					const message = args[0]
					this.state.setState(message.address+'_'+message.port, message.oscData); //update state
				}
			},
			{
				route: 'oscInfo',
				post: (self,graphOrigin,router,origin,...args) => {
					const message = args[0]
					this.state.setState('oscInfo', message); //update state
				}
			},
			{
				route: 'oscClosed',
				post: (self,graphOrigin,router,origin,...args) => {
					const message = args[0]
					this.state.setState('oscClosed', message); //update state
				}
			},
			{
				route: 'oscError',
				post: (self,graphOrigin,router,origin,...args) => {
					const message = args[0]
					this.state.setState('oscError', message); //update state
				}
			}
		]

	constructor(router) {
		super(router)
	}

	async startOSC(
		localAddress = "127.0.0.1",
		localPort = 57120,
		remoteAddress = "127.0.0.1",
		remotePort = 57121,
		callback=(result)=>{},
		onupdate=undefined,
		onframe=undefined
	) {
		if (!remoteAddress) remoteAddress = localAddress
		if (!remotePort) remotePort = localPort
		let info = await this.notify({route: 'startOSC', message: [localAddress, localPort, remoteAddress, remotePort]})
		callback(info)

		if(info.message === true) {
			if(typeof onupdate === 'function') this.state.subscribeTrigger(remoteAddress+'_'+remotePort,onupdate);
			if(typeof onframe === 'function') this.state.subscribe(remoteAddress+'_'+remotePort,onframe);
		}
	}

	async sendOSC(
		message='test',
		localAddress = "127.0.0.1",
		localPort = 57120,
		remoteAddress = "127.0.0.1",
		remotePort = 57121,
	) {

		if(!remoteAddress) remoteAddress = localAddress;
		if(!remotePort) remotePort = localPort;
		
		return await this.notify({route: 'sendOSC', message: [message, localAddress, localPort, remoteAddress, remotePort]})
	}

	async stopOSC(port) {
		port.close()
	}

	subscribeToUpdates(
		remoteAddress,
		remotePort,
		onupdate=undefined,
		onframe=undefined
	) {
		if(!remoteAddress || !remotePort) return undefined;

		let sub1,sub2;
		if(typeof onupdate === 'function') sub1 = this.state.subscribeTrigger(remoteAddress+'_'+remotePort,onupdate);
		if(typeof onframe === 'function') sub2 = this.state.subscribe(remoteAddress+'_'+remotePort,onframe);

		let result: {
			updateSub?: string
			frameSub?: string
		} = {};
		
		if(sub1) result.updateSub = sub1;
		if(sub2) result.frameSub = sub2;

		if(Object.keys(result).length > 0)
			return result;
		else return undefined;
	}

	unsubscribeAll(
		remoteAddress,
		remotePort
	) {
		this.state.unsubscribeAll(remoteAddress+'_'+remotePort);
		return true;
	}

}

export default OSCService

/**
 * 
	startOSC(localAddress = "127.0.0.1", localPort = 57121, remoteAddress = null, remotePort = null, onsuccess = (newResult) => { }) {

		// Read and Write to the Same Address if Unspecified
		if (remoteAddress == null) remoteAddress = localAddress
		if (remotePort == null) remotePort = localPort

		this.socket.send(JSON.stringify({cmd:'startOSC',args:[localAddress, localPort, remoteAddress, remotePort]}));
		let sub = this.state.subscribeTrigger('commandResult', (newResult) => {
			if (typeof newResult === 'object') {
				if (newResult.message === 'oscInfo') {
					onsuccess(newResult.oscInfo);
					this.state.unsubscribeTrigger('commandResult', sub);
					return newResult.oscInfo
				}
			}
			else if (newResult.message === 'oscError') {
				this.state.unsubscribeTrigger('commandResult', sub);
				console.log("OSC Error", newResult.oscError);
				return []
			}
		});
	}

	// stopOSC(localAddress="127.0.0.1",localPort=57121, onsuccess = (newResult) => { }){

	// }

 */