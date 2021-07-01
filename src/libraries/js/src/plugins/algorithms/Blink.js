import {DataQuality} from './DataQuality'
import {Canvas} from '../outputs/Canvas'

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
            dataquality: null
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
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 300px; height: 150px; position: absolute; top: 0px; right: 0px; border: 1px solid white;'>
            </div>`
        }

        let setupHTML = (app) => {
            this.props.container = document.getElementById(`${this.props.id}`);
            let ui = this.props.canvas.instance.init()
            let html = ui.HTMLtemplate()
            this.props.container.insertAdjacentHTML('beforeend', html)
            ui.setupHTML()

            this.session.graph.runSafe(this.props.canvas.instance, 'default', [
                {
                    data: (ctx) => {
                        if (this.props.looping){
                            if (this.params.debug){
                                this.props.container.style.opacity = 1
                                ctx.beginPath();
                                ctx.arc(
                                    100 + 25*Math.sin(Date.now()/1000), 
                                    100 + 25*Math.cos(Date.now()/1000),  
                                    Number.parseFloat(10) + Number.parseFloat(0)*Number.parseFloat(1),
                                    0, 
                                    Math.PI*2
                                    );
                                ctx.fillStyle = `#ffffff`;
                                ctx.fill();
                                ctx.closePath();
                            } else this.props.container.style.opacity = 0
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

    _calculateBlink = (user, tags) => {
        let blink = false
        this._dataQuality = this.session.atlas.graph.runSafe(this.props.dataquality.instance,'default',[user])[0].data // Grab results of dependencies (no mutation)
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
            let chQ = this._dataQuality[tag] 
            if (data != null && chQ < this.params.qualityThreshold){
                if (data.filtered.length > 0){
                    let blinkRange = data.filtered.slice(data.filtered.length-(this.params.blinkDuration/1000)*user.data.eegshared.sps)
                    let max = Math.max(...blinkRange.map(v => Math.abs(v)))
                    blink = (max > this.params.blinkThreshold)
                }
            }
        } catch (e) {console.error('input not formatted properly')}

        return blink
    }
}