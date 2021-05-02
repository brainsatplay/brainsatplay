import { Session } from "../../library/src/Session";
import { getApplet, presets, AppletInfo, getAppletSettings } from "../applets/appletList"
import appletSVG from './../../assets/th-large-solid.svg'
import dragSVG from './../../assets/arrows-alt-solid.svg'

//By Garrett Flynn, Joshua Brewster (GPL)

export class AppletManager {
    /**
     * @constructor
     * @alias AppletManager
     * @description Main container for WebBCI applets.
     */
    constructor(initUI = () => { }, deinitUI = () => { }, appletConfigs = [], appletSelectIds = [], bcisession = new Session()) {
        this.initUI = initUI;
        this.deinitUI = deinitUI;
        this.initUI();

        this.appletsSpawned = 0;
        this.appletConfigs = appletConfigs;

        // Layout Constraints
        if (!window.isMobile) {
            this.maxApplets = 16;
        } else {
            this.maxApplets = 1;
        }

        if (appletSelectIds.length === 0 && Array.isArray(appletSelectIds)){
            appletSelectIds = Array.from({length: this.maxApplets}, (e,i) => `applet${i}`)
        }

        this.layoutTemplates = {
            'Focus': {
                maxApplets: 6,
                generate: (labels) => {
                    let rows = 3
                    let bottomCols = labels.active.length - 1
                    return Array.from({ length: rows }, e => []).map((a, i) => {
                        if (bottomCols > 0) {
                            if (i < rows - 1) {
                                for (let j = 0; j < bottomCols; j++) a.push(labels.active[0])
                            } else {
                                for (let j = 0; j < bottomCols; j++) a.push(labels.active[j + 1])
                            }
                        } else {
                            a.push(labels.active[0])
                        }
                        return a
                    })
                }
            },
            'Grid': {
                maxApplets: 16,
                generate: (labels) => {
                    let layout;
                    let gridResolution = 2

                    let repeatForGridResolution = (layout, resolution) =>{
                        layout = layout.map((row,i) => {
                            let newRow = row.map((col,j) => {
                                return Array.from({length: resolution}, e => col)
                            })
                            return Array.from({length: resolution}, e => newRow.flat())
                        })
                        return layout.flat()
                    }

                    let rows = Math.ceil(Math.sqrt(labels.active.length))*gridResolution
                    if (labels.active.length == 0) layout = [[]]
                    if (labels.active.length == 1) layout = repeatForGridResolution([[`a`]],gridResolution)
                    if (labels.active.length == 2) layout = repeatForGridResolution([[`a`,`b`]],gridResolution)
                    if (labels.active.length == 3) layout = repeatForGridResolution([[`a`,`b`], [`c`,`c`]],gridResolution)
                    if (labels.active.length == 4) layout = repeatForGridResolution([[`a`,`b`], [`c`,`d`]],gridResolution)
                    if (labels.active.length == 5) layout = repeatForGridResolution([[`a`,`d`], [`a`,`d`], [`b`,`d`], [`b`,`e`], [`c`,`e`],[`c`,`e`]],gridResolution)
                    if (labels.active.length == 6) layout = repeatForGridResolution([[`a`,`b`,`c`], [`d`,`f`,`f`], [`e`,`f`,`f`]],gridResolution)
                    if (labels.active.length == 7) layout = repeatForGridResolution([[`a`,`b`,`c`], [`d`,`e`,`f`], [`g`,`g`,`g`]],gridResolution)
                    if (labels.active.length == 8) layout = repeatForGridResolution([[`a`,`a`,`b`,`b`,`c`,`c`], [`d`,`d`,`e`,`e`,`f`,`f`], [`g`,`g`,`g`,`h`,`h`,`h`]],gridResolution)
                    if (labels.active.length == 9) layout = repeatForGridResolution([[`a`,`b`,`c`], [`d`,`e`,`f`], [`g`,`h`,`i`]],gridResolution)
                    if (labels.active.length == 10) layout = repeatForGridResolution([[`a`,`b`,`c`,`d`], [`e`,`f`,`g`,`h`], [`i`,`i`,`j`,`j`]],gridResolution)
                    if (labels.active.length == 11) layout = repeatForGridResolution([[`a`,`a`,`a`,`b`,`b`,`b`,`c`,`c`,`c`,`d`,`d`,`d`], 
                                                                                      [`e`,`e`,`e`,`f`,`f`,`f`,`g`,`g`,`g`,`h`,`h`,`h`], 
                                                                                      [`i`,`i`,`i`,`i`,`j`,`j`,`j`,`j`,`k`,`k`,`k`,`k`]],gridResolution)
                    if (labels.active.length == 12) layout = repeatForGridResolution([[`a`,`b`,`c`,`d`], [`e`,`f`,`g`,`h`], [`i`,`j`,`k`,`l`]],gridResolution)
                    if (labels.active.length == 13) layout = repeatForGridResolution([[`a`,`b`,`c`,`d`], [`e`,`f`,`g`,`h`], [`i`,`j`,`m`,`m`], [`k`,`l`,`m`,`m`]],gridResolution)
                    if (labels.active.length == 14) layout = repeatForGridResolution([[`a`,`b`,`c`,`d`], [`e`,`f`,`g`,`h`], [`i`,`j`,`k`,`l`],[`m`,`m`,`n`,`n`]],gridResolution)
                    if (labels.active.length == 15) layout = repeatForGridResolution([[`a`,`a`,`a`,`b`,`b`,`b`,`c`,`c`,`c`,`d`,`d`,`d`], 
                                                                                      [`e`,`e`,`e`,`f`,`f`,`f`,`g`,`g`,`g`,`h`,`h`,`h`], 
                                                                                      [`i`,`i`,`i`,`j`,`j`,`j`,`k`,`k`,`k`,`l`,`l`,`l`],
                                                                                      [`m`,`m`,`m`,`m`,`n`,`n`,`n`,`n`,`o`,`o`,`o`,`o`]],gridResolution)
                    if (labels.active.length == 16) layout = repeatForGridResolution([[`a`,`b`,`c`,`d`], [`e`,`f`,`g`,`h`], [`i`,`j`,`k`,`l`], [`m`,`n`,`o`,`p`]],gridResolution)
                //     else {
                //     let layout = Array.from({ length: rows }, e => []).map((a, i) => {
                //         for (let j = 0; j < rows; j++) {
                //             a.push(labels.all[rows * (i) + j])
                //         }
                //         return a
                //     })

                //     let getReplacementLabel = ({ active, inactive, all }, baseLayout, i, j) => {
                //         if (active.includes(baseLayout[i][j - 1])) return baseLayout[i][j - 1]
                //         if (active.includes(baseLayout[i][j + 1])) return baseLayout[i][j + 1]
                //         if (baseLayout[i - 1] != null && active.includes(baseLayout[i - 1][j])) return baseLayout[i - 1][j]
                //         if (baseLayout[i + 1] != null && active.includes(baseLayout[i + 1][j])) return baseLayout[i + 1][j]
                //         else return labels.active.shift()
                //     }

                //     layout = layout.map((row, i) => {
                //         return row.map((val, j) => {
                //             if (labels.inactive.includes(val)) { // Replace inactive applets
                //                 return getReplacementLabel(labels, layout, i, j) ?? val
                //             }
                //             else return val
                //         })
                //     })
                // }
                return layout
                }
            }
        }

        this.appletPresets = presets

        document.getElementById("preset-selector").innerHTML += `
        <option value='default' disabled selected>Browse presets</option>
        `
        this.appletPresets.forEach((obj, i) => {
            if (i === 0) document.getElementById("preset-selector").innerHTML += `<option value=${obj.value}>${obj.name}</option>`
            else document.getElementById("preset-selector").innerHTML += `<option value=${obj.value}>${obj.name}</option>`
        })

        // Other
        this.applets = Array.from({ length: this.maxApplets }, (e, i) => { return { appletIdx: i + 1, name: null, classinstance: null } });

        this.session = bcisession;

        this.appletSelectIds = appletSelectIds;
        this.appletSelectIds.forEach((selectId,appletIdx) => {
            document.body.querySelector('.applet-select-container').innerHTML += `
            <div id='brainsatplay-selector-${selectId}' style="display: grid;  width: 100%; margin: 10px 25px 0px 25px; grid-template-columns: 1fr 1fr;">
                <span style="margin:auto 0; font-size: 80%">Applet ${appletIdx}</span>
                <select id="${selectId}" style="width: 100%;"></select>
            </div>`
        })
        
        this.initAddApplets(appletConfigs);

        window.addEventListener('resize', () => {
            this.responsive();
        })

        this.prevHovered = null;

        //this.responsive(); 

        // Set Styling Properly
        let applets = document.getElementById('applets');
        applets.style.display = 'grid'
        applets.style.height = 'calc(100vh)' // Must subtract any top navigation bar
        applets.style.width = 'calc(100vw - 75px)'

    }

