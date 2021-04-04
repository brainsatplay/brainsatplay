import { brainsatplay } from "../../brainsatplay";
import { DOMFragment } from "./DOMFragment";

export class AppletManager {
    constructor(initUI = () => {}, deinitUI = () => {}, appletClasses=[], appletConfigs=[], appletSelectIds=["applet1","applet2","applet3","applet4"], bcisession=new brainsatplay()) {
        this.initUI = initUI;
        this.deinitUI = deinitUI;
        this.initUI();

        
        this.appletClasses = appletClasses;
        this.appletsSpawned = 0;
        this.maxApplets = 4;
        this.applets = Array.from({length: this.maxApplets}, (e,i) => { return {appletIdx: i+1,name:null,classinstance: null}});

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
        applets.style.height = 'calc(100vh)' // Must subtract any top navigation bar
        applets.style.width = 'calc(100vw - 75px)'
    }

    initUI = () => {}

    deinitUI = () => {}

    //add the initial list of applets
    initAddApplets = (appletConfigs=[]) => {
        this.appletClasses.forEach((classObj,i) => {
            if(this.appletsSpawned < this.maxApplets) {
                //let containerId = Math.floor(Math.random()*100000)+"applet";
                //let container = new DOMFragment(`<div id=${containerId}></div>`,"applets"); //make container, then delete when deiniting (this.applets[i].container.deleteFragment());
                //this.applets.push({ appletIdx:i+1, name:classObj.name, classinstance: new classObj.cls(container.node,this.bcisession), container: container});
                let config = undefined;
                if(appletConfigs.length !== 0) {
                    appletConfigs.forEach((cfg,i)=> {
                        this.appletClasses.find((o,j) => {
                            if(cfg.name === o.name) {
                                config = cfg.settings;
                            }
                        });
                    });
                }

                if(this.bcisession.info.nDevices > 0) {
                    let found = this.bcisession.devices.find((o,j) => {
                        if(!classObj.devices) {
                            this.applets[i] = {
                                appletIdx: i+1,
                                name:classObj.name,
                                classinstance: new classObj.cls("applets",this.bcisession,config)
                            }
                            this.appletsSpawned++;
                        }
                        else if(Array.isArray(classObj.devices)) {
                            if(classObj.devices.indexOf(o.info.deviceType) > -1 || classObj.devices.indexOf(o.info.deviceName) > -1) {
                                this.applets[i] = {
                                    appletIdx: i+1,
                                    name:classObj.name,
                                    classinstance: new classObj.cls("applets",this.bcisession,config)
                                }
                                this.appletsSpawned++;
                            }
                        } 
                        else if (typeof classObj.devices === 'object') { // { devices:['eeg'], eegChannelTags:['FP1','FP2'] }
                            if(classObj.devices.devices.indexOf(o.info.deviceType) > -1 || classObj.devices.devices.indexOf(o.info.deviceName) > -1) {
                                if(classObj.devices.eegChannelTags) {
                                    let passed = false;
                                    classObj.devices.eegChannelTags.forEach((tag,k) => {
                                        let found = o.atlas.eegshared.eegChannelTags.find((t) => {
                                            if(t.tag === tag) {
                                                passed = true;
                                                return true;
                                            }
                                        }); 
                                        if(!found) passed = false;
                                    });
                                    if(passed) {
                                        this.applets[i] = {
                                            appletIdx: i+1,
                                            name:classObj.name,
                                            classinstance: new classObj.cls("applets",this.bcisession,config)
                                        }
                                        this.appletsSpawned++;
                                    }
                                }
                                else {
                                    this.applets[i] = {
                                        appletIdx: i+1,
                                        name:classObj.name,
                                        classinstance: new classObj.cls("applets",this.bcisession,config)
                                    }
                                    this.appletsSpawned++;
                                }
                            }
                        }
                    });
                }
                else {
                    this.applets[i] = {
                        appletIdx: i+1,
                        name:classObj.name,
                        classinstance: new classObj.cls("applets",this.bcisession,config)
                    }
                    this.appletsSpawned++;
                }
            }
        });
        this.initApplets();
        
    }

