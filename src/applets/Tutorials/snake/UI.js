class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            snake: [],
            dx: 0,
            dy: 0,
            speed: 10
        }

        // Port Definition
        this.ports = {
            default: {
                defaults: {
                    input: [{username: 'Username', value: 'Value', meta: {label: 'Waiting for Data'}}]
                },
                up: {},
                down: {},
                left: {},
                right: {}
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <canvas id="${this.props.id}gameCanvas" width="400" height="400" style="border: 1px solid white;" ></canvas>
            </div>`
        }


        let setupHTML = (app) => {

const canvas = document.getElementById(`${this.props.id}gameCanvas`);
const context = canvas.getContext("2d");

this.props.snake = [{
    x: Math.floor(400*Math.random()/10)*10, 
    y:Math.floor(400*Math.random() /10)*10    
}]
let initialGoal = {
    x: Math.floor(400*Math.random()/10)*10, 
    y:Math.floor(400*Math.random() /10)*10
}
let currentGoal = initialGoal;

const drawSnake = (segment) => {
    context.fillStyle = 'lightblue'
    context.strokeStyle = 'darkblue'
    context.fillRect(segment.x, segment.y, 10,10)
    context.strokeRect(segment.x, segment.y, 10,10)
}

const clearCanas = () => {
    context.fillStyle = 'black';
    context.stokeStyle =  'white';
    context.fillRect(0,0, canvas.width,canvas.height)
    context.strokeRect(0,0, canvas.width,canvas.height)
}

const drawSnack = (pos) => {
    context.fillStyle = 'red'
    context.strokeStyle = 'darkred'
    context.fillRect(pos.x, pos.y, 10,10)
    context.strokeRect(pos.x, pos.y, 10,10)    
}

const moveSnake = () => {
    let head = {
        x: this.props.snake[0].x + this.props.dx, 
        y: this.props.snake[0].y + this.props.dy
    }
    this.props.snake.unshift(head);
    this.props.snake.pop()
}

            const main =  () => {
            setTimeout(() => {
                clearCanas()
                drawSnack({x: currentGoal.x,y:currentGoal.y})
                this.props.snake.forEach(drawSnake);
                moveSnake()
                if(this.props.snake[0].x == currentGoal.x && this.props.snake[0].y == currentGoal.y){
                    this.props.snake.push({
                        x: currentGoal.x,
                        y: currentGoal.y
                    })
                    currentGoal = {x: Math.floor(400*Math.random()/this.props.speed)*this.props.speed, y:Math.floor(400*Math.random() /this.props.speed)*this.props.speed}
                    clearCanas()
                    drawSnack({x: currentGoal.x,y:currentGoal.y})
                    this.props.snake.forEach(drawSnake);
                    moveSnake()
                }
                if(this.props.snake[0].x >= 400){
                    this.props.snake[0].x = 0;
                }
                if(this.props.snake[0].x < 0){
                    this.props.snake[0].x = 400;
                }
                if(this.props.snake[0].y >= 400){
                    this.props.snake[0].y = 0;
                }
                if(this.props.snake[0].y < 0){
                    this.props.snake[0].y = 400;
                }
                main()
                },500)
            }

            main()

        }

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {
        return userData
    }

    up = (userData) => {
        userData.forEach(u => {
            this.props.dy = -this.props.speed
            this.props.dx = 0
        })
        return userData
    }

    down = (userData) => {
        userData.forEach(u => {
            this.props.dy = this.props.speed
            this.props.dx = 0

        })
        return userData
    }

    left = (userData) => {
        userData.forEach(u => {
            this.props.dx = -this.props.speed
            this.props.dy = 0
        })
        return userData
    }

    right = (userData) => {
        userData.forEach(u => {
            this.props.dx = this.props.speed
            this.props.dy = 0
        })
        return userData
    }
    

    deinit = () => {
        
    }
}

export {UI}