class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }

        // Port Definition
        this.ports = {
            default: {
                defaults: {
                    input: [{username: 'Username', value: 'Value', meta: {label: 'Waiting for Data'}}]
                }
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

let snake = [{
    x: Math.floor(400*Math.random()/10)*10, 
    y:Math.floor(400*Math.random() /10)*10    
}]
let initialGoal = {
    x: Math.floor(400*Math.random()/10)*10, 
    y:Math.floor(400*Math.random() /10)*10
}
let currentGoal = initialGoal;
let dx= 10
let dy= 0
const modifyValsX = x => dx=x;
const modifyValsY = y => dy=y;
// export {dx, dy,modifyValsY,modifyValsX}


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
        x: snake[0].x + dx, 
        y: snake[0].y + dy
    }
    snake.unshift(head);
    snake.pop()
}

            const main =  () => {
            setTimeout(() => {
                clearCanas()
                drawSnack({x: currentGoal.x,y:currentGoal.y})
                snake.forEach(drawSnake);
                moveSnake()
                if(snake[0].x == currentGoal.x && snake[0].y == currentGoal.y){
                    snake.push({
                        x: currentGoal.x,
                        y: currentGoal.y
                    })
                    currentGoal = {x: Math.floor(400*Math.random()/10)*10, y:Math.floor(400*Math.random() /10)*10}
                    clearCanas()
                    drawSnack({x: currentGoal.x,y:currentGoal.y})
                    snake.forEach(drawSnake);
                    moveSnake()
                }
                if(snake[0].x >= 400){
                    snake[0].x = 0;
                }
                if(snake[0].x < 0){
                    snake[0].x = 400;
                }
                if(snake[0].y >= 400){
                    snake[0].y = 0;
                }
                if(snake[0].y < 0){
                    snake[0].y = 400;
                }
                main()
                },500)
            }

            document.addEventListener('keydown', (e) => {
                e.preventDefault()
                switch(e.code){
                    case "ArrowUp":
                        dx = 0,
                        dy = -10
                        break;
                    case "ArrowDown":
                        dx = 0,
                        dy = 10
                        break;
                    case "ArrowLeft":
                        dx=-10,
                        dy=0
                        break;
                    case "ArrowRight":
                        dx=10,
                        dy=0
                        break;
                    }
            })

            main()



        }

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {
        return userData
    }

    deinit = () => {
        
    }
}

export {UI}