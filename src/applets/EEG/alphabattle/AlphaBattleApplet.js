import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import p5 from 'p5';
import * as settingsFile from './settings'


//Example Applet for integrating with the UI Manager
export class AlphaBattleApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
        };

         //-------Required Multiplayer Properties------- 
        this.subtitle = 'A Simple Fighting Game'
        this.graph.streams = ['defense', 'keysPressed','position', 'fireballs', 'health']
        //----------------------------------------------


        // Multiplayer State Management
        this.states = {
            dynamic: {},
            static: {}
        }

        this.stateIds = []
        this.resetGame()

        // Visualization

        this.sketch = null;
        this.generatorFuncs = [
            {
                name: 'Circle',
                start: (p) => {
                    const containerElement = document.getElementById(this.props.id);

                    let drawPlayer = (data) => {

                        let diameter = p.width/50 // px

                        let basePos = {};
                        let arcRotation = 0;
                        if (data.username === this.session.info.auth.username){
                            basePos.x = p.width*data.position.x
                            p.textAlign(p.RIGHT, p.CENTER)
                        } else {
                            basePos.x = p.width*(1-data.position?.x)
                            arcRotation = Math.PI
                            p.textAlign(p.LEFT, p.CENTER)
                        }
                        basePos.y = p.height*(1-data.position?.y)

                        // Player
                        p.fill('white')
                        p.noStroke()
                        p.ellipse(basePos.x, basePos.y, diameter)

                        // Text
                        p.fill('white')
                        p.noStroke()
                        p.text(data.username, basePos.x - diameter, basePos.y)

                        // Fireballs
                        p.noStroke()
                        p.fill('red')
                        if (data.fireballs){
                            data.fireballs.array.forEach(ball => {
                                let ballPosX;
                                if (data.username === this.session.info.auth.username){
                                    ballPosX = basePos.x + (p.width - data.position?.x)*ball.velocity*(Date.now() - ball.spawnTime)
                                } else {
                                    ballPosX = basePos.x - (p.width - data.position?.x)*ball.velocity*(Date.now() - ball.spawnTime)
                                    if (Math.sqrt(Math.pow(this.position.x - ballPosX,2) +  Math.pow(this.position.y - ball.y,2))){
                                        if (this.health.percentage > 0) this.health.percentage -= 0.0001
                                        else this.health.percentage = 0
                                    }
                                }
                                p.ellipse(ballPosX, p.height*(1-ball.y), diameter/5)
                            })
                        }

                        // Shield
                        let c = p.color(0,155,255)
                        c.setAlpha((255*10*data.defense))
                        p.stroke(c)
                        p.noFill()
                        p.strokeWeight(Math.max(1,diameter/10));
                        p.arc(basePos.x, basePos.y, 2*diameter, 2*diameter, -Math.PI/4 + arcRotation, Math.PI/4 + arcRotation);

                        // Health
                        p.noFill()
                        p.stroke('white')
                        p.strokeWeight(1);
                        p.rect(basePos.x - diameter, basePos.y + diameter, 2*diameter, diameter/5)
                        if (data.health?.percentage === 0) {this.gameOver = true}
                        p.fill(255*(1-data.health?.percentage),200*data.health?.percentage,255*data.health?.percentage)
                        p.rect(basePos.x - diameter, basePos.y + diameter, 2*diameter*data.health?.percentage, diameter/5)
                    }

                    let getLocalData = () => {
                        return {
                            position: {
                                x: this.position.x,
                                y: this.position.y
                            },
                            username: this.session.info.auth.username,
                            defense:  Math.max(0,this.getCoherence('beta')),
                            fireballs: this.fireballs,
                            health: this.health
                        }
                    }

                    p.setup = () => {
                        p.createCanvas(containerElement.clientWidth, containerElement.clientHeight);
                        p.background(0);
                    };
                
                    p.draw = () => {

                        p.background(0);
                        p.textAlign(p.CENTER)

                        if (this.animate) {

                        // Death Text
                        if (this.gameOver || this.health.percentage === 0){
                            p.textAlign(p.CENTER)
                            p.noStroke()
                            p.fill('white')
                            if (this.health.percentage === 0){
                                p.text('Ope. You Died.', p.width/2, p.height/2)
                            } else{
                                p.text('Congratulations. You Won!', p.width/2, p.height/2)
                            }
                            this.fireballs.array = []

                            setTimeout(() => {
                                let exitButton = document.getElementById(`${this.props.id}exitGame`)
                                if (exitButton) exitButton.click()
                            }, 1000)

                            setTimeout(() => {this.animate = false;this.resetGame()},2000)
                        }
                        else {

                        // Jump
                        if (this.keysPressed.up.lastOn != null){
                            let timeElapsed = Date.now() - this.keysPressed.up.lastOn
                            if (timeElapsed < 1000){
                                this.position.y = 0.5 + (0.1*Math.sin(Math.PI * timeElapsed/ 1000))
                            } else {
                                if (this.keysPressed.up.pressed == true) this.keysPressed.up.lastOn = Date.now()
                                this.position.y = 0.5;
                            }
                        }

                        // Spawn Fireballs
                        let alphaChangePositive = Math.max(0,this.getCoherence('alpha1'))

                        if (alphaChangePositive > 0.2){
                            this.fireballs.array.push({velocity: 0.0005, spawnTime: Date.now(), y: this.position.y})
                        }

                        this.fireballs.array.forEach((b,i) => {
                            let pos = b.velocity * (Date.now() - b.spawnTime)
                            if (pos > 1){
                                this.fireballs.array.splice(i,1)
                            }
                        })
                        


                        // Draw
                        let userData = this.session.getBrainstormData(this.info.name, this.streams)
                        userData.forEach((data)=> drawPlayer(data))
                         }
                        };
                        }
                    },
                stop: () => {

                }
            },
        ]
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 

            this.buttonStyle = `
            box-sizing: border-box; 
            min-height: 50px;
            flex-grow: 1;
            width: 200px;
            position: relative;
            padding: 5px;
            border-radius: 5px;
            font-size: 80%;
            background: transparent;
            color: white;
            border: 1px solid rgb(200, 200, 200);
            text-align: left;
            transition: 0.5s;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px;
        `


            return `
                <div id='${props.id}' style='height:100%; width:100%; position:relative; display: flex;'>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.session.createIntro(this)
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.

        this.movementScaling = 0.01
        document.addEventListener('keydown',(k => {
            // if (k.keyCode === 32) { 
            if (k.keyCode === 38 && this.keysPressed.up.pressed != true) { // Up 
                this.keysPressed.up.pressed = true
                this.keysPressed.up.lastOn = Date.now()
            }

            // if (this.position.x < 0.9) this.position.x += this.movementScaling*(k.keyCode === 39 ? 1 : 0) // Right 
            // else this.position.x = 0.9

            // if (this.position.x > 0.1) this.position.x -= this.movementScaling*(k.keyCode === 37 ? 1 : 0) // Left
            // else this.position.x = 0.1

            // if (this.position.y < 0.9) this.position.y += this.movementScaling*(k.keyCode === 38 ? 1 : 0) // Up 
            // else this.position.y = 0.9

            // if (this.position.y > 0.1) this.position.y -= this.movementScaling*(k.keyCode === 40 ? 1 : 0) // Down
            // else this.position.y = 0.1

        }))

        document.addEventListener('keyup',(k => {
            if (k.keyCode === 38) this.keysPressed.up.pressed = false
        }))

        // Set a dynamic property for your location

        this.stateIds.push(this.session.streamAppData('position', this.position,(newData) => {}))

        this.stateIds.push(this.session.streamAppData('keysPressed', this.keysPressed,(newData) => {}))

        this.stateIds.push(this.session.streamAppData('fireballs', this.fireballs,(newData) => {}))


        this.stateIds.push(this.session.streamAppData('health', this.health,(newData) => {}))



        this.getCoherence = (band) => {
            return this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),band)
        }

        // Set Up Combat Variables
        this.session.addStreamFunc(
            'defense', 
            () => {
                return Math.max(0,this.getCoherence('beta'));
            }
        )

        // Animate    
        const containerElement = document.getElementById(this.props.id);
        this.generatorFunction = this.generatorFuncs[0]
        this.sketch = new p5(this.generatorFunction.start, containerElement) // Or basic animation loop
    
    }

    resetGame() {

        this.gameOver = false

        this.keysPressed = {
            up: {
                pressed: false,
                lastOn: null
            }
        }
        this.position = {
            x: 0.25,
            y: 0.5
        }

        this.health = {
            percentage: 1
        }

        this.fireballs = {
            array: []
        }
        
        this.animate = true;
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.stateIds.forEach(id => {
            this.session.state.unsubscribeAll(id);
        })
        this.sketch.remove()
        this.AppletHTML.deleteNode();
        // window.cancelAnimationFrame(this.animation)
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        let containerElement = document.getElementById(this.props.id)
        this.sketch.resizeCanvas(containerElement.clientWidth, containerElement.clientHeight);
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    unpackObject(o) {
        let a = []
        Object.keys(o).forEach(k => {
            if (o[k].constructor != Object) a.push([k,o[k]])
            else a.push([k,this.unpackObject(o[k])])
        })
        return a
    }

    nestHTMLElements(a){
        let innerHTML = ``
        a.forEach(v => {
            if (!Array.isArray(v[1])) innerHTML += `<p>${v[0]} : ${v[1]}</p>`
           else innerHTML += `<p>${v[0]} : ${this.nestHTMLElements(v[1])}</p>`
        })
        return innerHTML
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 
