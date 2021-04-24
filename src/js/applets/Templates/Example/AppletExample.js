import {Session} from './../../../Session'
import {DOMFragment} from './../../../ui/DOMFragment'


//Example Applet for integrating with the UI Manager
export class AppletExample {

    
    

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            buttonOutput: 0 //Add whatever else
        };

        //etc..
        this.sub1 = undefined;
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            let name = 'BCI App'; if(this.bci) if(this.bci.devices.length > 0) name = "BCI App for "+this.bci.devices[0].info.deviceName;
            return `
                <div id='Example_${props.id}' style='height:100%; width:100%; border:2px solid black; background-color:blue; color:white;'>
                    Test `+name+`
                    <div id='Output_`+props.id+`'>`+props.buttonOutput+`</div>
                    <button id='Button_`+props.id+`'>ClickMe</button>
                    <button id='Button2_`+props.id+`'>Subscribe</button>
                    <div id='Output2_`+props.id+`'>Awaiting FP1 data</div>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById("Button_"+props.id).onclick = () => {
                props.buttonOutput++;
                document.getElementById('Output_'+props.id).innerHTML = props.buttonOutput; //Alternatively could set the DOMFragment to update
            }   
            document.getElementById("Button2_"+props.id).onclick = () => {
                this.sub1 = this.bci.subscribe('eeg','all', undefined, (newData)=>{
                    document.getElementById('Output2_'+props.id).innerHTML = newData;
                });    
                if(this.sub1 === undefined) {
                    document.getElementById('Output2_'+props.id).innerHTML = 'EEG not found, run it first';
                }
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

        if(this.settings.length > 0) { this.configure(this.settings); } //you can give the app initialization settings if you want via an array.


        //Add whatever else you need to initialize
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
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