    initUI = () => { }

    deinitUI = () => { }

    // Check class compatibility with current devices
    checkDeviceCompatibility = (appletInfo, devices = this.session.devices) => {
        let compatible = false
        if (this.session.devices.length === 0) compatible = true
        else {
            this.session.devices.forEach((device) => {
                if (Array.isArray(appletInfo.devices)) { // Check devices only
                    if (appletInfo.devices.includes(device.info.deviceType) || appletInfo.devices.includes(device.info.deviceName)) compatible = true
                }
                else if (typeof appletInfo.devices === 'object') { // Check devices AND specific channel tags
                    if (appletInfo.devices.includes(device.info.devices.deviceType) || appletInfo.devices.devices.includes(device.info.deviceName)) {
                        if (appletInfo.devices.eegChannelTags) {
                            appletInfo.devices.eegChannelTags.forEach((tag, k) => {
                                let found = o.atlas.eegshared.eegChannelTags.find((t) => {
                                    if (t.tag === tag) {
                                        return true;
                                    }
                                });
                                if (found) compatible = true;
                            });
                        }
                    }
                }
            })
        }

        return compatible
    }

    //add the initial list of applets
    initAddApplets = (appletConfigs = []) => {

        // Load Config
        let preset = undefined;
        let showOptions = true;

        if (appletConfigs.length === 0) {
            preset = this.appletPresets.find(preset => preset.value === document.getElementById("preset-selector").value);
            if (preset != null) this.appletConfigs = preset.applets;
            else this.appletConfigs = ['Applet Browser']
        } else {
            // disabled settings reloading for now
            if (appletConfigs.length === 1) {
                if (typeof appletConfigs[0] === 'string') {
                    preset = this.appletPresets.find((p) => {
                        if (p.value.toLowerCase() == appletConfigs[0].toLowerCase()) {
                            document.getElementById("preset-selector").value = p.value;
                            this.appletConfigs = p.applets
                            return true;
                        } else {
                            document.getElementById("preset-selector").value = 'default';
                            return false
                        }
                    });
                } else {
                    this.appletConfigs = appletConfigs;
                }
            } else {
                this.appletConfigs = appletConfigs;
            }
        }
        if (preset) {
            if (preset.value.includes('HEG')) {
                if (this.session.atlas.settings.heg === false) {
                    this.session.atlas.addHEGCoord(0);
                    this.session.atlas.settings.heg = true;
                }
            } else if (preset.value.includes('EEG')) {
                if (this.session.atlas.settings.eeg === false) {
                    this.session.atlas.settings.eeg = true;
                }
            }

            if (preset.lock == true) {
                showOptions = false
            }
        }

        let appletPromises = []
        // Grab Correct Applets
        let currentApplets = this.applets.map(applet => applet.name)
        let isAllNull = (s, a) => s + ((a != null) ? 1 : 0)

        this.appletConfigs.forEach(conf => {
            if (typeof conf === 'object') {
                if (!currentApplets.reduce(isAllNull, 0) && AppletInfo[conf.name] != null) {
                    appletPromises.push(new Promise(async (resolve, reject) => {
                        let settings = await getAppletSettings(AppletInfo[conf.name].folderUrl)
                        let applet = await getApplet(settings)
                        if (applet != null) return resolve(applet)
                        else return reject('applet does not exist')
                    }))
                }
            }
            else if (!currentApplets.reduce(isAllNull, 0) && AppletInfo[conf] != null) {
                appletPromises.push(new Promise(async (resolve, reject) => {
                    let settings = await getAppletSettings(AppletInfo[conf].folderUrl)
                    let applet = await getApplet(settings)
                    if (applet != null) return resolve(applet)
                    else return reject('applet does not exist')
                }))
            }
        })

        // If no applets have been configured, redirect to base URL
        if (appletPromises.length == 0) {
            appletPromises = [(async () => { return getApplet(await getAppletSettings(AppletInfo['Applet Browser'].folderUrl)) })()]
            window.history.replaceState({ additionalInformation: 'Updated Invalid URL' }, '', window.location.origin)
        }

        Promise.all(appletPromises).then((configApplets) => {

            // Check the compatibility of current applets with connected devices
            this.appletsSpawned = 0;
            currentApplets.forEach(async (appname, i) => {
                let appletSettings = (appname != null) ? AppletInfo[appname] : null
                let compatible = false;
                if (appletSettings != null) compatible = this.checkDeviceCompatibility(appletSettings) // Check if applet is compatible with current device(s)
                // else if (currentApplets.reduce((tot,cur) => tot + (cur == undefined)) != currentApplets.length-1) compatible = true // If all applets are not undefined, keep same layout

                // Replace incompatible applets
                if (!compatible) {
                    // Deinit old applet
                    if (this.applets[i].classinstance != null) {
                        this.deinitApplet(this.applets[i].appletIdx);
                    }

                    // Add new applet
                    let appletCls = configApplets[0]
                    if (appletCls) {
                        let config = undefined;
                        if (typeof this.appletConfigs[i] === 'object') {
                            config = this.appletConfigs[i].settings;
                        }
                        this.applets[i] = {
                            appletIdx: i + 1,
                            name: this.appletConfigs[i],
                            classinstance: new appletCls("applets", this.session, config)
                        }
                        configApplets.splice(0, 1)
                        this.appletsSpawned++;
                    }
                } else {
                    this.appletsSpawned++;
                }
            })

            this.initApplets();

            // Generate applet selectors

            if (showOptions) {
                this.showOptions()
            } else {
                document.body.querySelector('.applet-select-container').style.display = 'none'
            }
        })
    }

