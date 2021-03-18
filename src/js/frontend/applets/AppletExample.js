import {State} from '../State'
import {DOMFragment} from '../utils/DOMFragment'

//Example Applet for integrating with the UI Manager
export class AppletTemplate {
    constructor(
        appendTo=document.body,
        settings=[]
    ) {
        this.parentNode = appendTo;
        this.AppletHTML = null;

        this.props = { //changes to this will auto update the HTML
            id: String(Math.floor(Math.random()*1000000)),
            width: "100px",
            height: "100px",
        };

        this.settings = settings;
        if(settings.length > 0) {this.configure(settings);}

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
                <div id='Output_`+props.id+`'>Output</button>
            `;
        }

        let setupHTML = () => {
            document.getElementById("Button_"+this.props.id).onclick = () => {

            }
        }

        this.AppletHTML = new DOMFragment(
                HTMLtemplate,
                this.parentNode,
                this.props,
                setupHTML,
                undefined,
                "NEVER"
            ); //Changes to this.props will automatically update the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles it
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