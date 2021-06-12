export class DataManager{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {}

        this.ports = {
            default:{},
            log:{},
            get:{},
            csv:{},
            latest:{},
            fitbit:{}
        }

        this.props = {}
    }

    init = () => {
        if (this.ports.latest.active){
            this.session.graphs.runSafe(this,'latest',[{data: true, meta: `${this.label}_init`}])
        }
        if (this.ports.fitbit.active){
            this.session.graphs.runSafe(this,'fitbit',[{data: true, meta: `${this.label}_init`}])
        }
    }

    deinit = () => {}

    default = (userData) => {
        this.session.atlas.graphs.runSafe(this,'log', userData)
    }

    log = (userData) => {
        let u = userData[0]
        this.session.atlas.makeNote(`${u.meta.label} ${u.data}`)
    }

    get = (userData) => {
        return new Promise((resolve) => {
            let trigger = userData[0].data
            if (trigger) {
                this.session.dataManager.readFromDB(undefined, undefined,undefined, (data) => {
                    resolve(data)
                })
            }
        })
    }

    csv = (userData) => {
        let trigger = userData[0].data
        if (trigger) {
            this.session.dataManager.writeToCSV()
        }
    }

    latest = () => {
        return new Promise((resolve) => {

        let loaded
        this.session.dataManager.getFilenames(files => {
            let filename = files[files.length -1]
            this.session.dataManager.getFileSize(filename,(size) => {
            this.session.dataManager.readFromDB(filename, 0,size, (data,file) => {
                this.session.dataManager.getCSVHeader(filename, (header)=> { 
                loaded = this.session.dataManager.parseDBData(data,header.split(','),file,true);
                resolve([{data: loaded, meta:{label: `${this.label}_loaded`}}])
            });
            })
            })
        })
    })
    }


    fitbit = () => {
        return new Promise((resolve) => {
        fetch('http://localhost/clients', {
            method: 'post',
            headers: {
            "Content-type": "application/json"
            },
            body: JSON.stringify({'selection':'all'})
        })
        .then(res => {
            return res.json()
        })
        .then((clients) =>{
            // Get Client Info
            let client = clients[0]
            let id = client.user_id
            fetch('http://localhost/clients', {
            method: 'post',
            headers: {
            "Content-type": "application/json"
            },
            body: JSON.stringify( {'selection':id,'data':['profile','heart','sleep','steps', 'heart-intraday','steps-intraday']})
            })
            .then(res => {
                return res.json()
            })
            .then((data) =>{
                resolve([{data: {data}, meta:{label: `${this.label}_fitbit`}}])
        })
        })
        .catch(e => {
            console.log(e)
        })
        })
    }
}