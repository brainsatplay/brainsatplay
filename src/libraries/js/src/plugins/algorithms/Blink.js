import {DataQuality} from './DataQuality'

export class Blink{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                defaults: {
                    output: [{data: [false, false], meta: {label: 'blink'}}]
                }
            },
            left: {
                defaults: {
                    output: [{data: false, meta: {label: 'blink_left'}}] // Declares data types for binding
                }
            },
            right: {
                defaults: {
                    output: [{data: false, meta: {label: 'blink_right'}}] // Declares data types for binding
                }
            }
        }

        // Operator Configuration 
        this.paramOptions = {
            // method: {
            //     default: 'Threshold', 
            //     options: ['Threshold']
            // }, 
            blinkDuration: {
                default: 200,
                options: null,
                min: 0,
                max: 2000,
                step: 1
            }, blinkThreshold: {
                default: 220,
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
        
        this.dependencies = [{id: 'dataquality', class: DataQuality, params: {}}] // Converted to a dictionary of active instances

        this.lastBlink = Date.now()
    }

    init = () => {}

    deinit = () => {}

    default = (userData) => {

            let leftBlinks = this.session.atlas.graphs.runSafe(userData, this,'left')
            let rightBlinks = this.session.atlas.graphs.runSafe(userData, this,'right')
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
        this._dataQuality = this.session.atlas.graphs.runSafe([user], this.dependencies['dataquality'],'default')[0].data // Grab results of dependencies (no mutation)
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