    setAppletDefaultUI = (appletDiv, appletIdx) => {

        // Brains@Play Default Overlays

        // let thisApplet = this.applets.find(o => {
        //     if (o.appletIdx === appletIdx){
        //         return o.classinstance
        //     }
        // })
        // console.log(thisApplet)

        if (document.getElementById(`${appletDiv.id}-brainsatplay-default-ui`) == null) // Check if default UI already exists
        {

            appletDiv.style.gridArea = String.fromCharCode(97 + appletIdx);
            appletDiv.style.position = `relative`;
            
            let thisApplet = this.applets[appletIdx].classinstance
            let appletName = thisApplet.info.name
            console.log(AppletInfo[appletName].folderUrl)
            if (!AppletInfo[appletName].folderUrl.includes('/UI/')) {
                getAppletSettings(AppletInfo[appletName].folderUrl).then(appletSettings => {

                    var div = document.createElement('div');

                    let htmlString = `
            <div style="position: absolute; right: 0px; top: 0px; padding: 15px 15px 30px 30px; font-size: 80%; display:flex; z-index: 1000; opacity: 0.25; transition: opacity 0.5s;" onMouseOver="this.style.opacity = 1;" onMouseOut="this.style.opacity = 0.25;">
                <div class="brainsatplay-default-info-toggle"  style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 25px; height: 25px; border: 1px solid white; border-radius: 50%; margin: 2.5px; background: black;">
                    <p>i</p>
                </div>
                <div class="brainsatplay-default-applet-toggle" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 25px; height: 25px; border: 1px solid white; border-radius: 50%; margin: 2.5px; background: black;">
                    <img src="${appletSVG}" 
                    style="box-sizing: border-box; 
                    filter: invert(1);
                    cursor: pointer;
                    padding: 7px;">
                </div>
                <div class="brainsatplay-default-drag-icon"  style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 25px; height: 25px; border: 1px solid white; border-radius: 50%; margin: 2.5px; background: black;">
                    <img src="${dragSVG}" 
                    style="box-sizing: border-box; 
                    filter: invert(1);
                    cursor: pointer;
                    padding: 7px;">
                </div>
            </div>
            <div class="brainsatplay-default-applet-mask" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.75); opacity: 0; pointer-events: none; z-index: 999; transition: opacity 0.5s; padding: 5%;">
            </div>
            <div class="brainsatplay-default-info-mask" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.75); opacity: 0; pointer-events: none; z-index: 999; transition: opacity 0.5s; padding: 5%; overflow: scroll;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr)">
                    <div>
                    <h1 style="margin-bottom: 0; padding-bottom: 0;">${appletSettings.name}</h1>
                    <p style="font-size: 69%;">${appletSettings.description}</p>
                    </div>
                    <div style="font-size: 80%;">
                        <p>Devices: ${appletSettings.devices.join(', ')}</p>
                        <p>Categories: ${appletSettings.categories.join(' + ')}</p>
                    </div>
                </div>
                <hr>
                <h2>Instructions</h2>
                <p>${appletSettings.instructions}</p>
            </div>
            `

                    div.innerHTML = htmlString.trim();
                    div.id = `${appletDiv.id}-brainsatplay-default-ui`
                    appletDiv.appendChild(div);

                    let appletMask = appletDiv.querySelector('.brainsatplay-default-applet-mask')
                    let infoMask = appletDiv.querySelector('.brainsatplay-default-info-mask')
                    let dragIcon = appletDiv.querySelector('.brainsatplay-default-drag-icon')

                    let instance = null;
                    appletDiv.querySelector('.brainsatplay-default-applet-toggle').onclick = async (e) => {
                        if (appletMask.style.opacity != 0) {
                            appletMask.style.opacity = 0
                            appletMask.style.pointerEvents = 'none'
                        } else {
                            appletMask.style.opacity = 1
                            appletMask.style.pointerEvents = 'auto'
                            infoMask.style.opacity = 0;
                            infoMask.style.pointerEvents = 'none';
                            if (instance == null) {
                                await getApplet(await getAppletSettings(AppletInfo['Applet Browser'].folderUrl)).then((browser) => {
                                    instance = new browser(appletMask, this.session, [
                                        {
                                            appletIdx: appletIdx,
                                            showPresets: false,
                                            displayMode: 'tight'
                                        }
                                    ]);
                                    instance.init()

                                    thisApplet.deinit = (() => {
                                        var defaultDeinit = thisApplet.deinit;
                                    
                                        return function() {    
                                            instance.deinit()
                                            appletDiv.querySelector('.brainsatplay-default-applet-toggle').click()                              
                                            let result = defaultDeinit.apply(this, arguments);                              
                                            return result;
                                        };
                                    })()
                                })
                            }
                        }
                    }

                    appletDiv.querySelector('.brainsatplay-default-info-toggle').onclick = (e) => {
                        if (infoMask.style.opacity != 0) {
                            infoMask.style.opacity = 0
                            infoMask.style.pointerEvents = 'none'
                        } else {
                            infoMask.style.opacity = 1
                            infoMask.style.pointerEvents = 'auto'
                            appletMask.style.opacity = 0;
                            appletMask.style.pointerEvents = 'none';
                        }
                    }
            
                    // Drag functionality
                    // appletDiv.draggable = true

                    let swapped = null
                    dragIcon.classList.add("draggable")
                    dragIcon.addEventListener('dragstart', () => {
                        appletDiv.classList.add("dragging")
                    })
                    dragIcon.addEventListener('dragend', () => {
                        appletDiv.classList.remove("dragging")
                    })
            
                    appletDiv.addEventListener('dragover', (e) => {
                        e.preventDefault()
                        if (this.prevHovered != appletDiv){
                            let draggingGA = document.querySelector('.dragging').style.gridArea
                            let hoveredGA = appletDiv.style.gridArea
                            appletDiv.style.gridArea = draggingGA
                            document.querySelector('.dragging').style.gridArea = hoveredGA
                            this.responsive()
                            this.prevHovered = appletDiv
                            if (appletDiv != document.querySelector('.dragging')){
                                this.lastSwapped = appletDiv
                            }
                        }
                        appletDiv.classList.add('hovered')
                    })
            
                    appletDiv.addEventListener('dragleave', (e) => {
                        e.preventDefault()
                        appletDiv.classList.remove('hovered')
                    })
            
                    appletDiv.addEventListener("drop", (event) => {
                        event.preventDefault();
                        let dragging = document.querySelector('.dragging')
                        appletDiv.classList.remove('hovered')
                        let draggingApplet = this.applets.find(applet => applet.name == dragging.name) 
                        let lastSwappedApplet = this.applets.find(applet => applet.name == this.lastSwapped.name)
                        let _temp = draggingApplet.appletIdx;
                        draggingApplet.appletIdx = lastSwappedApplet.appletIdx;
                        lastSwappedApplet.appletIdx = _temp;
                        this.showOptions()

                        for (let hovered of document.querySelectorAll('.hovered')){
                            hovered.classList.remove('hovered')
                        }
                    }, false);
            
                    // Fullscreen Functionality
                    appletDiv.addEventListener('dblclick', () => {
                        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
                        if (!fullscreenElement) {
                            if (appletDiv.requestFullscreen) {
                                appletDiv.requestFullscreen()
                            } else if (appletDiv.webkitRequestFullscreen) {
                                appletDiv.webkitRequestFullscreen()
                            }
                        } else {
                            if (document.exitFullscreen) {
                                document.exitFullscreen()
                            } else if (document.webkitExitFullscreen) {
                                document.webkitExitFullscreen()
                            }
                        }
                    });


                })
            }
        }
    }

