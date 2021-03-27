import {brainsatplay} from '../brainsatplay'
import {DOMFragment} from '../frontend/utils/DOMFragment'
import {uPlotMaker} from '../utils/visuals/eegvisuals'
import {eegmath} from '../bciutils/eeg32'
import {genBandviewSelect} from '../frontend/menus/selectTemplates'

//Example Applet for integrating with the UI Manager
export class uPlotApplet {
    constructor(
        parent=document.body,
        bci=new brainsatplay('','','Template'),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        //etc..
        this.class = null;

        this.loop = null;
        this.timeRange = 10; //minutes
        this.yrange = true;
        this.plotWidth = 500;
        this.plotHeight = 300;

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let  HTMLtemplate = (props=this.renderProps) => {
            return `
            <div id='`+props.id+`'>    
                <div id='`+props.id+`canvas' style='position:absolute;z-index:3; top:50px'></div>
                <div id='`+props.id+`menu' style='position:absolute; float:right; z-index:4;'>
                  <table style='position:absolute; transform:translateX(40px);'>
                    <tr>
                      <td>
                        Channel:
                        <select id="`+props.id+`channel" style='width:80px'></select>
                      </td> 
                      <td>  
                        Graph:
                        <select id='`+props.id+`mode' style='width:98px'>
                          <option value="FFT" selected="selected">FFTs</option>
                          <option value="Coherence">Coherence</option>
                          <option value="CoherenceTimeSeries">Mean Coherence</option>
                          <option value="TimeSeries">Raw</option>
                          <option value="Stacked">Stacked Raw</option>c
                        </select>
                      </td>
                      <td id='`+props.id+`yrangetd' style='width:98px'>
                        Y scale <button id='`+props.id+`yrangeset' style='position:absolute; transform:translateX(21px); height:13px;'><div style='transform:translateY(-3px);'>Set</div></button><input type='text' id='`+props.id+`yrange' placeholder='0,100 or auto' style='width:90px'>
                      </td>
                      <td id='`+props.id+`xrangetd' style='width:98px'>
                        Time: <button id='`+props.id+`xrangeset' style='position:absolute; transform:translateX(30px); height:13px;'><div style='transform:translateY(-3px);'>Set</div></button><input type='text' id='`+props.id+`xrange' placeholder='10 (sec)' style='width:90px'>
                      </td>
                      
                    </tr>
                    <tr>
                    <td colSpan=2 style='display:table-row;' id='`+props.id+`legend'></td>
                      <td>
                      `+genBandviewSelect(props.id+'bandview')+`
                      </td>
                      <td colSpan=2>
                        <div id='`+props.id+`title' style='font-weight:bold; width:200px;'>Fast Fourier Transforms</div>
                      </td>
                    </tr>
                  </table>
                </div>
            </div>
            `; //
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id);
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