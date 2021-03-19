import {State} from '../State'                      // Shared values
import {DOMFragment} from '../utils/DOMFragment'

//Example Applet for integrating with the UI Manager
export class AppletExample {
    constructor(
        parent=document.body, 
        settings=[],
        bci=undefined
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            buttonOutput: 0 //Add whatever else
        };

        //etc..

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            let name = this.bci.devices[0].name; if(name===undefined) name='BCI';
            return `
                <div id='Example_`+props.id+`' style='height:100%; width:100%; background-color:green; color:red;'>
                    Test `+name+`
                </div>
                <button id='Button_`+props.id+`'>ClickMe</button>
                <div id='Output_`+props.id+`'>`+props.buttonOutput+`</button>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById("Button_"+props.id).onclick = () => {
                props.buttonOutput++;
                document.getElementById('Output'+props.id).innerHTML = props.buttonOutput; //Alternatively could set the DOMFragment to update
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

        if(this.settings.length > 0) { this.configure(this.settings); }


        //Add whatever else you need to initialize
    
    }

    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    onresize() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    configure(settings) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 