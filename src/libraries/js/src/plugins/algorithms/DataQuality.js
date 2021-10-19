import {Math2} from '../../utils/mathUtils/Math2'
import {Plugin} from '../../graph/Plugin'


export class DataQuality extends Plugin {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph, params={}) {
        super(info, graph)
        
        


        this.ports = {
            default: {
                input: {type: Object, name: 'DataAtlas'},
                output: {type: Object},
                onUpdate: (user) => {
            
                    let dict = {}
                    let arr = []
        
                    // Grab Atlas by Default (if not passed already)
                    let data = user.data //(user.data != null) ? user.data : this.session.atlas.data
        
                    try {
                        let channels = data.eegshared.eegChannelTags
                        channels.forEach((o,i) => {
                            let coord = this.session.atlas.getEEGDataByChannel(o.ch, data)
                            let processedData = coord.filtered // Try Filtered
                            if (processedData.length === 0) processedData = coord.raw // Try Raw
                            if (processedData.length > 0){
                                let quality
                                let slice = processedData.slice(processedData.length - this.ports.window.data)
        
                                // Calculate Quality (0+, where > 1 is good quality)
                                if (this.ports.method.data === 'Standard Deviation'){
                                    let meanVariance = Math2.variance(slice)
                                    let std = Math.sqrt(meanVariance)
                                    quality = this.ports.qualityThreshold.data / std
                                } else if (this.ports.method.data === 'Mean Amplitude'){
                                    let absSlice = slice.map(v => Math.abs(v))
                                    let mean = Math2.mean(absSlice)
                                    quality = this.ports.qualityThreshold.data / mean
                                }
        
                                if (this.ports.output.data === 'Mean') arr.push(quality)
                                else dict[coord.tag] = quality
                            } else {
                                if (this.ports.output.data === 'Mean') arr.push(NaN)
                                else dict[coord.tag] = NaN
                            }
                        })
                    } catch {
                        console.error('input not compatible')
                        arr.push(0)
                    }       
                    
                    // Output to User Data Object
                    if (this.ports.output.data === 'Mean') user.data = this.session.atlas.mean(arr)
                    else user.data = dict
        
                return user
            }
            },
            method: {
                data: 'Mean Amplitude', 
                options: ['Standard Deviation', 'Mean Amplitude']
            },
            output: {
                data: 'Channels',
                options: ['Mean', 'Channels']
            }, 
            window: {
                data: 100,
                options: null
            },
            qualityThreshold: {
                data: 50,
                min: 0,
                max: 1000,
                step: 0.01
            }
        }
    }

    init = () => {}

    deinit = () => {
        // MUST DISCONNECT STREAM
    }
}