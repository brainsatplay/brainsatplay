class UI {

    static id = String(Math.floor(Math.random() * 1000000))

    constructor(label, session, params = {}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            paddles: [
                {username: 'me', x: 0, y: 0, score: 0},
                {username: 'opponent', x: 0, y: 0, score: 0},
            ],
            ball: {x: 0, y: 0, speed: 1, angle: 0, direction: 1, radius: 5},
            paddleOptions: {
                height: 75,
                width: 5
            },
            lastPaddleCollided: null
        }

        this.paramOptions = {
            difficulty: {default: 0.5, min: 0, max: 1, step: 0.01}
        }

        // Port Definition
        this.ports = {
            default: {},
            paddle: {}
        }
    }

    init = () => {

        let HTMLtemplate = () => {

            let h1Style = `
                padding: 0px 10px;
            `
            return `
            <div id='${this.props.id}' style='display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
                <canvas id="${this.props.id}gameCanvas" ></canvas>
                <div id="${this.props.id}scoreboard" style="position: absolute; top: 0; left; 0; display: flex;">
                    <h1 class="me" style="${h1Style}">0</h1>
                    <h1>|</h1>
                    <h1 class="opponent" style="${h1Style}">0</h1>
                <div>
            </div>`
        }


        let setupHTML = (app) => {

            const scoreboard =  document.getElementById(`${this.props.id}scoreboard`)
            const container = document.getElementById(`${this.props.id}`);
            const canvas = document.getElementById(`${this.props.id}gameCanvas`);
            const context = canvas.getContext("2d");
            canvas.width = container.offsetWidth
            canvas.height = container.offsetHeight

            this.props.lastPaddleCollided = this.props.paddles.find(o => {
                if (o.username === 'me'){
                    return true
                }
            })
            
            let margin = 25
            this.props.paddles.forEach((o,i) => {
                if (i == 0) o.x = margin
                else o.x = canvas.width - margin
                o.y = canvas.height/2
            })
            

            const drawPaddle = (paddle) => {
                context.fillStyle = 'white'
                // context.strokeStyle = 'white'
                let shiftedY = paddle.y - this.props.paddleOptions.height/2
                context.fillRect(paddle.x, shiftedY, this.props.paddleOptions.width, this.props.paddleOptions.height)
                context.strokeRect(paddle.x, shiftedY, this.props.paddleOptions.width, this.props.paddleOptions.height)
            }

            const drawBall = (ball) => {
                context.beginPath();
                context.arc(ball.x, ball.y, this.props.ball.radius, 0, Math.PI*2);
                context.fillStyle = "white";
                context.fill();
                context.closePath();
            }

            const reset = () => {
                this.props.paddles.forEach(o => {
                    let score = scoreboard.querySelector(`.${o.username}`)
                    if (score) score.innerHTML = o.score
                })

                this.props.ball.y = canvas.height/2
                this.props.ball.x = canvas.width/2
                this.props.ball.angle = 2*(Math.random() - 0.5)
            }

            const clearCanvas = () => {
                context.fillStyle = 'black';
                context.stokeStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height)
                context.strokeRect(0, 0, canvas.width, canvas.height)
            }

            const main = () => {
                setTimeout(() => {

                    clearCanvas()

                    // Move Ball
                    this.props.ball.x += this.props.ball.speed * this.props.ball.direction
                    this.props.ball.y += this.props.ball.angle


                    if (this.props.ball.y <= this.props.ball.radius || this.props.ball.y >= (canvas.height - this.props.ball.radius)){
                        this.props.ball.angle *= -1
                    }

                    drawBall(this.props.ball)

                    // Control Opponent AI
                    let opponent = this.props.paddles.find(o => {
                        if (o.username == 'opponent') return true
                    })

                    opponent.y += this.params.difficulty * Math.sign(this.props.ball.y - opponent.y)

                    this.props.paddles.forEach(drawPaddle);

                    let collision
                    this.props.paddles.forEach(o => {

                        // Check X
                        if (Math.abs(this.props.ball.x - o.x) < this.props.paddleOptions.width){

                            // Check Y
                            if (
                                this.props.ball.y <= o.y + this.props.paddleOptions.height/2 
                                && this.props.ball.y >= o.y - this.props.paddleOptions.height/2 
                            ) {
                                collision = true
                                this.props.lastPaddleCollided = o
                            }
                        }
                        
                    })


                    // Check Collision
                    if (collision){
                        this.props.ball.direction *= -1
                    }

                    // Check if Reset is Needed
                    if (this.props.ball.x < 0 || this.props.ball.x > canvas.width){
                        this.props.ball.direction *= -1
                        if (this.props.lastPaddleCollided) this.props.lastPaddleCollided.score++
                        reset()
                    }

                    main()
                }, 1000/60)
            }

            reset()
            main()
        }

        return { HTMLtemplate, setupHTML }
    }

    responsive = () => {
        const container = document.getElementById(`${this.props.id}`);
        const canvas = document.getElementById(`${this.props.id}gameCanvas`);
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
    }

    default = (userData) => {
        return userData
    }

    paddle = (userData) => {
        let choices = userData.map(u => Number(u.data))
        let mean = this.session.atlas.mean(choices)

        let paddle = this.props.paddles.find(o => {
            if (o.username == 'me') return true
        })

        // Update Paddle Position
        paddle.y += mean

        // Replace User Data with Mean
        userData = [{data: mean, meta: {label: `${this.label}_paddle]`}}]

        return userData
    }

    down = (userData) => {
        userData.forEach(u => {
            if (u.data === true) {
                this.props.dy = this.props.speed
                this.props.dx = 0
            }

        })
        return userData
    }

    left = (userData) => {
        userData.forEach(u => {
            if (u.data === true) {
                this.props.dx = -this.props.speed
                this.props.dy = 0
            }
        })
        return userData
    }

    right = (userData) => {
        userData.forEach(u => {
            if (u.data === true) {
                this.props.dx = this.props.speed
                this.props.dy = 0
            }
        })
        return userData
    }


    deinit = () => {

    }
}

export { UI }