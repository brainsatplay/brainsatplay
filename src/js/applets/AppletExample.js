import {State} from '../frontend/State'
import {DOMFragment} from '../frontend/DOMFragment'
//import {Applet} from './Applet'

export class AppletExample { //Filled in Applet class copy (without extending, which needs less javascript knowledge)
    constructor(parentNode=document.getElementById("applets")) {
        this.parentNode = parentNode;
        this.AppletHTML = null;

        this.renderProps = { //changes to this will auto update the HTML
            width: "100px",
            height: "100px",
            id: String(Math.floor(Math.random()*1000000))
        };

        this.settings = settings;
        if(settings.length > 0) { this.configure(settings);}

        State.data.x = 0;
        this.subscription = State.subscribe('x',this.doSomething);
        //this.listener = new ObjectListener();

    }

    HTMLtemplate(props=this.renderProps) { //Simply use a template string of the desired HTML to be rendered
        return `
            <div id='`+props.id+`'>
                <canvas id='`+props.id+`canvas' style='position:absolute;height:`+props.height+`;width:`+props.width+`;'></canvas>
                <div id='`+props.id+`x' style='position:absolute;'>`+State.data.x+`</div>
                <button id='`+props.id+`button1' style='position:absolute; top:20px;'>+</button> 
            </div>
        `;
    }

    setupHTML(){
        //Apply onclick functions and stuff after initializing the DOMFragment
        document.getElementById(this.renderProps.id+"button1").onclick = () => {
            State.setState({x:State.data.x+1});
        }
    }

    init() {
        this.AppletHTML = new DOMFragment(this.HTMLtemplate,this.parentNode,this.renderProps,()=>{this.setupHTML();},undefined,"NEVER"); //Changes to this.props will automatically update the html template
    }

    deInit() {
        State.unsubscribe('x',this.subscription);
        this.AppletHTML.deleteNode();
    }

    configure(settings) {
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    onResize() {
        var canvas = document.getElementById(this.renderProps.id+"canvas");
        canvas.width = this.renderProps.width;
        canvas.height = this.renderProps.height;
    }

    //------------ additional functions --------------

    doSomething = () => {
        document.getElementById(this.renderProps.id+"x").innerHTML=State.data.x;
        console.log(State.data.x);
    }
}