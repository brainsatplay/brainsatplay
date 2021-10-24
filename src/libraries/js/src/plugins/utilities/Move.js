

export class Move {
    
    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, graph) {
        
        
        

        this.ports = {
            up: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (user) this._getDecision(user, 'up')
                    if (this.props['up']) this._move(0,-this.ports.speed.data)
                }
            },
            down: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (user) this._getDecision(user, 'down')
                    if (this.props['down']) this._move(0,this.ports.speed.data)
                }
            },
            left: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (user) this._getDecision(user, 'left')
                    if (this.props['left']) this._move(-this.ports.speed.data,0)
                    return user
                }
            },
            right: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (user) this._getDecision(user, 'right')
                    if (this.props['right']) this._move(this.ports.speed.data,0)
                    return user
                }
            },
            // x: {},
            // y: {},
            dx: {
                input: {type: 'number'},
                output: {type: 'number'},
                onUpdate: (user) => {
                    let mean = this._getMean(user)
            
                    this.props.dx = mean
                    return user
                }
            },
            dy: {
                input: {type: 'number'},
                output: {type: 'number'},
                onUpdate: (user) => {
                    let mean = this._getMean(user)
                    this.props.dy = mean
                    return user
                }
            },
            speed: {
                data: 1, 
                min: 0, 
                max: 10, 
                step: 0.01,
                input: {type: 'number'},
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
                if (this.props.right) this.update('right',{data: true})
                if (this.props.left) this.update('left',{data: true})
                if (this.props.up) this.update('up',{data: true})
                if (this.props.down) this.update('down',{data: true})
                setTimeout(() => {animate()}, 1000/60)
            }
        }
    
        animate()
    }

    deinit = () => {
        this.props.looping = false
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
        this.update('dx',{data: dx, forceUpdate: true})
        this.update('dy',{data: dy, forceUpdate: true})
    }

    responsive = () => {

    }

}