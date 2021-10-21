
export class ERP {

    constructor(info, graph){

        this.props = {
            erps: {
                P300: {
                    model: null,
                    times: {
                        lower: 100, // ms
                        center: 300, // ms
                        upper: 500 // ms
                    }
                }
            },


            lda: null
        }

        this.ports = {

            // INPUTS
            atlas: {
                input: {type: Object, name: 'DataAtlas'},
                output: {type: null},
            },

            timestamp: {
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (user) => {
                    let data = this._checkERP(user.data, user.meta.object)
                    this.update('default', {data, meta: {object: user.meta.object}})
                }
            },

            // OUTPUTS
            default: {
                input: {type: null},
                output: {type: 'boolean'},
            },


            // PARAMS
            mode: {
                data: 'train',
                options: ['train', 'predict']
            },

            type: {
                data: 'P300',
                options: Object.keys(this.props.erps)
            },

            gaze: {
                data: 1,
                options: [0,1,2,3],
                input: {type: 'number'},
                output: {type: null}
            },
        }
    }

    init = async () => {
        // this.props.lda = await this.addNode({inamed: 'lda', class: 'LDA', params: {}})
    }

   deinit = () => {
        
    }

        // Given a timestamp, is there a P300 Wave There
        _checkERP = (time , objectInd) => {

            let votes = []
            let lB = time + this.props.erps[this.ports.type.data].times.lower
            let uB = time + this.props.erps[this.ports.type.data].times.upper
            let uBi, lBi
    
            this.ports.atlas.data.eeg.forEach(ch => {
    
    
                // Extract Timestamps
                let times = ch.times.reverse()
                for (let i = 0; i < times.length; i++){
                    if (times[i] < lB) {
                        lBi = i
                        break 
                    } 
    
                    if (times[i] <= uB && uBi == null){
                        uBi = i
                    }
                }
    
                // Grab Slice
                let data = (ch.filtered.length > 0) ? ch.filtered.reverse() : ch.raw.reverse()
                let arr = data.slice(uBi, lBi)
                arr = arr.reverse()
    
                // Plot Graph
    
    
                // Check for P300 (simulated for now)
                let P300 = true * (Number.parseFloat(this.ports.gaze.data) === objectInd) * Math.floor(10*Math.random() > 0)
                // this.props.lda.instance.update(this.ports.mode.data, {data: arr})


    
                votes.push(P300)
            })
    
            let P300 = votes.reduce((a,b) => a * b) === 1// all true
    
            return P300
    
        }
}