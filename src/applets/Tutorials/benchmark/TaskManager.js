export class TaskManager{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            paradigm: {default: 'Task', options: ['Task']},
            duration: {default: 2},
            trialCount: {default: 10},
            trialTypes: {default:['Blink Left', 'Blink Right', "Don't Blink", 'Blink Both'], show: false},
            trialProgression: {default: [], show: false},
            interTrialInterval: {default: 2}
        }

        this.ports = {
            default: {
                defaults: {
                    output: [{data: -1, meta: {}}]
                }
            }, 
            choice: {}
        }

        this.props = {
            loop: null,
            taskData: [],
            currentTrial: -1,
        }
    }

    init = () => {

        // Create Random Progression
        for (let i = 0; i < this.params.trialCount; i ++){
            if (this.params.trialProgression.length-1 < i){
                let choice = Math.floor(this.params.trialTypes.length * Math.random())
                this.params.trialProgression.push(this.params.trialTypes[choice])
            }
        }

        // Start Task Loop
        this._taskLoop()
    }

    deinit = () => {}

    default = () => {
        let updateObj = {}
        updateObj[this.label] = true // New data
        this.stateUpdates.manager.setSequentialState(updateObj)
        if (this.states['default'][0].meta.state != 'ITI'){
            this.states['default'][0].meta.stateTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart
        } else {
            this.states['default'][0].meta.stateTimeElapsed = Date.now() - (this.props.taskData[this.props.currentTrial].tStart + this.params.duration*1000)
        }
        return this.states['default']
    }

    // Log the Choice Passed to this Port
    choice = (userData) => {
        
        let choices = userData.map(u => u.data)
        let allFloats = choices.reduce((a,b) => a * (typeof b == 'number' && !Number.isSafeInteger(b)), true)

        // Output the Average for Floats
        if (allFloats){
            return this.session.atlas.mean(choices)
        } 

        // Otherwise Output the Most Chosen Choice
        else {
            return this.session.atlas.mode(choices)
        }
    }

    _taskLoop = () => {

        if (this.props.currentTrial > -1){
            let trialTimeElapsed = Date.now() - this.props.taskData[this.props.currentTrial].tStart

            // Main Trial Loop
            if (this.props.currentTrial < this.params.trialCount && trialTimeElapsed > (this.params.duration + this.params.interTrialInterval)*1000){  

                this._startNewTrial()

                // Stop on Last Trial
                if (this.props.currentTrial === this.params.trialCount){ // Stop Loop
                    this.states['default'][0].data = this.props.currentTrial // Update State Data
                    this.states['default'][0].meta.state = 'Done!'
                    this.states['default'][0].meta.stateDuration = 1
                    this.states['default'][0].meta.stateTimeElapsed = 1
                }
            } 

            // Inter-trial Interval Loop
            else if (trialTimeElapsed > (this.params.duration)*1000 && this.props.currentTrial < this.params.trialCount - 1){
                this.states['default'][0].meta.state = 'ITI'
                this.states['default'][0].meta.stateDuration = this.params.interTrialInterval*1000
            }
        } else {
            this._startNewTrial()
            this.states['default'][0].meta.trialCount = this.params.trialCount
        }

        this.default()
        if (this.props.currentTrial != this.params.trialCount) this.props.loop = setTimeout(this._taskLoop, 1000/60) // 60 Loops/Second
    }

    _startNewTrial(){
        this.props.currentTrial++ // Increment Trial Counter
        this.props.taskData.push({tStart: Date.now()}) // Add New Trial Array
        this.states['default'][0].meta.state = this.params.trialProgression[this.props.currentTrial]
        this.states['default'][0].meta.stateDuration = this.params.duration*1000
    }
}