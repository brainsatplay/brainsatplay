// import '../../../libraries/js/src/ui/plotly.min.js'

import 'https://cdn.plot.ly/plotly-2.0.0.min.js'

class Plot{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            mode: {default: 'Channels', options: ['Channels','Trials']}
        }

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            container: null,
            plotConfig: {responsive: true},
            plotLayout: {
                title: 'Your Data',
                xaxis: {
                  autorange: true,
                  rangeselector: {buttons: [
                      {step: 'all'}
                    ]},
                  rangeslider: {},
                  type: 'time',
                  rangemode: 'nonnegative'
                },
                yaxis: {
                  autorange: true,
                  type: 'linear'
                }
            },
            userData: []
        }

        // Port Definition
        this.ports = {
            default: {}
        }
    }

    init = () => {


        let display = ("show" in this.states) ? 'none' : 'block'

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: ${display}; width: 100%; height: 100%; opacity: 0; transition: opacity 1s;'>
            </div>`
        }

        let setupHTML = () => {

            this.props.container = document.getElementById(`${this.props.id}`)
            Plotly.newPlot( this.props.container, [{
            x: [],
            y: [] }], 
            this.props.plotLayout, 
            this.props.plotConfig);

            // Animation Loop
            let prevState = this.params.mode
            let animate = () => {
                if (this.params.mode != prevState){
                    Plotly.purge(this.props.container)
                    this.session.graphs.runSafe(this,'default',this.props.userData)
                    prevState = this.props.mode
                }
                setTimeout(animate, 1000/2)
            }
            animate()
        }

        return {HTMLtemplate, setupHTML}
    }

    responsive = () => {
    }

    show = (userData) => {
        let show = userData[0].data
        if (show) this.props.container.style.display = 'flex'
        return [{data: true, meta: {label: `${this.label}_show`, params: {mode: 'Manual', trialProgression: null, trialTypes: ['Blink Left', 'Blink Right', 'Blink Both']}}}]
    }

    default = (userData) => {

        this.props.userData = userData
        let u = userData[0]

        let data = u.data.data

        let query
        if (u.meta.label.includes('fitbit')){
            query = `-intraday`
        } else {
            query = `_signal`
        }
        let states = Object.keys(data).filter(s => {
            if (s.includes(query)) return s
        })

        if (u.meta.label.includes('fitbit')){
            let newData = {times: [],notes: ['scheduler Dinner', 'scheduler ITI'], noteTimes: [60*18, 60*19], noteIndices: [null,null]}

            states.forEach(s => {
                let messyData = data[s][`activities-${s}`].dataset
                newData[s] = []
                messyData.forEach((o,i) => {
                    newData.times.push(i)
                    newData[s].push(o.value)
                })
            })

            data = newData
        }

        let traces = []
        let timestamps = data.times
        let tStart = timestamps[0]
        timestamps = timestamps.map(t => t - tStart)

        // Declare Points for Text
        // let trace2 = {
        //     x: [],
        //     y: [],
        //     mode: 'text',
        //     text: [],
        //     name: 'Trial Type',
        //     yref: 'paper',
        //     textfont: {
        //         color: 'black',
        //         size: 15,
        //         family: 'Montserrat'
        //     }
        // };

        let shapes = []

        let getTrialInfo = (data) => {
            let trials = []
            let done = false
            data.notes.forEach((n,i) => {
                if (n.includes('scheduler') && !done){
                    if (trials.length > 0 && (n.includes('ITI') || n.includes('Done'))){
                        trials[trials.length - 1].end.time = data.noteTimes[i] - tStart
                        trials[trials.length - 1].end.idx = data.noteIndices[i]
                        // let trialLength = trials[trials.length - 1].end.time - trials[trials.length - 1].start.time
                        // trace2.x.push(trials[trials.length - 1].start + trialLength/2)
                        // trace2.y.push(10000)
                        // trace2.text.push(trials[trials.length - 1].label)
                        if (n.includes('Done')) done = true
                    } else if (!n.includes('ITI') && !n.includes('Done')){
                        trials.push({label: n.replace('scheduler ', ''), start: {
                            time: data.noteTimes[i] - tStart,
                            idx: data.noteIndices[i]
                        }, end: {}})
                    }
                }
            })
            return trials
        }

        let trials = getTrialInfo(data)

        // Use EEG Channels or Trials
        if (this.params.mode === 'Trials'){
            let s = states[0]
            let stateData = data[s]

            let extractTrialsFromData = (data, time, trialInfo) => {
                return trialInfo.map(o => {
                    return {label: o.label, data: data.slice(o.start.idx,o.end.idx+1), time: time.slice(o.start.idx,o.end.idx+1)}
                })
            }

            trials = extractTrialsFromData(stateData, timestamps, trials)
        }

        if (this.params.mode === 'Trials'){
            trials.forEach((trial,i) => {
                traces.push({
                    x: trial.time.map(t => t - trial.time[0]),
                    y: trial.data,
                    // xaxis: `x${i+1}`,
                    // yaxis: `y${i+1}`,
                    type: 'line',
                    name: `Trial ${i} | ${trial.label}`
                })
            })
        } else {

            states.forEach((s,i) => {
                let stateData = data[s]
                traces.push({
                    x: timestamps,
                    y: stateData,
                    // xaxis: `x${i+1}`,
                    // yaxis: `y${i+1}`,
                    type: 'line',
                    name: s.replace(query,'')
                })
            })

            trials.forEach(event => {
                shapes.push({
                    type: 'rect',
                    xref: 'x',
                    yref: 'paper',
                    x0: event.start.time,
                    y0: 0,
                    x1: event.end.time,
                    y1: 1,
                    fillcolor: '#a3a3a3',
                    opacity: 0.2,
                    line: {
                        width: 0
                    }
                })
            })
        }

        let layoutConfig
        if (this.params.mode === 'Trials'){
            // this.props.plotLayout.grid = {
            //     rows: trials.length,
            //     columns: 1,
            //     pattern: 'coupled',
            //     roworder: 'bottom to top'
            // }

        } else {
            layoutConfig = Object.assign(this.props.plotLayout, {shapes})
            // this.props.plotLayout.shapes = shapes
        }

        // traces.push(trace2)

        Plotly.react( this.props.container, traces, 
            layoutConfig, 
        this.props.plotConfig );

        this.props.container.style.opacity = 1

        return userData
    }

    deinit = () => {}
}

export {Plot}