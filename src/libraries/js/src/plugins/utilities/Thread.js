import { WorkerManager } from "../../utils/workers/Workers"



export class Thread {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph, params={}) {
        
        
        
        
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            workerPostTime: 0,
            workerWaiting: false,
            workerId: 0,
            messageBuffer: []
        }

        if (window.workers == null) window.workers = new WorkerManager()
		else console.log('Workers already created.')

        this.ports = {
            input: {
                input: {type: undefined},
                output: {type: undefined},
                onUpdate: (user) => {
                    if (user.meta.source != this.name) this._postData(user.data); 
                    else return user;
                }
            },
            add: {
                data: function myFunction(data) {return data + 1},
                // data: (data) => {return data + 1},
                input: {type: Function}, // NOTE: Edit to handle arrays with this data type
                output: {type: null},
                onUpdate: (user) => {
                    if (this.ports.select.options.length === 0) this.ports.select.data = user.data.name
                    this.ports.select.options.push(user.data.name)
                    this._postToWorker({foo:'addfunc', input:[user.data.name, user.data], origin:this.props.id})
                }
            },
            select: {
                input: {type: 'string'},
                output: {type: null},
                options: [],
            }
        }
    }

    init = () => {
        if(!window.workers.workerResponses) { window.workers.workerResponses = []; } //placeholder till we can get webworkers working outside of the index.html
		this.props.workerId = window.workers.addWorker(); // add a worker for this DataAtlas analyzer instance
        window.workers.workerResponses.push(this._onMessage);
        this.update( 'add', this.ports.add)
    }

    deinit = () => {
        window.workers.terminate(this.props.workerId);
    }

    _onMessage = (msg) => {
        if (msg.origin === this.props.id){
            this.update( 'input', {data: msg.output})
            this.props.workerWaiting = false;
        }
    }

    _postData = (data) => {
        let msg = {foo:this.ports.select.data, input:data, origin:this.props.id}
        this._postToWorker(msg)
    }
    
    _postToWorker = (msg) => {
        if(this.props.workerWaiting === false){
            this.props.workerPostTime = Date.now()
            if (this.props.messageBuffer.length > 0) msg = this.props.messageBuffer.shift()
            window.workers.postToWorker(msg, this.props.workerId);
            this.props.workerWaiting = true;
        } else if (msg.foo === 'addfunc') this.props.messageBuffer.push(msg) // Add new functions to buffer
    }
}