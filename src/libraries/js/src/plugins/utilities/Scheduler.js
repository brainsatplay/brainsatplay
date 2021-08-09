export class Scheduler{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            paradigm: {default: 'Task', options: ['Task']},
            mode: {default: 'Auto', options: ['Auto', 'Manual']},
            duration: {default: 2},
            trialCount: {default: 10},
            trialTypes: {default:['1', '2', "3"], show: false},
            progression: {default: null, show: false},
            interTrialInterval: {default: 0},
        }

        this.ports = {
            default: {
                default: -1,
                meta: {label: this.label},
                input: {type:null},
                output: {type: 'string'},
                onUpdate: (userData) => { 
                    if (this.props.currentTrial >= 0){
                        userData.forEach(u => {
                            u.data = this.props.currentTrial
                            u.meta.label = this.label
                            u.meta.state = this.props.state;
                            if (u.meta.state != 'ITI'){
                                u.meta.stateTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart
                            } else {
                                u.meta.stateTimeElapsed = Date.now() - (this.props.taskData[this.props.currentTrial].tStart + this.params.duration*1000)
                            }
                            u.meta.stateDuration = this.params.duration*1000
                            u.meta.trialCount = this.params.trialCount
                        })
                        return userData
                    }
                }
            }, 
            state: {
                input: {type:null},
                output: {type: 'string'},
                onUpdate: (userData) => { 
                    return userData.map(u => {
                        u.data = this.props.state;
                        u.meta.label = this.label
                        return u
                    })
                }
            }, 
            done: {
                input: {type:null},
                output: {type: 'boolean'},
                onUpdate: (userData) => { 
                    return [{data:true, forceUpdate: true}]
                }
            },
            update: {
                input: {type:'boolean'},
                output: {type: null},
                onUpdate: (userData) => { 
                    let trigger = userData[0].data
                    if (trigger && this.params.mode === 'Manual') {
                        this._taskUpdate(false, true)
                    }
                }
            },
            reset: {
                input: {type:'boolean'},
                output: {type: null},
                onUpdate: (userData) => { 
                    let trigger = userData[0].data
                    if (trigger) {
                        if ('params' in userData[0].meta){
                            for (let param in userData[0].meta.params){
                                this.params[param] = userData[0].meta.params[param]
                            }
                        }
                        this.init()
                    }
                }
            },
        }

        this.props = {
            taskData: [],
            currentTrial: null,
            iti: null,
            active: false,
            state: '',
        }
    }

    init = () => {

        this.props.currentTrial = -1
        this.props.taskData = []
        this.props.iti = false
        this.props.active = true

        if (this.params.progression == null) {
            this.params.progression = []
            // Create Random Progression
            for (let i = 0; i < this.params.trialCount; i++){
                    let choice = Math.floor(this.params.trialTypes.length * Math.random())
                    this.params.progression.push(this.params.trialTypes[choice])
            }
        } else {
            this.params.trialCount = this.params.progression.length
        }

        // Start Task Loop
        if (this.params.mode === 'Auto'){
            this._taskUpdate()
        } else {
            this._taskUpdate(false)
        }
    }
    

    deinit = () => {
        this.props.active = false
    }

    _taskUpdate = (loop=true, forceUpdate=false) => {


        if (this.props.currentTrial > -1){
            let trialTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart

            // Main Trial Loop
            if (forceUpdate || (this.props.currentTrial < this.params.trialCount && trialTimeElapsed > (this.params.duration + this.params.interTrialInterval)*1000)){  

                this._startNewTrial()

                // Stop on Last Trial
                if (this.props.currentTrial >= this.params.trialCount){ // Stop Loop
                    this.props.state = ''
                    this.session.atlas.graph.runSafe(this,'state',[{forceRun: true, forceUpdate: true}])
                    this.session.atlas.graph.runSafe(this,'done',[{forceRun: true, forceUpdate: true}])
                }
            } 

            // Inter-trial Interval Loop
            else if (trialTimeElapsed > (this.params.duration)*1000 && this.props.currentTrial < this.params.trialCount - 1 && this.props.iti === false){
                this.props.state = 'ITI'
                this.props.iti = true
                this.session.atlas.graph.runSafe(this,'state',[{forceRun: true, forceUpdate: true}])
            }
        } else {
            this._startNewTrial()
        }

        this.session.atlas.graph.runSafe(this,'default', [{forceRun: true, forceUpdate: true}])
        if (this.props.active && loop && this.props.currentTrial != this.params.trialCount) setTimeout(this._taskUpdate, 1000/60) // 60 Loops/Second
    }

    _startNewTrial(){
        this.props.currentTrial++ // Increment Trial Counter
        this.props.taskData.push({tStart: Date.now()}) // Add New Trial Array
        this.props.iti = false
        this.props.state = this.params.progression[this.props.currentTrial]
        this.session.atlas.graph.runSafe(this,'state',[{forceRun: true, forceUpdate: true}])
    }
}