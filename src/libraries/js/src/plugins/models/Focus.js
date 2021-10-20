
export class Focus {

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph) {
        
        
        
        
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            canvas: null,
            looping: false,
            container: document.createElement('div'),
            alphaAvg: 0,
            betaAvg: 0
        }

        this.props.container.id = this.props.id
        this.props.container.style = 'display: none; align-items: center; justify-content: center; width: 100%; height: 150px; padding: 10px; box-sizing: content-box;'
        this.props.canvas = document.createElement('canvas')
        this.props.container.insertAdjacentElement('beforeend',this.props.canvas)
        this.props.context = this.props.canvas.getContext("2d");


        this.ports = {
            default: {
                edit: false,
                analysis: ['eegcoherence'],
                data: undefined,
                input: {type: Object, name: 'DataAtlas'},
                output: {type: 'boolean'},
                onUpdate: (user) => {

                    // Algorithm from https://www.sunwangshu.com/portfolio/dark-maze/. Special thanks to Leonardo Ferrisi for the idea!
                    let alpha = []
                    let beta = []

                    let frontalData = this.session.atlas.getFrontalData(user.data)

                    frontalData.forEach(o => {
                        alpha.push(o.means.alpha1[o.fftCount - 1], o.means.alpha2[o.fftCount - 1])
                        beta.push(o.means.beta[o.fftCount - 1])
                    })

                    this.props.alphaAvg = this.session.atlas.mean(alpha)
                    this.props.betaAvg = this.session.atlas.mean(beta)

                    let data = (this.props.alphaAvg > this.ports.alphaMin.data && this.props.alphaAvg < this.ports.alphaMax.data && this.props.betaAvg < this.ports.betaMax.data) ? true : false

                    return {data}
                }
            },

            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            },

            debug: {data: false},
            alphaMin: {data: 0.7},
            alphaMax: {data: 4},
            // betaMin: {data: null},
            betaMax: {data: 0.7},

        }
    }

    init = () => {

        this.props.looping = true
        this._animate()

    }

    deinit = () => {
        this.props.looping = false
    }

    _animate = () => {
        this._clearCanvas()
        if (this.props.looping){
            if (this.ports.debug.data){
                this.props.container.style.display = 'flex'
                this._drawSignal(this.props.context)
            } else {
                this.props.container.style.display = 'none'
            }
            setTimeout(this._animate, 1000/60)
        }
    }

    _drawSignal = (ctx) => {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let rectLength = width / 2

        // SPLIT SIDES
        let signals = ['alpha', 'beta']
        signals.forEach((str,i) => {

            let upperBound = this.ports[`${str}Max`].data

            let max = upperBound * 1.5
            let min = 0

            let lowerBound = this.ports[`${str}Min`]?.data ?? 0
            let lbpct = (lowerBound - min) / max
            let ubpct = (upperBound - min) / max

            let pct = (this.props[`${str}Avg`] - min) / max

            let inside = pct > lbpct && pct < ubpct

            // Gauge
            ctx.beginPath(); // Draw a new path
            let width = rectLength/4
            let base = rectLength*i + width/2
            let left = base + rectLength/4
            ctx.rect(left, height, width, -height);
            ctx.strokeStyle = `#ffffff`;
            // ctx.rect = `#ffffff`;
            ctx.stroke(); // Draw

            // Correct Space
            ctx.beginPath(); // Draw a new path
            ctx.rect(left, (1-lbpct)*height, width, -(ubpct-lbpct)*height);
            if (inside) ctx.fillStyle = `#00ff00`; 
            else ctx.fillStyle = `#ff0000`; 
            // ctx.lineWidth = Number.parseFloat(2)
            ctx.fill(); // Draw

            // Current Line
            ctx.beginPath(); // Draw a new path
            ctx.lineTo(left, height*(1-pct))
            ctx.lineTo(left + width, height*(1-pct))
            ctx.stroke(); // Draw

        })

    }

    _clearCanvas = () => {
        this.props.context.fillStyle = 'black';
        this.props.context.stokeStyle = 'white';
        this.props.context.fillRect(0, 0, this.props.canvas.width, this.props.canvas.height)
        // this.props.context.strokeRect(0, 0, this.props.canvas.width, this.props.canvas.height)
    }
}