    //initialize applets added to the list into each container by index
    initApplets = (settings = []) => {

        // Assign applets to proper areas
        this.applets.forEach((applet, i) => {
            if (applet.classinstance != null) {
                if (applet.classinstance.AppletHTML === null || applet.classinstance.AppletHTML === undefined) { applet.classinstance.init(); }
                let appletDiv; if (applet.classinstance.AppletHTML) appletDiv = applet.classinstance.AppletHTML.node;
                appletDiv.name = applet.name
            }
        });
        this.enforceLayout();
        setTimeout(() => {
            this.responsive();
        }, 100)
    }

    addApplet = (appletCls, appletIdx, settings = undefined) => {
        if (this.appletsSpawned < this.maxApplets) {
            var found = this.applets.find((o, i) => {
                if (o.appletIdx === appletIdx) {
                    this.deinitApplet(appletIdx);
                    return true;
                }
            });
            //let containerId = Math.floor(Math.random()*100000)+"applet";
            //let container = new DOMFragment(`<div id=${containerId}></div>`,"applets"); //make container, then delete when deiniting (this.applets[i].container.deleteFragment());

            //var pos = appletIdx-1; if(pos > this.applets.length) {pos = this.applets.length; this.applets.push({appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.session), container: container});}
            //else { this.applets.splice(pos,0,{appletIdx: appletIdx, name: classObj.name, classinstance: new classObj.cls("applets",this.session), container: container});}
            var pos = appletIdx - 1; if (pos > this.applets.length) { pos = this.applets.length; this.applets[pos] = { appletIdx: pos + 1, name: classObj.name, classinstance: new appletCls("applets", this.session, settings) }; }
            else { this.applets[pos] = { appletIdx: pos + 1, name: appletCls.name, classinstance: new appletCls("applets", this.session, settings) }; }

            this.applets[pos].classinstance.init();

            //let appletDiv =  this.applets[pos].classinstance.AppletHTML.node;
            // this.applets[pos].classinstance.AppletHTML.node.style.gridArea = String.fromCharCode(97 + pos)

            this.appletConfigs = [];
            this.applets.forEach((applet) => {
                if (applet.name !== null) {
                    this.appletConfigs.push(applet.name);
                }
            })
            this.appletsSpawned++;
            this.enforceLayout();
            this.responsive();
        }
    }

