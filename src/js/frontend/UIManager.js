import {State} from './State'

export class UIManager {
    constructor(initUI = () => {}, deInitUI = () => {}, appletConfigs=[], appletSelectIds=["applet1","applet2","applet3","applet4"], menuId = "UI") {
        this.initUI = initUI;
        this.deInitUI = deInitUI;
        this.initUI();
        
        this.menuNode = document.getElementById(menuId);
        this.appletSelectIds = appletSelectIds;

        this.initAddApplets(appletConfigs);

        window.addEventListener('resize', ()=>{
            this.responsiveUIUpdate();
        })

        //this.responsiveUIUpdate();
        //State.subscribe('appletsSpawned', this.responsiveUIUpdate); 
    
        appletSelectIds.forEach((id,i) => {
            this.addAppletOptions(id,i+1);
        })

    }

    initUI = () => {}

    deInitUI = () => {}

    initAddApplets = (appletConfigs=[]) => {
        if(appletConfigs.length === 0){
            State.data.appletClasses.forEach((classObj,i) => {
                if(State.data.appletsSpawned < State.data.maxApplets) {
                    State.data.applets.push({ appletIdx:i+1, name:classObj.name, classinstance: new classObj.cls("applets")});
                    State.data.appletsSpawned++;
                }
            });
            this.initApplets();
        }
        else{
            appletConfigs.forEach((cfg,i)=> { //Expects objects like {name:"",idx:1 to max,settings:["a","b","c"]} the idx and settings are optional to set up specific layouts
                State.data.appletClasses.find((o,j) => {
                    if(cfg.name === o.name) {
                        let k = i+1;
                        if(cfg.idx) { k=cfg.idx; }
                        State.data.applets.push({ appletIdx:k, name:o.name, classinstance: new o.cls("applets")});
                        State.data.appletsSpawned++;
                        if(cfg.settings) {
                            this.initAppletwSettings(k,cfg.settings);
                        }
                        else {
                            this.initAppletwSettings(k,null);
                        }
                    }
                    
                });
            });
        }
        

    }

    initApplets = () => {
        State.data.applets.forEach((applet,i) => {
            if(applet.classinstance.AppletHTML === null) { applet.classinstance.init(); }
            applet.classinstance.AppletHTML.node.style.position = "absolute";
        });
        this.responsiveUIUpdate();
    }

    addApplet = (appletClassIdx, appletIdx) => {
        if(State.data.appletsSpawned < State.data.maxApplets) {
            var classObj = State.data.appletClasses[appletClassIdx];
            var found = State.data.applets.find((o,i) => {
                if(o.appletIdx === appletIdx) {
                    this.deInitApplet(appletIdx);
                    return true;
                }
            });
            var pos = appletIdx-1; if(pos > State.data.applets.length) {pos = State.data.applets.length; State.data.applets.push({appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets")});}
            else { State.data.applets.splice(pos,0,{appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets")});}
            State.data.applets[pos].classinstance.init();
            State.data.applets[pos].classinstance.AppletHTML.node.style.position = "absolute";
            State.data.appletsSpawned++;
            this.responsiveUIUpdate();
            console.log("applet added");
        }
    }

    initAppletwSettings = (appletIdx=null,settings=null) => {
        var found = State.data.applets.find((o,i) => {
            if(o.appletIdx === appletIdx) {
                o.classinstance.init();
                if(!!settings){
                    if(!!o.classinstance.configure){
                        o.classinstance.configure(settings);
                    }
                }
                o.classinstance.AppletHTML.node.style.position = "absolute";        
                this.responsiveUIUpdate();
                return true;
            }
        });
    }

    deInitApplet = (appletIdx) => {
        var stateIdx = null;
        var found = State.data.applets.find((o,i) => {
            if(o.appletIdx === appletIdx) {
                stateIdx = i;  
                State.data.applets[stateIdx].classinstance.deInit();
                State.data.applets.splice(stateIdx,1);
                State.data.appletsSpawned--;
                this.responsiveUIUpdate();
                return true;
            }
        });
    }

    reInitApplets = () => {
        State.data.applets.forEach((applet,i) => {
            applet.classinstance.deInit();
            applet.classinstance.init();
            applet.classinstance.AppletHTML.node.style.position = "absolute";
        });
        this.responsiveUIUpdate();
    }

    addAppletOptions = (selectId,appletIdx) => {
        var select = document.getElementById(selectId);
        select.innerHTML = "";
        var newhtml = `<option value='None'>None</option>`;
        var stateIdx = 0;
        var found = State.data.applets.find((o,i) => {
            if(o.appletIdx === appletIdx) {
                stateIdx = i;
                return true;
            }
        });
        State.data.appletClasses.forEach((classObj,i) => {
            if(!!State.data.applets[stateIdx] && State.data.applets[stateIdx].name===classObj.name) {
              newhtml += `<option value='`+classObj.name+`' selected="selected">`+State.data.appletClasses[i].name+`</option>`;
            }
            else{
              newhtml += `<option value='`+classObj.name+`'>`+State.data.appletClasses[i].name+`</option>`;
            }
        });
        select.innerHTML = newhtml;

        select.addEventListener('change', ()=>{
            this.deInitApplet(appletIdx);
            if(select.value !== 'None'){
                let found = State.data.appletClasses.find((o,i)=>{
                    if(o.name===select.value){
                        this.addApplet(i,appletIdx);
                        return true;
                    }
                });
            }
        })
    }

    responsiveUIUpdate(nodes=State.data.applets, topoffset=90) {
        //console.log(nodes);
        nodes.forEach((node,i) => {
            //console.log(node)
            //TODO: replace this with something more procedural for n-elements with varied arrangements 
            //(e.g. arbitrary sizes and arrangements for applets. This is why we didn't use tables to place the apps.)
            
            if(nodes.length === 1) { //1 full view
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight - topoffset + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 2) { //2 stacked views
                var transformy = window.innerHeight*.5- topoffset*.55;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 3) {
                var transformy = window.innerHeight*.5 - topoffset*.55;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5+"px";
                }
                else if(i === 2){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 4) {
                var transformy = window.innerHeight*.5- topoffset*.5;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5+"px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                }
                else if(i === 2){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i === 3){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-3 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.55 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5+"px";
                }
            }
            if(nodes.length === 5) {
            }
            if(nodes.length === 6) {
            }
        });
        

        State.data.applets.forEach((applet,i) => {
            applet.classinstance.onResize();
        });
    }
}