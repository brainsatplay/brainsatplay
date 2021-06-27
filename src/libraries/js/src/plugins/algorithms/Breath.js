import {SoundJS} from '../../../../../platform/js/frontend/UX/Sound'
import {eegmath} from '../../utils/eegmath'


export class Breath{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            default: {
                default: null,
                input: {type: 'array'},
                output: {type: null},
                onUpdate: (userData) => {
                    let data = userData[0].data
                    this.props.audfft = data.slice(6);
                    this.props.audsum = eegmath.sum(data);
                    this.props.audSumGraph.shift(); this.props.audSumGraph.push(this.props.audsum);
                    this.props.audSpect.shift(); this.props.audSpect.push(this.props.audfft);
            
                    this.props.audTime.shift(); this.props.audTime.push(Date.now());
            
                    let smoothedfast = eegmath.mean(this.props.audSumGraph.slice(this.props.audSumGraph.length-5));
                    this.props.audSumSmoothedFast.shift(); this.props.audSumSmoothedFast.push(smoothedfast);
                    let smoothedslow = eegmath.mean(this.props.audSumGraph.slice(this.props.audSumGraph.length-40));
                    this.props.audSumSmoothedSlow.shift(); this.props.audSumSmoothedSlow.push(smoothedslow);
                    let smoothed2 = eegmath.mean(this.props.audSumGraph.slice(this.props.audSumGraph.length-120));
                    this.props.audSumSmoothedLong.shift(); this.props.audSumSmoothedLong.push(smoothed2);
                    
                    this.props.peaksfast = eegmath.peakDetect(this.props.audSumSmoothedFast,'peak',10);
                    this.props.valsfast = eegmath.peakDetect(this.props.audSumSmoothedFast,'valley',10);
            
                    this.props.peaksslow = eegmath.peakDetect(this.props.audSumSmoothedSlow,'peak',25);
                    this.props.valsslow = eegmath.peakDetect(this.props.audSumSmoothedSlow,'valley',25);
            
                    this.props.peakslong = eegmath.peakDetect(this.props.audSumSmoothedLong,'peak',100);
                    this.props.valslong = eegmath.peakDetect(this.props.audSumSmoothedLong,'valley',100);
            
                    let l1 = this.props.longPeakTimes.length;
                    let slowThreshold = 0;
                    if(l1 > 1) {
                        this.props.peakThreshold = eegmath.getPeakThreshold(this.props.audSumSmoothedLong,this.props.peakslong,this.props.peakThreshold);
                        slowThreshold = eegmath.getPeakThreshold(this.props.audSumSmoothedSlow, this.props.peaksslow, 0);
                    }
                    
                    //console.log(slowThreshold,this.props.peakThreshold);
                    if((slowThreshold > this.props.peakThreshold) || (l1 < 2) || (this.props.inPeakTimes.length > 0)) { //volume check
                        if(this.props.output.belowThreshold === true) this.props.output.belowThreshold = false;
                        if(this.props.fastPeakTimes[this.props.fastPeakTimes.length-1] !== this.props.audTime[this.props.peaksfast[this.props.peaksfast.length-1]]) {
                            this.props.fastPeakTimes.push(this.props.audTime[this.props.peaksfast[this.props.peaksfast.length-1]]); // 2 peaks = 1 breath, can't tell in vs out w/ mic though
                            if(this.props.fastPeakTimes.length > 1) {
                                this.props.fastPeakDt = this.props.fastPeakTimes[this.props.fastPeakTimes.length-1] - this.props.fastPeakTimes[this.props.fastPeakTimes.length-2];
                            }
                        }
                        if(this.props.slowPeakTimes[this.props.slowPeakTimes.length-1] !== this.props.audTime[this.props.peaksslow[this.props.peaksslow.length-1]]) {
                            this.props.slowPeakTimes.push(this.props.audTime[this.props.peaksslow[this.props.peaksslow.length-1]]); //2-3 peaks between two long peaks = 1 breath. Calibrate accordingly
                        
                            let l = this.props.longPeakTimes.length;
                            let s = this.props.slowPeakTimes.length;
            
                            let latestSlow = this.props.audSumSmoothedSlow[this.props.peaksslow[this.props.peaksslow.length-1]];
                            let latestLong = this.props.audSumSmoothedLong[this.props.peakslong[this.props.peakslong.length-1]];
            
                            if((l > 1 && s > 2) || this.props.inPeakTimes.length > 0) {
                                if ((latestSlow > latestLong && (this.props.longPeakTimes[l-1] <= this.props.slowPeakTimes[s-1] || this.props.longPeakTimes[l-1]-this.props.slowPeakTimes[s-1] < 200)) || (this.props.inPeakTimes.length > 0 && this.props.outPeakTimes.length === 0)) {
                                    if(this.props.inPeakTimes[this.props.inPeakTimes.length-1] > this.props.outPeakTimes[this.props.outPeakTimes.length-1] || (this.props.inPeakTimes.length > 0 && this.props.outPeakTimes.length === 0)) {
                                        this.props.outPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.outPeakVolumes.push(latestSlow);
                                        this.props.inToOutTimes.push(this.props.slowPeakTimes[s-1]-this.props.inPeakVolumes[this.props.inPeakVolumes.length-1]);
                                        this.props.output.isHolding = false;
                                    } else if (this.props.inPeakTimes[this.props.inPeakTimes.length-1] < this.props.outPeakTimes[this.props.outPeakTimes.length-1] && this.props.inPeakTimes[this.props.inPeakTimes.length-1] < this.props.longPeakTimes[l-1]) {
                                        this.props.inPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.inPeakVolumes.push(latestSlow);
                                        this.props.output.isHolding = true;
                                    }
                                }
                            }
                        }
                        if(this.props.longPeakTimes[this.props.longPeakTimes.length-1] !== this.props.audTime[this.props.peakslong[this.props.peakslong.length-1]]) {
            
                            this.props.longPeakTimes.push(this.props.audTime[this.props.peakslong[this.props.peakslong.length-1]]); //1 big peak per breath, some smaller peaks
                            let placeholder = this.props.inPeakTimes[this.props.inPeakTimes.length-1];
                            if(placeholder == undefined) placeholder = Date.now();
                            let l = this.props.longPeakTimes.length;
                            let s = this.props.slowPeakTimes.length;
            
                            let latestSlow = this.props.audSumSmoothedSlow[this.props.peaksslow[this.props.peaksslow.length-1]];
                            let latestLong = this.props.audSumSmoothedLong[this.props.peakslong[this.props.peakslong.length-1]];
            
                            if(l > 1 && s > 2 && (latestSlow > latestLong) && ((this.props.inPeakTimes.length === 0 && this.props.outPeakTimes.length === 0) || Date.now() - placeholder > 20000)) { //only check again if 20 seconds elapse with no breaths captured to not cause overlaps and false positives
                                if((this.props.longPeakTimes[l-2] <= this.props.slowPeakTimes[s-2] || this.props.longPeakTimes[l-2]-this.props.slowPeakTimes[s-2] < 200) && (this.props.longPeakTimes[l-1] >= this.props.slowPeakTimes[s-1] || this.props.longPeakTimes[l-1]-this.props.slowPeakTimes[s-1] < 200)) {
                                    if(this.props.longPeakTimes[l-2] < this.props.slowPeakTimes[s-3]){
                                        this.props.inPeakTimes.push(this.props.slowPeakTimes[s-2]);
                                        this.props.outPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.inPeakVolumes.push(this.props.audSumSmoothedSlow[this.props.peaksslow[this.props.peaksslow.length-2]])
                                        this.props.outPeakVolumes.push(latestSlow);
                                        this.props.inToOutTimes.push(this.props.slowPeakTimes[s-1]-this.props.slowPeakTimes[s-2]);
                                    } else {
                                        this.props.inPeakTimes.push(this.props.slowPeakTimes[s-2]);
                                        this.props.outPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.inPeakVolumes.push(this.props.audSumSmoothedSlow[this.props.peaksslow[this.props.peaksslow.length-2]])
                                        this.props.outPeakVolumes.push(latestSlow);
                                        this.props.inToOutTimes.push(this.props.slowPeakTimes[s-1]-this.props.slowPeakTimes[s-2]);
                                    }
                                } else if (this.props.longPeakTimes[l-1] <= this.props.slowPeakTimes[s-1] || this.props.longPeakTimes[l-1]-this.props.slowPeakTimes[s-1] < 200) {
                                    if(this.props.inPeakTimes[this.props.inPeakTimes.length-1] > this.props.outPeakTimes[this.props.outPeakTimes.length-1]) {
                                        this.props.outPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.outPeakVolumes.push(latestSlow);
                                        this.props.inToOutTimes.push(this.props.slowPeakTimes[s-1]-this.props.inPeakTimes[this.props.inPeakTimes.length-1]);
                                    } else if (this.props.inPeakTimes[this.props.inPeakTimes.length-1] < this.props.outPeakTimes[this.props.outPeakTimes.length-1] && this.props.inPeakTimes[this.props.inPeakTimes.length-1] < this.props.longPeakTimes[l-1]) {
                                        this.props.inPeakTimes.push(this.props.slowPeakTimes[s-1]);
                                        this.props.inPeakVolumes.push(latestSlow);
                                    }
                                }
                            }
                        }
                    } else if (slowThreshold < this.props.peakThreshold) {
                        if(!this.props.output.belowThreshold) this.props.output.belowThreshold = true;
                    }
                    
                    // //FIX
                    // let foundidx = undefined;
                    // let found = this.props.inPeakTimes.find((t,k)=>{if(t > this.props.audTime[0]) {foundidx = k; return true;}});
                    // if(foundidx) {
                    //     let inpeakindices = []; let intimes = this.props.audTime.filter((o,z)=>{if(this.props.inPeakTimes.slice(this.props.inPeakTimes.length-foundidx).indexOf(o)>-1) {inpeakindices.push(z); return true;}})
                    //     this.props.inpeaks=inpeakindices;
                    //     let foundidx2 = undefined;
                    //     let found2 = this.props.outPeakTimes.find((t,k)=>{if(t > this.props.audTime[0]) {foundidx2 = k; return true;}});
                    //     if(foundidx2){ 
                    //         let outpeakindices = []; let outtimes = this.props.audTime.filter((o,z)=>{if(this.props.outPeakTimes.slice(this.props.outPeakTimes.length-foundidx2).indexOf(o)>-1) {outpeakindices.push(z); return true;}})
                    //         this.props.outpeaks=outpeakindices;
                    //     }
                    // }
                    // else { 
                    //     let inpeakindices = []; let intimes = this.props.audTime.filter((o,z)=>{if(this.props.inPeakTimes.indexOf(o)>-1) {inpeakindices.push(z); return true;}})
                    //     let outpeakindices = []; let outtimes = this.props.audTime.filter((o,z)=>{if(this.props.outPeakTimes.indexOf(o)>-1) {outpeakindices.push(z); return true;}})
                    //     this.props.inpeaks = inpeakindices;
                    //     this.props.outpeaks = outpeakindices
                    // }     
                    
                    this.session.graph.runSafe(this,'belowThreshold', [{data: true}])
                    this.session.graph.runSafe(this,'isHolding', [{data: true}])
                    this.session.graph.runSafe(this,'breathRate', [{data: true}])
                    this.session.graph.runSafe(this,'brv', [{data: true}])

                    return [{data: Math.sin(0.5 + 0.5*Date.now()), meta: {}}]
                }
            },
            calibrate: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: () => {
                    if(this.slowPeakTimes.length > 0) {
                        this.inPeakTimes = [this.slowPeakTimes[this.slowPeakTimes.length-1]];
                        this.outPeakTimes = [];
                        this.output.isHolding = true;
                    }
                }
            },
            belowThreshold: {
                default: false,
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return [{data: this.props.output.belowThreshold}]
                }
            },
            isHolding: {
                default: false,
                input: {type: null},
                output: {type: 'boolean'},
                onUpdate: () => {
                    return [{data: this.props.output.isHolding}]
                }
            },
            breathRate: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.output.breathRate}]
                }
            },
            brv: {
                default: [],
                input: {type: null},
                output: {type: 'array'},
                onUpdate: () => {
                    return [{data: this.props.output.brv}]
                }
            }
        }

        this.props = {
                    
            audfft : [],
            audsum : 0,
            
            peaksfast : [],
            valsfast : [],
            peaksslow : [],
            valsslow : [],
            peakslong : [],
            valslong : [],
            
            audSumGraph : new Array(1024).fill(0),
            audSumSmoothedFast : new Array(1024).fill(0),
            audSumSmoothedSlow : new Array(1024).fill(0),
            audSumSmoothedLong : new Array(1024).fill(0),
            audSpect : new Array(1024).fill(new Array(512).fill(0)),
            audTime : new Array(1024).fill(0),

            lastInPeak : 0,
            lastOutPeak : 0,
            
            fastPeakTimes : [],
            fastPeakDt : [],
            slowPeakTimes : [],
            longPeakTimes : [],

            peakThreshold : 0,

            inPeakVolumes : [],
            outPeakVolumes : [],
            inPeakTimes : [], //Timestamp of in-breath
            outPeakTimes : [], //Timestamp of out:breath
            inToOutTimes : [],
            breatingRate : [], //Avg difference between most recent breathing peaks
            breathingRateVariability : [], //Difference between breathing rates


            output: {}
        }
    }

    init = () => {}

    deinit = () => {}
}