    deinitApplet = (appletIdx) => {
        var found = this.applets.find((o, i) => {
            if (o.appletIdx === appletIdx && o.classinstance != null) {
                if (this.applets[i].classinstance != null) {
                    this.applets[i].classinstance.deinit();
                }
                this.applets[i] = { appletIdx: i + 1, name: null, classinstance: null };
                this.appletsSpawned--;
                this.enforceLayout();
                this.responsive();
                return true;
            }
        });
    }

    deinitApplets() {
        this.applets.forEach((applet) => {
            this.deinitApplet(applet.appletIdx);
        })
    }

    reinitApplets = () => {
        this.applets.forEach((applet, i) => {
            applet.classinstance.deinit();
            applet.classinstance.init();
        });
        this.responsive();
    }

    updateOptionVisibility = () => {
        this.appletSelectIds.forEach((id, i) => {
            let div = document.getElementById(`brainsatplay-selector-${id}`)
                if (i < this.maxApplets) {
                    div.style.display = 'grid'
                } else {
                    div.style.display = 'none'
                }
            })
    }

    showOptions = () => {
        document.body.querySelector('.applet-select-container').style.display = 'flex'
        this.appletSelectIds.forEach((id, i) => {
            this.generateAppletOptions(id, i);
            this.updateOptionVisibility()
        })
    }

