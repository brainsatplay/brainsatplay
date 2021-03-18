import {State} from '../State'                      // Shared values
import {DOMFragment} from '../utils/DOMFragment'

//Example Applet for integrating with the UI Manager
export class AppletTemplate {
    constructor(
        parent=document.body,
        settings=[],
        bcisession=null
    ) {
    
        //-----Keep these----- 
        this.parentNode = parent;
        this.settings = settings;
        this.bcisession = bcisession; //Reference to the BCI session
        this.AppletHTML = null;
        //---------------------

        this.props = { //changes to this will auto update the HTML
            id: String(Math.floor(Math.random()*1000000)), //Keep
            width: "100px", //Keep
            height: "100px", //Keep
            buttonOutput: 0 //Add whatever else
        };


    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    init() {

        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='Example_`+props.id+`' height='`+props.height+`' width='`+props.width+`' style='background-color:green; color:red;'>
                    Test
                </div>
                <button id='Button_`+props.id+`'>ClickMe</button>
                <div id='Output_`+props.id+`'>`+props.buttonOutput+`</button>
            `;
        }

        let setupHTML = (props=this.props) => {
            document.getElementById("Button_"+props.id).onclick = () => {
                props.buttonOutput++;
                document.getElementById('Output'+props.id).innerHTML = props.buttonOutput; //Alternatively could set the DOMFragment to update
            }   
        }

        this.AppletHTML = new DOMFragment(
            HTMLtemplate,
            this.parentNode,
            this.props,
            setupHTML,
            undefined,
            "NEVER"//Changes to this.props will automatically update the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles it
        );  

        if(this.settings.length > 0) { this.configure(this.settings); }
    
    }

    deinit() {

    }

    onresize() {

    }

    configure(settings) {
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

} 