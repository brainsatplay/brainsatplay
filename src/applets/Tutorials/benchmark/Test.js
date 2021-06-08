class Test{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            speed: {default: 3, min: 0, max:10, step: 0.01}
        }

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            target: {x: 0, y: 0},
            pointer: {x: 0, y: 0},
            canvas: null,
            context: null,
            container: null,
            size: {x: 25, y:25},
            direction: 1
        }

        // Port Definition
        this.ports = {
            default: {}
        }
    }

    init = () => {


        let display = ("show" in this.states) ? 'none' : 'flex'

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: ${display}; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <canvas id="${this.props.id}gameCanvas"></canvas>
            </div>`
        }

        let setupHTML = () => {

            // Canvas Stuff
            this.props.container = document.getElementById(`${this.props.id}`);
            this.props.canvas = document.getElementById(`${this.props.id}gameCanvas`);
            this.props.context = this.props.canvas.getContext("2d");
            this.responsive()

            // Animation Loop
            let animate = () => {

                // Update Variables
                this.props.pointer.x += this.params.speed * this.props.direction
                let leftEdge = this.props.canvas.width - this.props.size.x
                if (this.props.pointer.x > leftEdge){
                    this.props.pointer.x = leftEdge
                    this.props.direction *= -1
                } else if (this.props.pointer.x < 0){
                    this.props.pointer.x = 0
                    this.props.direction *= -1
                }
                this.props.pointer.y = (this.props.canvas.height - this.props.size.x)/2

                // Draw
                this._clearCanvas()
                this._drawPointer()
                this._drawTarget()
                setTimeout(animate, 1000/60) // 60 Loops/Second
            }
            animate()
     

        }

        return {HTMLtemplate, setupHTML}
    }

    responsive = () => {
        // let squareLength = Math.min(this.props.container.offsetHeight*.8, this.props.container.offsetWidth*.8)
        // this.props.canvas.width = squareLength
        // this.props.canvas.height = squareLength
        this.props.canvas.width = this.props.container.offsetWidth
        this.props.canvas.height = this.props.container.offsetHeight
        this._updateTargetPosition()
    }

    show = (userData) => {
        let show = userData[0].data
        if (show) document.getElementById(`${this.props.id}`).style.display = 'flex'
        this.responsive()
    }

    _updateTargetPosition = () => {
        this.props.target.x = Math.random() * (this.props.canvas.width - this.props.size.x)
        this.props.target.y = (this.props.canvas.height - this.props.size.x)/2
    }

    _drawPointer = () => {
        this.props.context.fillStyle = 'lightblue'
        this.props.context.strokeStyle = 'darkblue'
        this.props.context.fillRect(this.props.pointer.x, this.props.pointer.y,this.props.size.x, this.props.size.y)
        this.props.context.strokeRect(this.props.pointer.x, this.props.pointer.y, this.props.size.x, this.props.size.y)
    }

    _drawTarget = () => {
        this.props.context.strokeStyle = 'white'
        this.props.context.strokeRect(this.props.target.x, this.props.target.y,this.props.size.x, this.props.size.y)
    }

    _clearCanvas = () => {
        this.props.context.fillStyle = 'black';
        this.props.context.stokeStyle =  'white';
        this.props.context.fillRect(0,0, this.props.canvas.width,this.props.canvas.height)
        this.props.context.strokeRect(0,0, this.props.canvas.width,this.props.canvas.height)
    }

    default = (userData) => {
        return userData
    }

    click = (userData) => {

        // let choice
        // let choices = userData.map(u => u.data)
        // let allFloats = choices.reduce((a,b) => a * (typeof b == 'number' && !Number.isSafeInteger(b)), true)

        // // Output the Average for Floats
        // if (allFloats){
        //     choice = this.session.atlas.mean(choices)
        // } 

        // // Otherwise Output the Most Chosen Choice
        // else {
        //     choice = this.session.atlas.mode(choices)
        // }

        // Only Push Forward on Click = True

        userData = userData.filter(u => u.data === true)

        if (userData.length > 0){
            this._updateTargetPosition()
            this.session.atlas.graphs.runSafe(this,'performance',userData)
        }

        return userData
    }

    performance = (userData) => {
        return userData.filter(u => {
            if (u.data === true){
                u.data = Math.abs(this.props.pointer.x - this.props.target.x)
                u.meta.label = `${this.label}_distance`
                return true
            }
        })
    }

    deinit = () => {}
}

export {Test}