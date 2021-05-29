import {DataQuality} from '../algorithms/DataQuality'

export class Blink{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        // Operator Configuration 
        this.paramOptions = {
            method: {
                default: 'Threshold', 
                options: ['Threshold']
            }, 
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

        this.dataQuality = new DataQuality('dataquality', this.session, {})
        // Set Default Parameters
        for (let param in this.dataQuality.paramOptions){
            if (this.dataQuality.params[param] == null) this.dataQuality.params[param] = this.dataQuality.paramOptions[param].default
        }
        // Add Default State
        this.dataQuality.state = {data: null, meta: {}}

        this.lastBlink = Date.now()
    }

    init = () => {}

    deinit = () => {}

    default = () => {
                    
        
            let blinks = [false,false]

            // try {

                if (this.params.method === 'Threshold'){
                    let sideChannels = [['AF7','FP1'],['AF8','FP2']]
                    let quality = this.dataQuality.default([{data: this.session.atlas.data, meta:{}}])[0].data
                    if (Date.now() - this.lastBlink > this.params.blinkDuration){
                        sideChannels.forEach((channels,ind) => {
                            channels.forEach(tag => {

                            let data = this.session.atlas.getEEGDataByTag(tag)
                            let chQ = quality[tag] 
                            if (data != null && chQ < this.params.qualityThreshold){
                                if (data.filtered.length > 0){
                                    let blinkRange = data.filtered.slice(data.filtered.length-(this.params.blinkDuration/1000)*this.session.atlas.data.eegshared.sps)
                                    let max = Math.max(...blinkRange.map(v => Math.abs(v)))
                                    blinks[ind] = (max > this.params.blinkThreshold)
                                }
                            }
                        })
                        })
                        this.lastBlink = Date.now()
                    }
                }

            // } catch {
            //     console.error('input not compatible')
            // }    

        return {data: blinks, meta: {label: 'blink_' + this.params.method}}
    }
}