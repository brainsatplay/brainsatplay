export class Peak{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            prevValue: null,
            prevSlope: 0,
            lastTime: Date.now(),
            looping: false,
            buffer: []
        }

        this.ports = {
            default: {
                default: false,
                input: {type: 'number'},
                output: {type: 'boolean'},
                onUpdate: (userData) => {
                    let currentValue = userData[0].data
                    let source = userData[0].meta.source

                    if (source != this.label){
                        this.props.buffer.push(currentValue)
                    } else {
                        if (this.props.prevValue == null) {
                            this.props.prevValue = currentValue
                            userData[0].data = false
                        } else {
                            let slopeDirection = Math.sign(currentValue - this.props.prevValue)
                            if (this.props.prevSlope != slopeDirection){
                                if (this.props.prevSlope === 1) userData[0].data = true // Only fire on movement away from 1
                                else userData[0].data = false
                                this.props.prevSlope = slopeDirection
                            } else userData[0].data = false
                            this.props.prevValue = currentValue
                        }
                        return userData
                    }
                }
            },
            rate: {
                default: 1, // Hz
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    this.params.rate = userData[0].data    
                }
            },
        }
    }

    init = () => {
        this.props.looping = true
        let animate = () => {
            if (this.props.looping){
                let timeElapsed = Date.now() - this.props.lastTime
                if (timeElapsed > 1000 / this.params.rate){
                    let mean = this.session.atlas.mean(this.props.buffer)
                    this.props.buffer = []
                    this.session.graph.runSafe(this, 'default', [{data: mean}])
                    this.props.lastTime = Date.now()
                }
                setTimeout(animate, 1000/60)
            } 
        }
        animate()
    }

    deinit = () => {
        this.props.looping = false
    }
}