    appletDivSettings = (appletDiv, appletIdx) => {
        appletDiv.style.gridArea = String.fromCharCode(97 + appletIdx);
        appletDiv.style.overflow = 'hidden'
        // appletDiv.draggable = true
        // appletDiv.style.cursor = 'move'
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
        });
    }

    //initialize applets added to the list into each container by index
    initApplets = () => {

        // Assign applets to proper areas
        this.applets.forEach((applet,i) => {
            if(applet.classinstance.AppletHTML === null) { applet.classinstance.init(); }
            let appletDiv =  applet.classinstance.AppletHTML.node;
            appletDiv.style.gridArea = String.fromCharCode(97 + i);
            appletDiv.style.overflow = 'hidden'
            appletDiv.name = applet.name

            // Drag functionality
            // appletDiv.draggable = true
            // appletDiv.classList.add("draggable")
            appletDiv.addEventListener('dragstart', () => {
                appletDiv.classList.add("dragging")
            })
            appletDiv.addEventListener('dragend', () => {
                appletDiv.classList.remove("dragging")
            })

            appletDiv.addEventListener('dragover', (e) => {
                e.preventDefault()
                // let dragging = document.querySelector('.dragging')
                // let draggingApplet = this.applets.find(applet => applet.name == dragging.name) 
                // let hoveredApplet = this.applets.find(applet => applet.name == appletDiv.name)
                // this.applets[draggingApplet.appletIdx - 1].appletIdx = hoveredApplet.appletIdx;
                // this.applets[hoveredApplet.appletIdx - 1].appletIdx = draggingApplet.appletIdx;
                // let htmlString = '<h1>Replaced!</h1>'
                // appletDiv.innerHTML = htmlString.trim();
                // appletDiv.parentNode.replaceChild(appletDiv,appletDiv)
                appletDiv.classList.add('hovered')
            })

            appletDiv.addEventListener('dragleave', (e) => {
                e.preventDefault()
                // let dragging = document.querySelector('.dragging')
                // let draggingApplet = this.applets.find(applet => applet.name == dragging.name) 
                // let hoveredApplet = this.applets.find(applet => applet.name == appletDiv.name)
                // this.applets[draggingApplet.appletIdx - 1].appletIdx = hoveredApplet.appletIdx;
                // this.applets[hoveredApplet.appletIdx - 1].appletIdx = draggingApplet.appletIdx;
                // let htmlString = '<h1>Replaced!</h1>'
                // appletDiv.innerHTML = htmlString.trim();
                // appletDiv.parentNode.replaceChild(appletDiv,appletDiv)
                appletDiv.classList.remove('hovered')
            })

            appletDiv.addEventListener("drop", function(event) {
                event.preventDefault();
                let dragging = document.querySelector('.dragging')
                appletDiv.classList.remove('hovered')
              }, false);

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
            });
        });
        this.responsive();
    }

    addApplet = (appletClassIdx, appletIdx, settings=undefined) => {
        if(this.appletsSpawned < this.maxApplets) {
            var classObj = this.appletClasses[appletClassIdx];
            var found = this.applets.find((o,i) => {
                if(o.appletIdx === appletIdx) {
                    this.deinitApplet(appletIdx);
                    return true;
                }
            });
            //let containerId = Math.floor(Math.random()*100000)+"applet";
            //let container = new DOMFragment(`<div id=${containerId}></div>`,"applets"); //make container, then delete when deiniting (this.applets[i].container.deleteFragment());
                   
            //var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets.push({appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession), container: container});}
            //else { this.applets.splice(pos,0,{appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession), container: container});}
            var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets[pos] = {appletIdx: pos+1,name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession,settings)};}
            else { this.applets[pos] = {appletIdx: pos+1, name: classObj.name, classinstance: new classObj.cls("applets",this.bcisession,settings)};}
            
            this.applets[pos].classinstance.init();

            let appletDiv =  this.applets[pos].classinstance.AppletHTML.node;
            this.appletDivSettings(appletDiv, pos);
            // this.applets[pos].classinstance.AppletHTML.node.style.gridArea = String.fromCharCode(97 + pos)
            // console.log(this.applets[pos].classinstance.AppletHTML.node.style.gridArea)
            this.appletsSpawned++;
            this.responsive();
            console.log("applet added");
        }
    }

    deinitApplet = (appletIdx) => {
        var stateIdx = null;
        var found = this.applets.find((o,i) => {
            if(o.appletIdx === appletIdx) {
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
                if (this.applets[stateIdx].classinstance != null){
                    this.applets[stateIdx].classinstance.deinit();
                }
                //this.applets[stateIdx].container.deleteFragment();
                this.applets[stateIdx] = {appletIdx: stateIdx+1,name:null,classinstance: null};
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

        // Create grid subdivisions based on applet count
        let activeNodes = nodes.filter(n => n.classinstance != null)
        let gridRows = Math.ceil(Math.sqrt(nodes.length))
        let innerStrings = Array.from({length: gridRows}, e => [])
        nodes.forEach((applet,i,self) => {
            if (activeNodes.length > 1){
                if (applet.classinstance != null){
                    innerStrings[Math.floor(i/Math.ceil(Math.sqrt(self.length)))].push(String.fromCharCode(97 + i));
                } else {
                    if (Math.floor(i/gridRows) == Math.floor((i+1)/gridRows)){
                        innerStrings[Math.floor(i/gridRows)].push(String.fromCharCode(97 + (i+1)));
                    } else if (Math.floor(i/gridRows) == Math.floor((i-1)/gridRows)){
                        innerStrings[Math.floor(i/gridRows)].push(String.fromCharCode(97 + (i-1)));
                    }
                }
            } else {
                innerStrings[Math.floor(i/gridRows)].push(String.fromCharCode(97 + (activeNodes[0].appletIdx-1)));
            }
            })
        innerStrings = innerStrings.map((stringArray) => {
            return '"' + stringArray.join(' ') + '"'
        }).join(' ')
        let applets = document.getElementById('applets');
        console.log(applets.style.gridTemplateAreas)
        console.log(innerStrings)
        applets.style.gridTemplateAreas = innerStrings
        applets.style.gridTemplateColumns = `repeat(${gridRows},1fr)`
        applets.style.gridTemplateRows =  `repeat(${gridRows},1fr)`

        activeNodes.forEach((appnode,i) => {
            let appletDiv =  appnode.classinstance.AppletHTML.node;
            let gridPercent = 100/(Math.ceil(Math.sqrt(nodes.length)));
            if (nodes.length === 1){
                appletDiv.style.maxHeight = `calc(${100}vh)`; // Must subtract top navigation bar
                console.log('setting to 100')
            } else if (nodes.length === 2){
                appletDiv.style.maxHeight = `calc(${50}vh)`; // Must subtract top navigation bar       
            } else {
                appletDiv.style.maxHeight = `calc(${gridPercent}vh)`; // Must subtract top navigation bar
            }
        });
        

        activeNodes.forEach((applet,i) => {
            applet.classinstance.responsive();
        });
    }
}