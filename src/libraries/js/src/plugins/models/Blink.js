
export class Blink {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {


        // create an internal graph
        this.graphs = [
                {
                    name: 'blinkgraph',
                    nodes: [
                        {name: 'dataquality', class: 'DataQuality', params: {method: 'Mean Amplitude'}},
                        {name: 'canvas', class: 'Canvas'},
                    ]
                }
            ]


        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            looping: false,
            blinkData: {},
            tags: {
                left: ['AF7','FP1'],
                right: ['AF8','FP2']
            },
            container: document.createElement('div')
        }

        this.props.container.id = this.props.id
        this.props.container.style = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 150px; padding: 10px; box-sizing: content-box;'

        this.ports = {
            default: {
                input: {type: Object, name: 'DataAtlas'},
                output: {type: Array},
                onUpdate: async (user) => {
                    let leftBlinks = await this.update('left',user)
                    let rightBlinks = await this.update('right',user)
                    user.data = [leftBlinks.data, rightBlinks.data]
                    return user
                }
            },
            left: {
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: async (user) => {
                    return {data: await this._calculateBlink(user,this.props.tags.left), meta: {label: 'blink_left'}}
                }
            },
            right: {
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: async (user) => {
                    return {data: await this._calculateBlink(user,this.props.tags.right), meta: {label: 'blink_right'}}
                }
            },

            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            },

            model: {
                data: 'Threshold', 
                options: [
                    'Threshold', 
                    // 'LDA', 
                    // 'CNN'
                ]
            }, 

            debug: {data: false},

            blinkWindow: {
                data: 25,
                options: null,
                min: 0,
                max: 2000,
                step: 1
            },

            blinkDuration: {
                data: 250,
                options: null,
                min: 0,
                max: 2000,
                step: 1
            }, 
            
            blinkThreshold: {
                data: 150,
                options: null,
                min: 0,
                max: 1000,
                step: 1
            }, 

            qualityThreshold: {
                data: 75,
                options: null,
                min: 0,
                max: 1000,
                step: 0.01
            }
        }

        this.lastBlink = {}
        this.lastBlink.left = Date.now()
        this.lastBlink.right = Date.now()
    }

    init = async () => {
        this.props.looping = true

        this.props.dataquality = this.getNode('dataquality')
        this.props.canvas = this.getNode('canvas')
        this.props.container.insertAdjacentElement('beforeend', this.props.canvas.props.container)


        this.props.canvas.update('draw', 
            {  
                forceUpdate: true,
                data: {active: true, function: (ctx) => {
                    if (this.props.looping){
                        if (this.ports.debug.data){
                            this.props.container.style.display = 'block'
                            this._drawSignal(ctx)
                        } else {
                            this.props.container.style.display = 'none'
                            // this.props.container.style.pointerEvents = 'none'
                        }
                    }
                }}
            }
        )
    }

    deinit = () => {
        this.props.looping = false
        // this.props.canvas.deinit()
        // this.props.dataquality.deinit()
    }

    _drawSignal = (ctx) => {
        let scale = 0.1
        let yInt = 0.5
        let weight = 2
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let sideLength = width / 2

        let keys = Object.keys(this.props.blinkData)
        if (keys.length > 0){
            // Display
            this.props.container.style.display = 'block'


            // Grab Data From First Tag
            keys.forEach(tag => {
                let side = this._getTagSide(tag)
                side = (side === 'left')? 0 : 1
                if (tag){
                    if (this.props.blinkData[tag] != null) {
                    let data = this.props.blinkData[tag]
                    let chQ = this.props.channelQuality[tag]
                    // var scale = 20;

                    // DRAW SIGNAL
                    ctx.beginPath(); // Draw a new path

                    let dx = ( sideLength )/(data.length - 1)
                    data.forEach((y,i) => ctx.lineTo(sideLength*side + dx*i,-Number.parseFloat(scale)*y + Number.parseFloat(height*yInt)))
                    let redMult = Math.max(0, Math.min(1, (1-chQ)))
                    let greenMult = 1 - Math.max(0, Math.min(1, (1-chQ)))
                    ctx.strokeStyle = `rgb(${255*redMult},${255*greenMult},${0})`; // Pick a color
                    ctx.lineWidth = Number.parseFloat(weight)
                    ctx.stroke(); // Draw

                    // DRAW THRESHOLD
                    let direction = [1,-1]
                    direction.forEach(d => {
                        ctx.beginPath(); // Draw a new path
                        let thresholdArray = [d*this.ports.blinkThreshold.data,d*this.ports.blinkThreshold.data]
                        dx = width/(thresholdArray.length - 1)
                        thresholdArray.forEach((y,i) => ctx.lineTo(dx*i,-Number.parseFloat(scale)*y + Number.parseFloat(height*yInt)))
                        ctx.strokeStyle = ` #808080`; // Pick a color
                        ctx.lineWidth = Number.parseFloat(2)
                        ctx.stroke(); // Draw
                    })
                }
            }
        })

        // SPLIT SIDES
        let direction = [1,-1]
        direction.forEach(d => {
            ctx.beginPath(); // Draw a new path
            ctx.lineTo(sideLength,0)
            ctx.lineTo(sideLength,height)
            ctx.strokeStyle = `#ffffff`;
            ctx.lineWidth = Number.parseFloat(2)
            ctx.stroke(); // Draw
        })


        } else {
            this.props.container.style.display = 'none'
        }
    }

    _calculateBlink = async (user, tags) => {
        let blink = false

       if (this.props.dataquality) {
           this.props.dataquality.ports.qualityThreshold.set({value: this.ports.qualityThreshold.data})
        
            this.props.channelQuality = await this.props.dataquality.update('default',user) // Grab results of dependencies (no mutation)
            this.props.channelQuality = this.props.channelQuality.data
       }

        tags.forEach(tag => {
            let side = this._getTagSide(tag)
            if (Date.now() - this.lastBlink[side] > this.ports.blinkDuration.data){
                let tryBlink = this._calculateBlinkFromTag(user,tag)
                if (tryBlink == true) {
                    blink = true // Only update blink if true (FIX: Sum up multiple channels if exists)
                    this.lastBlink[side] = Date.now() // Update blink time (if detected)
                }
            }
        })
        return blink
    }

    _calculateBlinkFromTag = (user,tag) => {
        let blink = false

        try {
            let data = this.session.atlas.getEEGDataByTag(tag,user.data) // Grab from user's own atlas data
            let chQ = this.props.channelQuality[tag] 
            if (data){
                let processedData = data.filtered // Try Filtered
                if (processedData.length === 0) processedData = data.raw // Try Raw
                if (processedData.length > 0){
                    let durationLength = (this.ports.blinkDuration.data/1000)*user.data.eegshared.sps
                    let windowLength = (this.ports.blinkWindow.data/1000)*user.data.eegshared.sps
                    this.props.blinkData[tag] = processedData.slice(processedData.length-durationLength)

                    let dataWindow = this.props.blinkData[tag].slice(this.props.blinkData[tag].length - Math.min(windowLength, durationLength))
                    let max = Math.max(...dataWindow.map(v => Math.abs(v)))
                    
                    // Only Count Blink if Above Quality Threshold
                    if (data != null && chQ >= 1) {
                        blink = (max > this.ports.blinkThreshold.data)
                    }
                 }
            }
        } catch (e) {console.error(e)}

        return blink
    }


    _getTagSide = (tag) => {
        let sides = Object.keys(this.props.tags)
        return sides.find(s => this.props.tags[s].includes(tag))
    }
}