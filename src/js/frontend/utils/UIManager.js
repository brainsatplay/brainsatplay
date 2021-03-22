
export class UIManager {
    constructor(initUI = () => {}, deinitUI = () => {}, appletClasses=[], appletConfigs=[], appletSelectIds=["applet1","applet2","applet3","applet4"], bcisession=null) {
        this.initUI = initUI;
        this.deinitUI = deinitUI;
        this.initUI();

        
        this.appletClasses = appletClasses;
        this.applets = [];
        this.appletsSpawned = 0;
        this.maxApplets = 4;
        this.bcisession=bcisession;
    
        this.appletSelectIds = appletSelectIds;

        this.initAddApplets(appletConfigs);

        window.addEventListener('resize', ()=>{
            this.responsiveUIUpdate();
        })

        //this.responsiveUIUpdate(); 
    
        appletSelectIds.forEach((id,i) => {
            this.addAppletOptions(id,i);
        })

    }

    initUI = () => {}

    deinitUI = () => {}

    initAddApplets = (appletConfigs=[]) => {
        if(appletConfigs.length === 0){
            this.appletClasses.forEach((classObj,i) => {
                if(this.appletsSpawned < this.maxApplets) {
                    this.applets.push({ appletIdx:i+1, name:classObj.name, classinstance: new classObj.cls("applets",this.bcisession)});
                    this.appletsSpawned++;
                }
            });
            this.initApplets();
        }
        else{
            appletConfigs.forEach((cfg,i)=> { //Expects objects like {name:"",idx:1 to max,settings:["a","b","c"]} the idx and settings are optional to set up specific layouts
                this.appletClasses.find((o,j) => {
                    if(cfg.name === o.name) {
                        let k = i+1;
                        if(cfg.idx) { k=cfg.idx; }
                        this.applets.push({ appletIdx:k, name:o.name, classinstance: new o.cls("applets",this.bcisession)});
                        this.appletsSpawned++;
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
        this.applets.forEach((applet,i) => {
            if(applet.classinstance.AppletHTML === null) { applet.classinstance.init(); }
            applet.classinstance.AppletHTML.node.style.position = "absolute";
        });
        this.responsiveUIUpdate();
    }

    addApplet = (appletClassIdx, appletIdx) => {
        if(this.appletsSpawned < this.maxApplets) {
            var classObj = this.appletClasses[appletClassIdx];
            var found = this.applets.find((o,i) => {
                if(o.appletIdx === appletIdx) {
                    this.deinitApplet(appletIdx);
                    return true;
                }
            });
            var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets.push({appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets")});}
            else { this.applets.splice(pos,0,{appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets")});}
            this.applets[pos].classinstance.init();
            this.applets[pos].classinstance.AppletHTML.node.style.position = "absolute";
            this.appletsSpawned++;
            this.responsiveUIUpdate();
            console.log("applet added");
        }
    }

    initAppletwSettings = (appletIdx=null,settings=null) => {
        var found = this.applets.find((o,i) => {
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

    deinitApplet = (appletIdx) => {
        var stateIdx = null;
        var found = this.applets.find((o,i) => {
            if(o.appletIdx === appletIdx) {
                stateIdx = i;  
                this.applets[stateIdx].classinstance.deinit();
                this.applets.splice(stateIdx,1);
                this.appletsSpawned--;
                this.responsiveUIUpdate();
                return true;
            }
        });
    }

    deinitApplets() {
        this.applets.forEach((applet,i) => {
            this.deinitApplet(i);
        })
    }

    reinitApplets = () => {
        this.applets.forEach((applet,i) => {
            applet.classinstance.deinit();
            applet.classinstance.init();
            applet.classinstance.AppletHTML.node.style.position = "absolute";
        });
        this.responsiveUIUpdate();
    }

    addAppletOptions = (selectId,appletIdx) => {
        var select = document.getElementById(selectId);
        select.innerHTML = "";
        var newhtml = `<option value='None' selected="selected">None</option>`;
        this.appletClasses.forEach((classObj,i) => {
            if(this.applets[appletIdx] && this.applets[appletIdx].name===classObj.name) {
              newhtml += `<option value='`+classObj.name+`' selected="selected">`+this.appletClasses[i].name+`</option>`;
            }
            else{
              newhtml += `<option value='`+classObj.name+`'>`+this.appletClasses[i].name+`</option>`;
            }
        });
        select.innerHTML = newhtml;

        select.addEventListener('change', ()=>{
           // console.log(select.value);
            this.deinitApplet(appletIdx+1);
            if(select.value !== 'None'){
                let found = this.appletClasses.find((o,i)=>{
                    if(o.name===select.value){
                        this.addApplet(i,appletIdx+1);
                        return true;
                    }
                });
            }
        })
    }

    responsiveUIUpdate(nodes=this.applets, topoffset=140) {
        //console.log(nodes);
        nodes.forEach((node,i) => {
            //console.log(node)
            //TODO: replace this with something more procedural for n-elements with varied arrangements 
            //(e.g. arbitrary sizes and arrangements for applets. This is why we didn't use tables to place the apps.)
            
            if(nodes.length === 1) { //1 full view
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-15 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight - topoffset + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 2) { //2 stacked views
                var transformy = window.innerHeight*.5- topoffset*.5;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-15 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-15 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 3) {
                var transformy = window.innerHeight*.5 - topoffset*.5;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5-7.5+"px";
                }
                else if(i === 2){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth-15 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
            }
            if(nodes.length === 4) {
                var transformy = window.innerHeight*.5- topoffset*.5;
                if(i===0){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i===1){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5 - topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5-7.5+"px";
                    node.classinstance.AppletHTML.node.style.top = 0+"px";
                }
                else if(i === 2){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = 0+"px";
                }
                else if(i === 3){
                    node.classinstance.AppletHTML.node.style.width = window.innerWidth*.5-7.5 + "px";
                    node.classinstance.AppletHTML.node.style.height = window.innerHeight*.5-topoffset*.502 + "px";
                    node.classinstance.AppletHTML.node.style.top = transformy+"px";
                    node.classinstance.AppletHTML.node.style.left = window.innerWidth*.5-7.5+"px";
                }
            }
            if(nodes.length === 5) {
            }
            if(nodes.length === 6) {
            }
        });
        

        this.applets.forEach((applet,i) => {
            applet.classinstance.onresize();
        });
    }
}