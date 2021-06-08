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

    init = () => {}

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
            let data = this.session.dataManager.readFromDB()
            return data
        }
    }

    csv = (userData) => {
        let trigger = userData[0].data
        if (trigger) {
            let csv = this.session.dataManager.writeToCSV()
            console.log(csv)
            return csv
        }
    }
}