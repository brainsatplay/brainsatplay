import {DOMFragment} from './ui/DOMFragment'

export class Application {
    /** 
     * @constructor
     * @alias module:brainsatplay.Application
     * @description Create an app using brainsatplay.js
     * @param {HTMLElement} parentNode The parent node of your app
     * @param {Session} session A brainsatplay {@link Session} to access data and subscribe
     * @param {string} type Specify a default type of application
     * @param {array} settings An array of arguments (e.g. [a,b,...,z]) to initialize the application in a certain state
     */

    constructor({parentNode = document.body, session = null, type = null, settings = []}) {
    
        //-------Keep these------- 
        this.session = session;
        this.parentNode = parentNode;
        this.settings = settings;
        this.type = type;
        this.AppletHTML = null;
        //------------------------


        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            // ... 
        };
        

        //-------Keep these------- 
        this.defaultSetup = () => {}
        this.defaultResponse = () => {}

        if (this.type == 'neurofeedback'){
            this.defaultNeurofeedback = function defaultNeurofeedback(){return 0.5 + 0.5*Math.sin(Date.now()/2000)}
            this.getNeurofeedback = this.defaultNeurofeedback
            this.defaultResponse = () => this.bci.atlas.makeFeedbackOptions(this)
        } 

        if (this.type == 'multiplayer'){
            this.defaultSetup() = () => {
                this.bci.makeGameBrowser(this.name,props.id,()=>{console.log('Joined game!', this.name)},()=>{console.log('Left game!', this.name)})

                document.getElementById(props.id+'createGame').onclick = () => {
                    this.bci.sendWSCommand(['createGame',this.name,['eeg','heg'],['eegch_FP1','eegch_FP2','eegch_AF7','eegch_AF8','hegdata']]);
                    //bcisession.sendWSCommand(['createGame','game',['muse'],['eegch_AF7','eegch_AF8']]);
                }
            }
        }
        //----------------------- 


        // ... 
    }

    /**
     * @method module:brainsatplay.Application.init
     * @description Initialize your app
     */

    init() {
        let template = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:100%; width:100%;'></div>
            `;
        }

        let setup = (props=this.props) => {
            this.defaultSetup()
            document.getElementById(props.id);
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            template,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setup,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings) }
        
        // ...
    }

    /**
     * @method module:brainsatplay.Application.deinit
     * @description Deinitialize your app
     * @param {callback} callback Remove event listeners and loops
     */

    deinit() {
        //-------Keep this------- 
        this.AppletHTML.deleteNode();
        //----------------------- 

    }

    /**
     * @method module:brainsatplay.Application.responsive
     * @description Specify how your app responds to window resizing and new device connections
     */

    responsive() {
        //-------Keep this------- 
        this.defaultResponse()
        //----------------------- 

        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    /**
     * @method module:brainsatplay.Application.configure
     * @description Configure your app state on (re)initialization
     * @param {Array} settings  An array of arguments [a,b,c]
     */

    configure(settings=[]) {
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }
} 