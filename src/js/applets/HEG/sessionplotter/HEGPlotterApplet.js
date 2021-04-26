import {Session} from './../../../../library/src/Session'
import {DOMFragment} from './../../../../library/src/ui/DOMFragment'
import {uPlotMaker} from '../../../frontend/UX/eegvisuals'
import {CSV} from '../../../general/csv'

//Example Applet for integrating with the UI Manager
export class HEGPlotterApplet {

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
            //Add whatever else
        };

        //etc..
        this.plot = undefined;
        this.plotWidth = 500;
        this.plotHeight = 300;
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' style='height:100%; width:100%;'>
                <div id='${props.id}menu' style='position:absolute; z-index:5;'>
                    <button id='${props.id}load' style='background-color:black; color:white;'>Load HEG CSV</button>
                    <span id='${props.id}legend'></span>
                    <span id='${props.id}session' style='font-size:10px; color:black;'></span>
                </div>
                <div id='${props.id}uplot' style='z-index:3; position:absolute; background-color:white; min-height:100px; min-width:100px;'></div>
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            

            document.getElementById(props.id+'load').onclick = () => {
                CSV.openCSV(',',(data) => {
                    let t = [], red = [], ir = [], ratio = [], ratiosma = [], ambient = [];

                    let err = 0;
                    let mse = 0;
                    data.forEach((row)=>{
                        t.push(parseFloat(row[0]));
                        red.push(parseFloat(row[2]));
                        ir.push(parseFloat(row[3]));
                        ratio.push(parseFloat(row[4]));
                        if(ratio.length > 40) ratiosma.push(this.mean(ratio.slice(ratio.length-40)))
                        else ratiosma.push(this.mean(ratio.slice(0)));
                        ambient.push(parseFloat(row[5]));
                        err += Math.abs((ratio[ratio.length-1] - ratiosma[ratiosma.length-1])/ratiosma[ratiosma.length-1])
                        mse += Math.pow((ratio[ratio.length-1] - ratiosma[ratiosma.length-1]),2)
                    });
                    err = err/ratio.length;
                    let rmse = Math.sqrt(mse/ratiosma.length);

                    console.log(this.plot.uPlotData)
                    this.plot.uPlotData = [
                        t,red,ir,ratio,ratiosma,ambient
                    ]
                    this.plot.plot.setData(this.plot.uPlotData);

                    let sessionchange = (this.mean(ratiosma.slice(ratiosma.length-40))/this.mean(ratiosma.slice(0,40)) - 1)*100;
                    let sessionGain = (this.mean(ratiosma)/this.mean(ratiosma.slice(0,200)) - 1)*100;

                    let errCat = "♥ ฅ(=^ᆽ^=ฅ)";

                    let changecolor = 'red';
                    let gaincolor = 'red';
                    if(sessionchange > 0) changecolor = 'green';
                    if(sessionGain > 0) gaincolor = 'green';

                    document.getElementById(props.id+"session").innerHTML = `
                        <span style='color:`+changecolor+`;'>Change: `+sessionchange.toFixed(2)+`%</span>    
                        | <span style='color:`+gaincolor+`;'>Avg Gain: `+sessionGain.toFixed(2)+`%</span>
                        | <span>Error: `+err.toFixed(5)+`</span>
                        | <span>RMSE: `+rmse.toFixed(5)+`</span>
                    `;

                });
            };
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        this.AppletHTML.appendStylesheet("./_dist_/styles/css/uPlot.min.css");

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.
        this.plot = new uPlotMaker(this.props.id+'uplot');
        this.plot.uPlotData = [
            new Array(100).fill(1),
            new Array(100).fill(1),
            new Array(100).fill(1),
            new Array(100).fill(1),
            new Array(100).fill(1),
            new Array(100).fill(1)
        ]
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {

        if(this.plot){
        this.setPlotDims(); 
        if(this.plotWidth === 0 || this.plotHeight === 0) {
          setTimeout(() => { //wait for screen to resize
            
          if(this.plot){
              this.setPlotDims();         
              if(this.plotWidth === 0 || this.plotHeight === 0) {
                this.plotWidth = 400; this.plotHeight = 300;
              }
              this.setuPlot();
              //if(!this.looping) this.start();
            }
          }, 100);
        }
        else {
          this.setuPlot();
          //if(!this.looping) this.start();
        }
      }
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    setPlotDims = () => {
        this.plotWidth = this.AppletHTML.node.clientWidth;
        this.plotHeight = this.AppletHTML.node.clientHeight;
      }

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    setuPlot = () => {
       
            let newSeries = [{}];
            newSeries.push({
                label:"Red",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,0,0)"
            });
            newSeries.push({
                label:"IR",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(0,155,155)"
            });
            newSeries.push({
                label:"Ratio",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,0,155)"
            });
            newSeries.push({
                label:"Ratio Smoothed",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,155,0)"
            });
            newSeries.push({
                label:"Ambient",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(0,0,0)"
            });


            newSeries[0].label = "t";
            this.plot.makeuPlot(
                newSeries, 
                this.plot.uPlotData, 
                this.plotWidth, 
                this.plotHeight
            );

            this.setLegend();
            this.plot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v- this.plot.uPlotData[0][0])*.00001666667)+"m:"+((v- this.plot.uPlotData[0][0])*.001 - 60*Math.floor((v-this.plot.uPlotData[0][0])*.00001666667)).toFixed(1) + "s");
        
    }
   

    setLegend = () => {
        document.getElementById(this.props.id+"legend").innerHTML = "";
        let htmlToAppend = ``;
        //console.log(this.class.plot.series)
        this.plot.plot.series.forEach((ser,i) => {
          if(i>0){
            htmlToAppend += `<span id='`+this.props.id+ser.label+`' style='color:`+ser.stroke+`; font-weight:bold; border:2px solid gray; border-radius:3px; cursor:pointer;'>`+ser.label+`</span>  `;
          }
        });
        document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
        this.plot.plot.series.forEach((ser,i) => {
          if(i>0){
            document.getElementById(this.props.id+ser.label).onclick = () => {
              if(this.plot.plot.series[i].show === true){
                document.getElementById(this.props.id+ser.label).style.opacity = 0.3;
                this.plot.plot.setSeries(i,{show:false});
              } else {this.plot.plot.setSeries(i,{show:true}); document.getElementById(this.props.id+ser.label).style.opacity = 1;}
            }
          }
        });
      }
} 