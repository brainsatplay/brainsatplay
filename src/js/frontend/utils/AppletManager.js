import { DOMFragment } from "./DOMFragment";

export class AppletManager {
    constructor(initUI = () => {}, deinitUI = () => {}, appletClasses=[], appletConfigs=[], appletSelectIds=["applet1","applet2","applet3","applet4"], bcisession=null) {
        this.initUI = initUI;
        this.deinitUI = deinitUI;
        this.initUI();

        
        this.appletClasses = appletClasses;
        this.appletsSpawned = 0;
        this.maxApplets = 4;
        this.applets = Array.from({length: this.maxApplets}, e => null);

        this.bcisession=bcisession;
    
        this.appletSelectIds = appletSelectIds;

        this.initAddApplets(appletConfigs);

        window.addEventListener('resize', ()=>{
            this.responsive();
        })

        //this.responsive(); 
    
        appletSelectIds.forEach((id,i) => {
            this.addAppletOptions(id,i);
        })
        let applets = document.getElementById('applets');
        applets.style.display = 'grid'
        applets.style.height = 'calc(100vh - 100px)'
        applets.style.width = 'calc(100vw - 100px)'
    }

    initUI = () => {}

    deinitUI = () => {}

    initAddApplets = (appletConfigs=[]) => {
        if(appletConfigs.length === 0){
            this.appletClasses.forEach((classObj,i) => {
                if(this.appletsSpawned < this.maxApplets) {
                    //let containerId = Math.floor(Math.random()*100000)+"applet";
                    //let container = new DOMFragment(`<div id=${containerId}></div>`,"applets"); //make container, then delete when deiniting (this.applets[i].container.deleteFragment());
                    //this.applets.push({ appletIdx:i+1, name:classObj.name, classinstance: new classObj.cls(container.node,this.bcisession), container: container});
                    this.applets[i] = {
                        name:classObj.name,
                        classinstance: new classObj.cls("applets",this.bcisession)
                    }
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
                        this.applets[i] = {
                            name:o.name,
                            classinstance: new o.cls("applets",this.bcisession)
                        }
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

        // Create grid subdivisions based on applet count
        let gridSideDivisions = Math.ceil(Math.sqrt(this.applets.length))
        let innerStrings = Array.from({length: gridSideDivisions}, e => [])
        this.applets.forEach((applet,i,self) => {
            innerStrings[Math.floor(i/Math.ceil(Math.sqrt(self.length)))].push(String.fromCharCode(97 + i));
        })
        innerStrings = innerStrings.map((stringArray) => {
            return '"' + stringArray.join(' ') + '"'
        }).join(' ')
        let applets = document.getElementById('applets');
        applets.style.gridTemplateAreas = innerStrings
        applets.style.gridTemplateColumns = `repeat(${gridSideDivisions},1fr)`
        applets.style.gridTemplateRows =  `repeat(${gridSideDivisions},1fr)`

        // Assign applets to proper areas
        this.applets.forEach((applet,i) => {
            if(applet.classinstance.AppletHTML === null) { applet.classinstance.init(); }
            let appletDiv =  applet.classinstance.AppletHTML.node;
            appletDiv.style.gridArea = String.fromCharCode(97 + i);
            appletDiv.style.overflow = 'hidden'

            // Fullscreen Functionality
            appletDiv.addEventListener('dblclick', () => {
                const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
                if (!fullscreenElement){
                    if (appletDiv.requestFullscreen){
                        appletDiv.requestFullscreen()
                    } else if (appletDiv.webkitRequestFullscreen){
                        appletDiv.webkitRequestFullscreen()
                    }
                } else {
                    if (document.exitFullscreen){
                        document.exitFullscreen()
                    } else if (document.webkitExitFullscreen){
                        document.webkitExitFullscreen()
                    }
                }
            })
        });
        this.responsive();
    }

    addApplet = (appletClassIdx, appletIdx) => {
        if(this.appletsSpawned < this.maxApplets) {
            var classObj = this.appletClasses[appletClassIdx];
            var found = this.applets.find((o,i) => {
                if(i+1 === appletIdx) {
                    this.deinitApplet(appletIdx);
                    return true;
                }
            });
            //let containerId = Math.floor(Math.random()*100000)+"applet";
            //let container = new DOMFragment(`<div id=${containerId}></div>`,"applets"); //make container, then delete when deiniting (this.applets[i].container.deleteFragment());
                   
            //var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets.push({appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession), container: container});}
            //else { this.applets.splice(pos,0,{appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession), container: container});}
            console.log(appletIdx)
            var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets[pos] = {name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession)};}
            else { this.applets[pos] = {name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession)};}
            
            this.applets[pos].classinstance.init()
            // this.applets[pos].classinstance.AppletHTML.node.style.gridArea = String.fromCharCode(97 + pos)
            // console.log(this.applets[pos].classinstance.AppletHTML.node.style.gridArea)
            this.appletsSpawned++;
            this.responsive();
            console.log("applet added");
        }
    }

    initAppletwSettings = (appletIdx=null,settings=null) => {
        var found = this.applets.find((o,i) => {
            if(i+1 === appletIdx) {
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
            if(i+1=== appletIdx) {
                stateIdx = i;  
                // let applets = document.getElementById('applets')
                
                // let gridAreas = this.applets[i].classinstance.AppletHTML.node.style.gridArea.split(' / ')
                // gridAreas = gridAreas.filter((val,ind,self) => self.indexOf(val) === ind)
                // console.log(gridAreas)
                // console.log(applets.style.gridTemplateAreas)
                // gridAreas.forEach(gridArea => {
                //     applets.style.gridTemplateAreas = `'b' 'c d'`
                    
                //     applets.style.gridTemplateAreas.replace(
                //         gridArea,
                //         '') 
                // })
                // console.log(applets.style.gridTemplateAreas)
                if (this.applets[stateIdx] != null){
                    this.applets[stateIdx].classinstance.deinit();
                }
                //this.applets[stateIdx].container.deleteFragment();
                this.applets[stateIdx] = null;
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
        nodes = nodes.filter(n => n != null)
        nodes.forEach((appnode,i) => {
            let appletDiv =  appnode.classinstance.AppletHTML.node;
            let gridPercent = 100/(Math.ceil(Math.sqrt(nodes.length)));
            if (nodes.length === 1){
                // appletDiv.style.flex = `1 0 ${100}%`
                appletDiv.style.maxHeight = `calc(${100}vh - 100px)`;
            } else if (nodes.length === 2){
                // appletDiv.style.flex = `1 0 ${100}%`
                appletDiv.style.maxHeight = `calc(${50}vh - 50px)`;           
            } else {
                // appletDiv.style.flex = `1 0 ${gridPercent - gridPercent*0.2}%`
                appletDiv.style.maxHeight = `calc(${gridPercent}vh - 50px)`;
            }
        });
        

        nodes.forEach((applet,i) => {
            applet.classinstance.responsive();
        });
    }
}