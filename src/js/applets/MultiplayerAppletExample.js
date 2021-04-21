import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import featureImg from './../../assets/features/placeholder.png'

//Example Applet for integrating with the UI Manager
export class MultiplayerAppletExample {

    static name = "Multiplayer Example"; 
    static devices = ['eeg','heg']; //{devices:['eeg'], eegChannelTags:['FP1','FP2']  }
    static description = "Multiplayer Example"
    static categories = ['multiplayer','feedback']; //data,game,multiplayer,meditation,etc
    static image=featureImg

    constructor(
        parent=document.body,
        bci=new brainsatplay(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.name = this.constructor.name
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        //etc..

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%; position: relative;'>
            <button id='${props.id}createGame'>Make Game session</button>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                <div id='${props.id}userList' style='pointer-events: auto; width: 50%; height: 50%; padding: 50px; border: 1px solid gray; justify-items: center; align-items: center;'></div>
            </div>
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.bci.makeGameBrowser(this.name,props.id,()=>{console.log('Joined game!', this.name)},()=>{console.log('Left game!', this.name)})

            document.getElementById(props.id+'createGame').onclick = () => {
                this.bci.sendWSCommand(['createGame',this.name,['eeg','heg'],['eegch_FP1','eegch_FP2','eegch_AF7','eegch_AF8','hegdata']]);
                //bcisession.sendWSCommand(['createGame','game',['muse'],['eegch_AF7','eegch_AF8']]);
            }

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


        //Add whatever else you need to initialize

        let applet = document.getElementById(this.props.id)
        let list = document.getElementById(`${this.props.id}userList`)
        this.animate = () => {
            let usernames = this.bci.state.data?.commandResult?.gameInfo?.usernames

            list.innerHTML = ''
            if ( usernames != null ){
                usernames.forEach((name)=> {
                    list.innerHTML += `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 50px; border: 1px solid white;">${name}</div>`
                })
            }
            this.animation = window.requestAnimationFrame(this.animate)
        }

        this.animate()
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        window.cancelAnimationFrame(this.animation)
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 