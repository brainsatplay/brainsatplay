var s=Object.defineProperty;var u=(n,i,e)=>(typeof i!="symbol"&&(i+=""),i in n?s(n,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[i]=e);import{brainsatplay as o}from"../brainsatplay.js";import{DOMFragment as c}from"../frontend/utils/DOMFragment.js";export class AppletExample{constructor(i=document.body,e=new o,t=[]){this.bci=e,this.parentNode=i,this.settings=t,this.AppletHTML=null,this.props={id:String(Math.floor(Math.random()*1e6)),buttonOutput:0},this.sub1=void 0}init(){let i=(t=this.props)=>{let d="BCI App";return this.bci&&this.bci.devices.length>0&&(d="BCI App for "+this.bci.devices[0].info.deviceName),`
                <div id='Example_${t.id}' style='height:${t.height}; width:${t.width}; border:2px solid black; background-color:blue; color:white;'>
                    Test `+d+`
                    <div id='Output_`+t.id+"'>"+t.buttonOutput+`</div>
                    <button id='Button_`+t.id+`'>ClickMe</button>
                    <button id='Button2_`+t.id+`'>Subscribe</button>
                    <div id='Output2_`+t.id+`'>Awaiting FP1 data</div>
                </div>
            `},e=(t=this.props)=>{document.getElementById("Button_"+t.id).onclick=()=>{t.buttonOutput++,document.getElementById("Output_"+t.id).innerHTML=t.buttonOutput},document.getElementById("Button2_"+t.id).onclick=()=>{this.sub1=this.bci.subscribe("eeg","all",void 0,d=>{document.getElementById("Output2_"+t.id).innerHTML=d}),this.sub1===void 0&&(document.getElementById("Output2_"+t.id).innerHTML="EEG not found, run it first")}};this.AppletHTML=new c(i,this.parentNode,this.props,e,void 0,"NEVER"),this.settings.length>0&&this.configure(this.settings)}deinit(){this.AppletHTML.deleteNode()}responsive(){}configure(i=[]){i.forEach((e,t)=>{})}}u(AppletExample,"devices",["eeg","heg"]);
