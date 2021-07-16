import {SmoothieChartMaker} from '../../ui/eegvisuals'

export class TimeSeries{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            canvas: document.createElement('canvas'),
            helper: null,
            looping: false
        }

        this.props.canvas.onresize = this.responsive
        this.props.canvas.width = '100%'
        this.props.canvas.height = '100%'
        this.props.canvas.style.width = '100%'
        this.props.canvas.style.height = '100%'

        this.ports = {
            style: {
                default: 'smoothie',
                options: ['smoothie', 'uPlot'],
                input: {type: null},
                output: {type: null},
                onUpdate: (userData) => {
                    console.log('rerender')
                }
            },
            data: {
                edit: false,
                input: {type: 'number'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    console.log(u.data)
                    this.props.helper.bulkAppend([u.data])
                }
            },
            element: {
                default: this.props.canvas,
                input: {type: null},
                output: {type: Element},
                onUpdate: () => {
                    return [{data: this.props.canvas}]
                }
            }
        }
    }

    init = () => {
        this.props.helper = new SmoothieChartMaker(1, this.props.canvas);
        this.props.helper.init();
    }

    deinit = () => {
        this.props.canvas.remove()
        this.props.helper.deInit();
        this.props.helper = null;
    }

    responsive = () => {

        // Resize to parent
        // this.props.helper.canvas.width = this.props.helper.canvas.parentNode.clientWidth;
        // this.props.helper.canvas.height = this.props.helper.canvas.parentNode.clientHeight;
        // this.props.helper.canvas.style.width = this.props.helper.canvas.parentNode.clientWidth;
        // this.props.helper.canvas.style.height = this.props.helper.canvas.parentNode.clientHeight;
    }
}