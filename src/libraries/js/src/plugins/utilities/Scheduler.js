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
            trialTypes: {default: new Set('1', '2', "3"), show: false},
            progression: {default: null, show: false},
            interTrialInterval: {default: 0},
            allowConsecutive: {default: true},
        }

        this.ports = {
            default: {
                default: -1,
                meta: {label: this.label},
                input: {type:null},
                output: {type: 'string'},
                onUpdate: (user) => { 
                    if (this.props.currentTrial >= 0){
                        user.data = this.props.currentTrial
                        user.meta.label = this.label
                        user.meta.state = this.props.state;
                            if (user.meta.state != 'ITI'){
                                user.meta.stateTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart
                            } else {
                                user.meta.stateTimeElapsed = Date.now() - (this.props.taskData[this.props.currentTrial].tStart + this.params.duration*1000)
                            }
                            u.meta.stateDuration = this.params.duration*1000
                            u.meta.trialCount = this.params.trialCount
                        return user
                    }
                }
            }, 
            state: {
                input: {type:null},
                output: {type: 'string'},
                onUpdate: (user) => { 
                    user.data = this.props.state;
                    user.meta.label = this.label
                    return user
                }
            }, 
            done: {
                input: {type:null},
                output: {type: 'boolean'},
                onUpdate: (user) => { 
                    return {data:true, forceUpdate: true}
                }
            },
            update: {
                input: {type:'boolean'},
                output: {type: null},
                onUpdate: (user) => { 
                    let trigger = user.data
                    if (trigger && this.params.mode === 'Manual') {
                        this._taskUpdate(false, true)
                    }
                }
            },
            reset: {
                input: {type:'boolean'},
                output: {type: null},
                onUpdate: (user) => { 
                    let trigger = user.data
                    if (trigger) {
                        if ('params' in user.meta){
                            for (let param in user.meta.params){
                                this.params[param] = user.meta.params[param]
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
            let prevChoice
            for (let i = 0; i < this.params.trialCount; i++){
                let options = new Set(this.params.trialTypes)
                if (!this.params.allowConsecutive) options.delete(prevChoice)
                let choice = Math.floor(options.size * Math.random())
                let ind = 0
                options.forEach((val) => {
                    if (ind === choice) {
                        this.params.progression.push(val)
                        prevChoice = val
                    }
                    ind++
                })
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
                    this.session.atlas.graph.runSafe(this,'state',{forceRun: true, forceUpdate: true})
                    this.session.atlas.graph.runSafe(this,'done',{forceRun: true, forceUpdate: true})
                }
            } 

            // Inter-trial Interval Loop
            else if (trialTimeElapsed > (this.params.duration)*1000 && this.props.currentTrial < this.params.trialCount - 1 && this.props.iti === false){
                this.props.state = 'ITI'
                this.props.iti = true
                this.session.atlas.graph.runSafe(this,'state',{forceRun: true, forceUpdate: true})
            }
        } else {
            this._startNewTrial()
        }

        this.session.atlas.graph.runSafe(this,'default', {forceRun: true, forceUpdate: true})
        if (this.props.active && loop && this.props.currentTrial != this.params.trialCount) setTimeout(this._taskUpdate, 1000/60) // 60 Loops/Second
    }

    _startNewTrial(){
        this.props.currentTrial++ // Increment Trial Counter
        this.props.taskData.push({tStart: Date.now()}) // Add New Trial Array
        this.props.iti = false
        this.props.state = this.params.progression[this.props.currentTrial]
        this.session.atlas.graph.runSafe(this,'state',{forceRun: true, forceUpdate: true})
    }
}