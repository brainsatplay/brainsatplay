export class Move{
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params
        this.paramOptions = {
            speed: {default: 1, min: 0, max: 10, step: 0.01},
        }

        this.ports = {
            up: {
                types: {
                    in: 'boolean',
                    out: 'number',
                }
            },
            down: {
                types: {
                    in: 'boolean',
                    out: 'number',
                }
            },
            left: {
                types: {
                    in: 'boolean',
                    out: 'number',
                }
            },
            right: {
                types: {
                    in: 'boolean',
                    out: 'number',
                }
            },
            // x: {},
            // y: {},
            dx: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
            dy: {
                types: {
                    in: 'number',
                    out: 'number',
                }
            },
        }

        this.props = {
            right: false,
            left: false,
            up: false,
            down: false,
            looping: false,
            x: 0,
            y: 0,
            dx:0,
            dy: 0
        }
    }

    init = () => {
        this.props.looping = true
        let animate = () => {
            if (this.props.looping){
                if (this.props.right) this.session.atlas.graph.runSafe(this,'right',[{data: true}])
                if (this.props.left) this.session.atlas.graph.runSafe(this,'left',[{data: true}])
                if (this.props.up) this.session.atlas.graph.runSafe(this,'up',[{data: true}])
                if (this.props.down) this.session.atlas.graph.runSafe(this,'down',[{data: true}])
                setTimeout(() => {animate()}, 1000/60)
            }
        }
    
        animate()
    }

    deinit = () => {
        this.props.looping = false
    }

    default = () => {}

    right = (userData) => {
        if (userData) this._getDecision(userData, 'right')
        if (this.props['right']) this._move(this.params.speed,0)
        return userData
    }

    left = (userData) => {
        if (userData) this._getDecision(userData, 'left')
        if (this.props['left']) this._move(-this.params.speed,0)
        return userData
    }

    up = (userData) => {
        if (userData) this._getDecision(userData, 'up')
        if (this.props['up']) this._move(0,-this.params.speed)
        return userData
    }

    down = (userData) => {
        if (userData) this._getDecision(userData, 'down')
        if (this.props['down']) this._move(0,this.params.speed)
        return userData
    }

    dx = (userData) => {
        let mean = this._getMean(userData)

        this.props.dx = mean
        return userData
    }

    dy = (userData) => {
        let mean = this._getMean(userData)
        this.props.dy = mean
        return userData
    }

    _getDecision(userData, command){
        let mean = this._getMean(userData)
        if (command) this.props[command] = (mean >= 0.5)
        return (mean >= 0.5)
    }

    _getMean(userData){
        let choices = userData.map(u => Number(u.data))
        return this.session.atlas.mean(choices)
    }

    _move(dx,dy){
        // let desiredX = this.props.x + dx
        // let desiredY = this.props.y + dy
        // this.props.x = desiredX
        // this.props.y = desiredY
        this.session.atlas.graph.runSafe(this,'dx',[{data: dx}])
        this.session.atlas.graph.runSafe(this,'dy',[{data: dy}])
        // this.session.atlas.graph.runSafe(this,'x',[{data: this.props.x}])
        // this.session.atlas.graph.runSafe(this,'y',[{data: this.props.y}])
    }

    responsive = () => {

    }

}