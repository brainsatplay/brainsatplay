
export class AppletManager {
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

        
        document.getElementById('applets').style.display = 'flex'
        document.getElementById('applets').style.flexWrap = 'wrap'
        document.getElementById('applets').style.flexGrow = '1'

        this.initAddApplets(appletConfigs);

        window.addEventListener('resize', ()=>{
            this.responsive();
        })

        //this.responsive(); 
    
        appletSelectIds.forEach((id,i) => {
            this.addAppletOptions(id,i);
        })
        let applets = document.getElementById('applets')
        applets.style.display = 'flex'
        applets.style.flexWrap = 'wrap'
        applets.style.flexDirection = 'column'
        applets.style.flexGrow = '1'
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
            let appletDiv =  applet.classinstance.AppletHTML.node;
            appletDiv.style.flex = '1 0 42%'
            // appletDiv.style.minHeight = '100%'
            appletDiv.style.height = '100px'
        });
        this.responsive();
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
            let appletDiv =  this.applets[pos].classinstance.AppletHTML.node;
            appletDiv.init();
            this.appletsSpawned++;
            this.responsive();
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
                this.responsive();
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
                this.responsive();
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
        });
        this.responsive();
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

    responsive(nodes=this.applets) {
        nodes.forEach((appnode,i) => {
            let appletDiv =  appnode.classinstance.AppletHTML.node;
            // appletDiv.style.height = 'auto'
        });
        

        this.applets.forEach((applet,i) => {
            applet.classinstance.responsive();
        });
    }
}