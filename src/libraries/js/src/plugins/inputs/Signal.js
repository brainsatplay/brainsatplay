import { StateManager } from '../../ui/StateManager'


export class Signal{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            autoconnect: {default: false, show: false}
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: {}, meta: {label: 'signal'}}]
                }
            }
        }


        // this.props = {
        //     state: new StateManager()
        // }

        // let added = (arr) => {
        //     arr.forEach(k => {
        //         console.log(k)
        //         if (k.includes('device')){
        //             let sub = this.session.subscribe('synthetic', 'all', undefined, (data)=>{console.log('new data')}, this.props.state)
        //             console.log(sub)
        //         }
        //     })
        // }
        // this.session.state.onUpdate(added)

        // this.prevAtlas = null
    }

    init = () => {

        // Auto-Start a Synthetic Stream
        if (this.params.autoconnect && this.session.deviceStreams.length === 0) {
            this.session.connectDevice(undefined, undefined, undefined, {device: 'Synthetic', variant: '', analysis: ['eegcoherence']})
        }
    }

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = () => {

        // console.log(this.session.atlas.data == this.prevAtlas)
        // this.prevAtlas = this.session.atlas.data
        return {data: this.session.atlas.data, meta: {}, username: this.session.info.auth.username}
    }
}