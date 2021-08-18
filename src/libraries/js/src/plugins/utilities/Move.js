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
                input: {type: 'boolean'},
                output: {type: null},
            },
            down: {
                input: {type: 'boolean'},
                output: {type: null},
            },
            left: {
                input: {type: 'boolean'},
                output: {type: null},
            },
            right: {
                input: {type: 'boolean'},
                output: {type: null},
            },
            // x: {},
            // y: {},
            dx: {
                input: {type: 'number'},
                output: {type: 'number'},
            },
            dy: {
                input: {type: 'number'},
                output: {type: 'number'},
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
                if (this.props.right) this.session.atlas.graph.runSafe(this,'right',{data: true})
                if (this.props.left) this.session.atlas.graph.runSafe(this,'left',{data: true})
                if (this.props.up) this.session.atlas.graph.runSafe(this,'up',{data: true})
                if (this.props.down) this.session.atlas.graph.runSafe(this,'down',{data: true})
                setTimeout(() => {animate()}, 1000/60)
            }
        }
    
        animate()
    }

    deinit = () => {
        this.props.looping = false
    }

    right = (user) => {
        if (user) this._getDecision(user, 'right')
        if (this.props['right']) this._move(this.params.speed,0)
        return user
    }

    left = (user) => {
        if (userData) this._getDecision(user, 'left')
        if (this.props['left']) this._move(-this.params.speed,0)
        return user
    }

    up = (user) => {
        if (user) this._getDecision(user, 'up')
        if (this.props['up']) this._move(0,-this.params.speed)
    }

    down = (user) => {
        if (user) this._getDecision(user, 'down')
        if (this.props['down']) this._move(0,this.params.speed)
    }

    dx = (user) => {
        let mean = this._getMean(user)

        this.props.dx = mean
        return user
    }

    dy = (user) => {
        let mean = this._getMean(user)
        this.props.dy = mean
        return user
    }

    _getDecision(user, command){
        let mean = this._getMean(user)
        let decision = (mean >= 0.5)
        if (command) this.props[command] = decision
        return decision
    }

    _getMean(user){
        return Number(user.data)
    }

    _move(dx,dy){
        // let desiredX = this.props.x + dx
        // let desiredY = this.props.y + dy
        // this.props.x = desiredX
        // this.props.y = desiredY
        this.session.atlas.graph.runSafe(this,'dx',{data: dx, forceUpdate: true})
        this.session.atlas.graph.runSafe(this,'dy',{data: dy, forceUpdate: true})
    }

    responsive = () => {

    }

}