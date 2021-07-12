import {eegmath} from '../../utils/eegmath'


export class DataQuality{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        // Operator Configuration 
        this.paramOptions = {
            method: {
                default: 'Mean Amplitude', 
                options: ['Standard Deviation', 'Mean Amplitude']
            },
            output: {
                default: 'Channels',
                options: ['Mean', 'Channels']
            }, 
            window: {
                default: 100,
                options: null
            },
            qualityThreshold: {
                default: 50,
                min: 0,
                max: 1000,
                step: 0.01
            }
        },

        this.ports = {
            default: {
                input: {type: Object, name: 'DataAtlas'},
                output: {type: Object},
            }
        }
    }

    init = () => {}

    deinit = () => {
        // MUST DISCONNECT STREAM
    }

    default = (userData) => {
        userData.forEach(u => {
            
            let dict = {}
            let arr = []

            // Grab Atlas by Default (if not passed already)
            let data = u.data //(u.data != null) ? u.data : this.session.atlas.data

            try {
                let channels = data.eegshared.eegChannelTags
                channels.forEach((o,i) => {
                    let coord = this.session.atlas.getEEGDataByChannel(o.ch, data)
                    let processedData = coord.filtered // Try Filtered
                    if (processedData.length === 0) processedData = coord.raw // Try Raw
                    if (processedData.length > 0){
                        let quality
                        let slice = processedData.slice(processedData.length - this.params.window)

                        // Calculate Quality (0+, where > 1 is good quality)
                        if (this.params.method === 'Standard Deviation'){
                            let meanVariance = eegmath.variance(slice)
                            let std = Math.sqrt(meanVariance)
                            quality = this.params.qualityThreshold / std
                        } else if (this.params.method === 'Mean Amplitude'){
                            let absSlice = slice.map(v => Math.abs(v))
                            let mean = eegmath.mean(absSlice)
                            quality = this.params.qualityThreshold / mean
                        }

                        if (this.params.output === 'Mean') arr.push(quality)
                        else dict[coord.tag] = quality
                    } else {
                        if (this.params.output === 'Mean') arr.push(NaN)
                        else dict[coord.tag] = NaN
                    }
                })
            } catch {
                console.error('input not compatible')
                arr.push(0)
            }       
            
            // Output to User Data Object
            if (this.params.output === 'Mean') u.data = this.session.atlas.mean(arr)
            else u.data = dict
            u.meta.label = `${this.label}_${this.params.metric}`
        })

        return userData
    }
}