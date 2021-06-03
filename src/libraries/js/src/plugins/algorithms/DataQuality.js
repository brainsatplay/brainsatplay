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
                default: 'Standard Deviation', 
                options: ['Standard Deviation']
            },
            output: {
                default: 'Channels',
                options: ['Mean', 'Channels']
            }, 
            window: {
                default: 1000,
                options: null
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

                if (this.params.method === 'Standard Deviation'){
                    let channels = data.eegshared.eegChannelTags
                    channels.forEach((o,i) => {
                        let coord = this.session.atlas.getEEGDataByChannel(o.ch, data)
                        if (coord.filtered.length > 0){
                            let slice = coord.filtered.slice(coord.filtered.length - this.params.window)
                            let meanVariance = eegmath.variance(slice)
                            let stdev = Math.sqrt(meanVariance)
                            if (this.params.output === 'Mean') arr.push(stdev)
                            else dict[coord.tag] = stdev
                        } else {
                            if (this.params.output === 'Mean') arr.push(NaN)
                            else dict[coord.tag] = NaN
                        }
                    })
                }

            } catch {
                console.error('input not compatible')
                arr.push(0)
            }       
            
            // Output to User Data Object
            if (this.params.output === 'Mean') u.data = this.session.atlas.mean(arr)
            else u.data = dict
            u.meta.label = this.params.metric
        })

        return userData
    }
}