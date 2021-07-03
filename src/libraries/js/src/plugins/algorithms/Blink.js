import {DataQuality} from './DataQuality'
import {Canvas} from '../graphics/Canvas'

export class Blink{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                types: {
                    in: 'DataAtlas',
                    out: Array              
                }
            },
            left: {
                types: {
                    in: 'DataAtlas',
                    out: 'boolean'                
                }
            },
            right: {
                types: {
                    in: 'DataAtlas',
                    out: 'boolean'                
                }
            }
        }

        // Operator Configuration 
        this.paramOptions = {
            // method: {
            //     default: 'Threshold', 
            //     options: ['Threshold']
            // }, 
            debug: {default: false},
            blinkDuration: {
                default: 100,
                options: null,
                min: 0,
                max: 2000,
                step: 1
            }, blinkThreshold: {
                default: 100,
                options: null,
                min: 0,
                max: 1000,
                step: 1
            }, 
            qualityThreshold: {
                default: 50,
                options: null,
                min: 0,
                max: 200,
                step: 1
            }
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            canvas: null,
            // container: null,
            // context: null,
            // drawFunctions: {},
            looping: false,
            dataquality: null,
            blinkData: {}
        }

        // Dependencies
        this.analysis = new Set()
        this.props.dataquality = this.session.atlas.graph.instantiateNode({id: 'dataquality', class: DataQuality, params: {}}, this.session)
        this.props.canvas = this.session.atlas.graph.instantiateNode({id: 'canvas', class: Canvas, params: {}}, this.session)
        this.analysis.add(...Array.from(this.props.dataquality.analysis))
        this.analysis.add(...Array.from(this.props.canvas.analysis))

        this.lastBlink = Date.now()
    }

    init = () => {
        this.props.looping = true

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 300px; height: 150px; position: absolute; top: 0px; right: 0px; z-index: 1000;'>
            </div>`
        }

        let setupHTML = (app) => {
            this.props.container = document.getElementById(`${this.props.id}`);
            let ui = this.props.canvas.instance.init()
            let html = ui.HTMLtemplate()
            this.props.container.insertAdjacentHTML('beforeend', html)
            ui.setupHTML()

            this.session.atlas.graph.runSafe(this.props.canvas.instance, 'draw', [
                {
                    data: (ctx) => {
                        if (this.props.looping){
                            if (this.params.debug){
                                this._drawSignal(ctx)
                            } else {
                                this.props.container.style.opacity = 0
                                this.props.container.style.pointerEvents = 'none'
                            }
                        }
                    }
                }
            ])
        }

        return { HTMLtemplate, setupHTML}
    }

    deinit = () => {
        this.props.looping = false
        this.props.canvas.instance.deinit()
        this.props.dataquality.instance.deinit()
    }

    default = (userData) => {

            let leftBlinks = this.session.atlas.graph.runSafe(this,'left',userData)
            let rightBlinks = this.session.atlas.graph.runSafe(this,'right',userData)
            userData.forEach((u,i) => {
                u.data = [leftBlinks[i].data, rightBlinks[i].data]
                u.meta.label = 'blink'
            })

            return userData
        // }
    }

    left = (userData) => {
        userData.forEach(u => {
            u.data = this._calculateBlink(u,['AF7','FP1'])
            u.meta.label = 'blink_left'
        })
        return userData
    }

    right = (userData) => {
        userData.forEach(u => {
            u.data = this._calculateBlink(u,['AF8','FP2'])
            u.meta.label = 'blink_right'
        })
        return userData
    }

    _drawSignal = (ctx) => {
        let scale = 0.1
        let yInt = 0.5
        let weight = 2
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let keys = Object.keys(this.props.blinkData)
        if (keys.length > 0){
            // Display
            this.props.container.style.opacity = 1
            this.props.container.style.pointerEvents = 'all'

            // Grab Data From First Tag
            let tag = keys[0]
            if (tag){
                if (this.props.blinkData[tag] != null) {
                let data = this.props.blinkData[tag]
                let chQ = this.props.channelQuality[tag]
                // var scale = 20;

                // DRAW SIGNAL
                ctx.beginPath(); // Draw a new path
                let dx = width/(data.length - 1)
                data.forEach((y,i) => ctx.lineTo(dx*i,-Number.parseFloat(scale)*y + Number.parseFloat(height*yInt)))
                let redMult = Math.max(0, Math.min(1, (chQ/this.params.qualityThreshold - 1)))
                let greenMult = 1-Math.max(0, Math.min(1, (chQ/this.params.qualityThreshold)))
                ctx.strokeStyle = `rgb(${255*redMult},${255*greenMult},${50})`; // Pick a color
                ctx.lineWidth = Number.parseFloat(weight)
                ctx.stroke(); // Draw

                // DRAW THRESHOLD
                let direction = [1,-1]
                direction.forEach(d => {
                    ctx.beginPath(); // Draw a new path
                    let thresholdArray = [d*this.params.blinkThreshold,d*this.params.blinkThreshold]
                    dx = width/(thresholdArray.length - 1)
                    thresholdArray.forEach((y,i) => ctx.lineTo(dx*i,-Number.parseFloat(scale)*y + Number.parseFloat(height*yInt)))
                    ctx.strokeStyle = `#ffffff`; // Pick a color
                    ctx.lineWidth = Number.parseFloat(weight)
                    ctx.stroke(); // Draw
                })
            }
        }
        } else {
            this.props.container.style.opacity = 0
            this.props.container.style.pointerEvents = 'none'
        }
    }

    _calculateBlink = (user, tags) => {
        let blink = false
        this.props.channelQuality = this.session.atlas.graph.runSafe(this.props.dataquality.instance,'default',[user])[0].data // Grab results of dependencies (no mutation)
        if (Date.now() - this.lastBlink > this.params.blinkDuration){
            tags.forEach(tag => {
                let tryBlink = this._calculateBlinkFromTag(user,tag)
                if (tryBlink != null){ // If Tag Exists
                    blink = tryBlink
                }
            })

            if (blink) this.lastBlink = Date.now() // Update blink time (if detected)
        }
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
                    this.props.blinkData[tag] = processedData.slice(processedData.length-(this.params.blinkDuration/1000)*user.data.eegshared.sps)
                    let max = Math.max(...this.props.blinkData[tag].map(v => Math.abs(v)))
                    
                    // Only Count Blink if Above Quality Threshold
                    if (data != null && chQ < this.params.qualityThreshold) blink = (max > this.params.blinkThreshold)
                 }
            }
        } catch (e) {console.error('input not formatted properly')}

        return blink
    }
}