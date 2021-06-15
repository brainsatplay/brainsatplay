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
            trialTypes: {default:['Blink Left', 'Blink Right', "Don't Blink", 'Blink Both'], show: false},
            trialProgression: {default: null, show: false},
            interTrialInterval: {default: 2}
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: -1, meta: {label: this.label}}]
                }
            }, 
            state: {}, 
        }

        this.props = {
            taskData: [],
            currentTrial: null,
            iti: null,
            active: false
        }
    }

    init = () => {

        this.props.currentTrial = -1
        this.props.taskData = []
        this.props.iti = false
        this.props.active = true

        if (this.params.trialProgression == null) this.params.trialProgression = []

        // Create Random Progression
        for (let i = 0; i < this.params.trialCount; i++){
            if (this.params.trialProgression.length-1 < i){
                let choice = Math.floor(this.params.trialTypes.length * Math.random())
                this.params.trialProgression.push(this.params.trialTypes[choice])
            }
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

    default = (userData) => {
        userData.forEach(u => {
            if (u.meta.state != 'ITI'){
                u.meta.stateTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart
            } else {
                u.meta.stateTimeElapsed = Date.now() - (this.props.taskData[this.props.currentTrial].tStart + this.params.duration*1000)
            }
        })

        return userData
    }
    
    state = (userData) => {
        return userData.map(u => {
            u.data = u.meta.state;
            return u
        })
    }

    done = () => {
        return [{data:true, meta: {label: `${this.label}_done`}}]
    }

    update = (userData) => {
        let trigger = userData[0].data
        if (trigger && this.params.mode === 'Manual') {
            this._taskUpdate(false, true)
            return [{data:true, meta: {label: `${this.label}_update`}}]
        }
    }

    reset = (userData) => {
        let trigger = userData[0].data
        if (trigger) {
            if ('params' in userData[0].meta){
                for (let param in userData[0].meta.params){
                    this.params[param] = userData[0].meta.params[param]
                }
            }
            this.init()
            return [{data:true, meta: {label: `${this.label}_reset`}}]
        }
    }

    _taskUpdate = (loop=true, forceUpdate=false) => {

        let state = this.session.atlas.graph.deeperCopy(this.states['default'])[0]

        if (this.props.currentTrial > -1){
            let trialTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart

            // Main Trial Loop
            if (forceUpdate || (this.props.currentTrial < this.params.trialCount && trialTimeElapsed > (this.params.duration + this.params.interTrialInterval)*1000)){  

                state = this._startNewTrial()

                // Stop on Last Trial
                if (this.props.currentTrial >= this.params.trialCount){ // Stop Loop
                    state.data = this.props.currentTrial // Update State Data
                    state.meta.state = 'Done!'
                    state.meta.stateDuration = 1
                    state.meta.stateTimeElapsed = 1
                    this.session.atlas.graph.runSafe(this,'state',[state])
                    this.session.atlas.graph.runSafe(this,'done',[state])
                }
            } 

            // Inter-trial Interval Loop
            else if (trialTimeElapsed > (this.params.duration)*1000 && this.props.currentTrial < this.params.trialCount - 1 && this.props.iti === false){
                state.meta.state = 'ITI'
                state.meta.stateDuration = this.params.interTrialInterval*1000
                this.props.iti = true
                this.session.atlas.graph.runSafe(this,'state',[state])
            }
        } else {
            state = this._startNewTrial()
            state.meta.trialCount = this.params.trialCount
        }

        this.session.atlas.graph.runSafe(this,'default', [state])
        if (this.props.active && loop && this.props.currentTrial != this.params.trialCount) setTimeout(this._taskUpdate, 1000/60) // 60 Loops/Second
    }

    _startNewTrial(){
        this.props.currentTrial++ // Increment Trial Counter
        this.props.taskData.push({tStart: Date.now()}) // Add New Trial Array
        this.props.iti = false
        let state = this.session.atlas.graph.deeperCopy(this.states['default'])[0]
        state.data = this.props.currentTrial
        state.meta.state = this.params.trialProgression[this.props.currentTrial]
        state.meta.stateDuration = this.params.duration*1000
        this.session.atlas.graph.runSafe(this,'state',[state])
        return state
    }
}