    generateAppletOptions = (selectId, appletIdx) => {
        
        const select = document.getElementById(selectId);
        select.innerHTML = "";
        let newhtml = `<option value='None'>None</option>`;
        let appletKeys = Object.keys(AppletInfo)

        let arrayAppletIdx = this.applets.findIndex((o, i) => {
            if (o.appletIdx === appletIdx+1) {
                return true
            }
        })

        appletKeys.forEach((name) => {
            if (!['Applet Browser','Randomizer'].includes(name)) {
                if (this.checkDeviceCompatibility(AppletInfo[name])) {
                    if (this.applets[arrayAppletIdx] && this.applets[arrayAppletIdx].name === name) {
                        newhtml += `<option value='` + name + `' selected="selected">` + name + `</option>`;
                    }
                    else {
                        newhtml += `<option value='` + name + `'>` + name + `</option>`;
                    }
                }
            }
        });
        select.innerHTML = newhtml;

        select.onchange = async (e) => {
            console.log('changed')
            this.deinitApplet(appletIdx + 1);
            if (select.value !== 'None') {
                let appletCls = await getApplet(await getAppletSettings(AppletInfo[select.value].folderUrl))
                this.addApplet(appletCls, appletIdx + 1);
            }
        }
    }

    enforceLayout(nodes = this.applets) {

        let layoutSelector = document.getElementById('layout-selector')
        let nodeLabels = {
            active: [],
            inactive: [],
            all: []
        }

        this.applets.forEach((app, i) => {
            if (app.classinstance != null) {
                nodeLabels.active.push(String.fromCharCode(97 + app.appletIdx - 1))
            } else {
                nodeLabels.inactive.push(String.fromCharCode(97 + app.appletIdx - 1))
            }
            nodeLabels.all.push(String.fromCharCode(97 + app.appletIdx - 1))
        })

        this.maxApplets = this.layoutTemplates[layoutSelector.value].maxApplets
        let responsiveLayout = this.layoutTemplates[layoutSelector.value].generate(nodeLabels)

        let layoutRows = responsiveLayout.length
        let layoutColumns = responsiveLayout[0].length
        let activeNodes = nodes.filter(n => n.classinstance != null)

        // Get Row Assignments
        let rowAssignmentArray = Array.from({ length: nodes.length }, e => new Set())
        responsiveLayout.forEach((row, j) => {
            row.forEach((col, k) => {
                if (col != null) rowAssignmentArray[col.charCodeAt(0) - 97].add(j)
            })
        })

        let innerStrings = responsiveLayout.map((stringArray) => {
            return '"' + stringArray.join(' ') + '"'
        }).join(' ')


        let applets = document.getElementById('applets');
        applets.style.gridTemplateAreas = innerStrings
        applets.style.gridTemplateColumns = `repeat(${layoutColumns},minmax(0, 1fr))`
        applets.style.gridTemplateRows = `repeat(${layoutRows},minmax(0, 1fr))`

        activeNodes.forEach((appnode, i) => {
            // Set Generic Applet Settings
            if (appnode.classinstance.AppletHTML) this.setAppletDefaultUI(appnode.classinstance.AppletHTML.node, appnode.appletIdx - 1);
        });
        this.updateOptionVisibility()
    }

    responsive(nodes = this.applets) {
        let activeNodes = nodes.filter(n => n.classinstance != null)
        activeNodes.forEach((applet, i) => {
            applet.classinstance.responsive();
        });
    }
}