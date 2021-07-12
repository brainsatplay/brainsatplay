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
                {username: 'me', x: 0, y: 0, score: 0, color: 'rgb(255, 255, 255)'},
                {username: 'opponent', x: 0, y: 0, score: 0, color: 'rgb(255, 255, 255)'},
            ],
            ball: {x: 0, y: 0, angle: 0, direction: 1, radius: 8},
            paddleOptions: {
                height: 85,
                width: 10
            },
            gameOptions: {
                margin: 50,
            },
            canvas: null
        }

        this.paramOptions = {
            difficulty: {default: 0.5, min: 0, max: 1, step: 0.01},
            paddlespeed: {default: 5, min: 0, max: 25, step: 0.01},
            ballspeed: {default: 5, min: 0, max: 10, step: 0.01}
        }

        // Port Definition
        this.ports = {
            paddle: {
                output: {type: null}
            }
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
            this.props.canvas = document.getElementById(`${this.props.id}gameCanvas`);
            const context = this.props.canvas.getContext("2d");
            this.props.canvas.width = container.offsetWidth
            this.props.canvas.height = container.offsetHeight

            let margin = 25
            this.props.paddles.forEach((o) => {
                if (o.username === 'me') o.x = this.props.gameOptions.margin
                else o.x = this.props.canvas.width - this.props.gameOptions.margin
                o.y = this.props.canvas.height/2
            })
            

            const drawPaddle = (paddle) => {
                context.fillStyle = paddle.color

                // Update Color
                var regExp = /\(([^)]+)\)/;
                var paddleRGB = regExp.exec(paddle.color)[1].split(',');
                paddleRGB = paddleRGB.map(c => {
                    c = Number.parseFloat(c)
                    c += 2.5 * Math.sign(255 - c)
                    return c
                })
                paddle.color = `rgb(${paddleRGB.join(',')})`


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

                this.props.ball.y = this.props.canvas.height/2
                this.props.ball.x = this.props.canvas.width/2
                this.props.ball.angle = 2*Math.PI*(Math.random() - 0.5)
            }

            const clearCanvas = () => {
                context.fillStyle = 'black';
                context.stokeStyle = 'white';
                context.fillRect(0, 0, this.props.canvas.width, this.props.canvas.height)
                context.strokeRect(0, 0, this.props.canvas.width, this.props.canvas.height)
            }

            const main = () => {
                setTimeout(() => {

                    clearCanvas()

                    // Move Ball
                    this.props.ball.x += this.params.ballspeed * this.props.ball.direction
                    this.props.ball.y += this.props.ball.angle

                    // Check Bounce Off Walls
                    if (this.props.ball.y <= this.props.ball.radius || this.props.ball.y >= (this.props.canvas.height - this.props.ball.radius)) this.props.ball.angle *= -1

                    drawBall(this.props.ball)

                    // Control Opponent AI
                    let opponent = this.props.paddles.find(o => {if (o.username == 'opponent') return true})
                    this._movePaddle(opponent, (this.params.difficulty) * this.params.ballspeed * Math.sign(this.props.ball.y - opponent.y))

                    // Draw All Paddles
                    this.props.paddles.forEach(drawPaddle);

                    // Check Collision
                    this.props.paddles.forEach(o => {

                        // Check X
                        let extra = 0
                        if (o.username === 'me') extra = this.props.paddleOptions.width
                        if (Math.abs(this.props.ball.x - o.x) <= this.props.paddleOptions.width + extra){

                            let yDist = this.props.ball.y-o.y
                            // Check Y
                            if (Math.abs(yDist) <= this.props.paddleOptions.height/2 ) {
                                this.props.ball.direction *= -1
                                this.props.ball.angle = 2*Math.PI*yDist/(this.props.paddleOptions.height/2)
                                o.color = `rgb(129, 218, 250)`
                            }
                        }
                        
                    })

                    // Check if Reset is Needed
                    if (this.props.ball.x < 0 || this.props.ball.x > this.props.canvas.width){
                        let sign = Math.sign(this.props.ball.direction)
                        let winningPaddle;
                        if (sign === 1){
                            winningPaddle = this.props.paddles.find(o => {if (o.username === 'me') return true})
                        } else {
                            winningPaddle = this.props.paddles.find(o => {if (o.username !== 'me') return true})
                        }
                        winningPaddle.score++

                        this.props.ball.direction *= -1
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

    _movePaddle = (paddle, dy) => {
        let upper = paddle.y + this.props.paddleOptions.height/2 + dy
        let lower = paddle.y - this.props.paddleOptions.height/2 + dy
        if (upper < this.props.canvas.height &&  lower > 0) paddle.y += dy
    }

    responsive = () => {
        const container = document.getElementById(`${this.props.id}`);
        if (container) {

            // Map to New Positions
            this.props.paddles.forEach(o => {
                if (o.username === 'opponent') o.x = this.props.canvas.width - this.props.paddleOptions.width - this.props.gameOptions.margin
                o.y = container.offsetHeight*(o.y/this.props.canvas.height)
            })

            this.props.canvas.width = container.offsetWidth
            this.props.canvas.height = container.offsetHeight

        }
    }

    paddle = (userData) => {
        let choices = userData.map(u => Number(u.data))
        let mean = this.session.atlas.mean(choices)

        let paddle = this.props.paddles.find(o => {if (o.username == 'me') return true})

        // Update Paddle Position
        this._movePaddle(paddle,mean*this.params.paddlespeed)

        // Replace User Data with Mean
        userData = [{data: mean, meta: {label: `${this.label}_paddle]`}}]

        return userData
    }

    deinit = () => {

    }
}

export { UI }