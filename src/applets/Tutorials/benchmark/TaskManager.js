export class TaskManager{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            paradigm: {default: 'Task', options: ['Task']},
            duration: {default: 5, options: null},
            trialCount: {default: 10},
            trialTypes: {default:['Go', 'No Go'], show: false},
            trialProgression: {default: [], show: false},
        }

        this.ports = {
            default: {}, 
            choice: {}
        }

        this.props = {
            loop: null,
            taskData: [{tStart: Date.now()}],
            currentTrial: 0,
        }
    }

    init = () => {
        // Start Task Loop
        this._taskLoop()

        // Create Random Progression
        for (let i = 0; i < this.params.trialCount; i ++){
            if (this.params.trialProgression.length-1 < i){
                let choice = Math.floor(this.params.trialTypes.length * Math.random())
                this.params.trialProgression.push(this.params.trialTypes[choice])
            }
        }
    }

    deinit = () => {
        window.cancelAnimationFrame(this.props.loop)
    }

    default = () => {
        this.states['default'].data = true // Do somethinng
        this.states['default'].meta.label = `audio`
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

    fft = () => {
        let channel = undefined // Get FFT Data
        if(channel) this.states['fft'].data = channel.fft;
        else this.states['fft'].data = new Array(256).fill(0);
        this.states['fft'].meta.label = `audio_fft`
        return this.states['fft']
    }



    _taskLoop = () => {

        // Start New Trial
        if (Date.now() - this.props.taskData[this.props.currentTrial].tStart > this.params.duration*1000){
            this.props.currentTrial++ // Increment Trial Counter
            this.props.taskData.push({tStart: Date.now()}) // Add New Trial Array

        } else {
        }


        this.props.loop = setTimeout(this._taskLoop, 1000/60) // 60 Loops/Second
    }
}