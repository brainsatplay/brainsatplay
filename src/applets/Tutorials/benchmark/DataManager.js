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
        }

        this.props = {}
    }

    init = () => {
        if (this.ports.latest.active){
            this.session.graphs.runSafe(this,'latest',[{data: true, meta: `${this.label}_init`}])
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
        let trigger = userData[0].data
        if (trigger) {
            this.session.dataManager.readFromDB(undefined, undefined,undefined, (data) => {
                console.log(data)
                return data
            })
        }
    }

    csv = (userData) => {
        let trigger = userData[0].data
        if (trigger) {
            this.session.dataManager.writeToCSV()
        }
    }

    latest = async () => {
        this.session.dataManager.getFilenames(files => {
            let filename = files[files.length -1]
            this.session.dataManager.readFromDB(filename, undefined,undefined, (data,file) => {
                let head
                this.session.dataManager.getCSVHeader(filename, (header)=> { 
                head = header.split(',');
                let loaded = this.session.dataManager.parseDBData(data,head,file,true);
            });
            })
        })
    }
}