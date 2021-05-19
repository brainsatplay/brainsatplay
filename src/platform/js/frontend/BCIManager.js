//summon the web bci app browser/launcher/manager from here

//By Joshua Brewster, Garrett Flynn (GPL)

//Setup State
//Setup Templates & UI Logic i.e. applet and file selection menus, and general BCI control menus
//Setup UI Manager
//  -- Setup App Browser and cross-app accessible data via the state manager
//  -- Setup BCI controls e.g. to control analysis on-the-fly.
//Setup BrowserFS logic for indexedDB

import {
    page_template,
    topbar_template,
    appletbox_template,  
    appletselect_template,
    filemenu_template,
    file_template,
    login_template
} from './menus/UITemplates'

import {AppletManager} from './AppletManager'
import {CSV} from '../general/csv'
import { StateManager } from '../../../libraries/js/src/ui/StateManager';
import { DOMFragment } from '../../../libraries/js/src/ui/DOMFragment';
import { TutorialManager } from './utils/TutorialManager';

// Imagess
import DeviceSelectorIcon from '../../assets/wave-square-solid.svg';
import AppletMenuIcon from '../../assets/th-large-solid.svg';
import FileManagerIcon from '../../assets/folder-solid.svg';
import GoogleIcon from '../../assets/google.png';




import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs')
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;


export class BCIAppManager {
    /**
     * @constructor
     * @alias BCIAppManager
     * @description Summon the WebBCI app manager.
     */
    constructor(
        session=null,
        appletConfigs=[],   //expects an object array like           [{name:"",idx:n,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
        useFS=true         //launch with browserfs initialized
    ) {

        this.state = new StateManager({
            sessionName:'',
            autosaving:true,
            saveChunkSize:0,
            saveChunkSize:2000,
            sessionChunks:0,
            eegSaveCounter:0,
            hegSaveCounter:0,
            newSessionCt:0,
            fileSizeLimitMb: 250
        });

        this.uiFragments = {
            controls:undefined,
        }; //store DOMFragments for the UI here

        this.session = session; //brainsatplay class instance
        this.appletConfigs = appletConfigs;
        this.appletSelectIds = []
        this.appletManager;
        this.fs;
        this.useFS = useFS;

        if(this.useFS === true) {
            this.initFS();
        } else { this.init(); }

        this.tutorialManager = new TutorialManager();

        this.currentState = null

        // Push state on initialization
        if (this.currentState){
            this.currentState = window.location.href
            window.history.pushState({ additionalInformation: 'Updated URL on Initialization'},'',`${window.location.href}`)
        }

        // Set Update on Forward/Back Button
        window.onpopstate = (e) => {
            if (e.state){
                // this.uiFragments.appletbox.deleteNode();
                let presetSelector = document.getElementById('preset-selector')
                let layoutSelector = document.getElementById('layout-selector')
                if (presetSelector != null) presetSelector.value = 'default'
                if (layoutSelector != null) layoutSelector.value = 'Focus'
                let configs = this.getConfigsFromHashes(); //overrides old settings
                if (this.appletManager != null){
                    this.appletManager.deinitApplets()
                    this.appletManager.appletConfigs = configs
                    this.appletManager.initAddApplets(configs)
                }
            }
        }

        // Keyboard Shortcuts
        document.onkeyup = (e) => {

        // Screenshot all canvases
        if (e.ctrlKey && e.shiftKey && e.which == 83) { // CTRL + SHIFT + s
            this.downloadImages()
        } 
        // Screenshot all canvases as feature images
        else if (e.ctrlKey && e.shiftKey && e.which == 70) { // CTRL + SHIFT + f
            this.downloadImages(1080,540)
        }
    };


    }

    setupUITemplates = () => {

        let connectHTML = `
        <div class="app">
        <div id="sidebar-container">
            <div id="sidebar">
            <div id="sidebar-inner">
                <div style="width: 100%;">
                <a id="applet-browser-button" style="cursor: pointer;">
                    <div class="logo-container">
                        <img class="logo" src="./logo512.png">
                    </div>
                </a>
                <div id="device-menu" class="collapsible-container">
                    <button><div class="img-cont"><img src="${DeviceSelectorIcon}"><span>Device Manager</span></div></button>
                    <div class="content">
                    </div>
                </div>
                <div id="applet-menu" class="collapsible-container">
                    <button class="collapsible"><div class="img-cont"><img src="${AppletMenuIcon}"><span>Applets</span></div></button>
                    <div class="content">
                    </div>
                </div>
                <div id="file-menu" class="collapsible-container">
                    <button class="collapsible">
                    <div class="img-cont">
                    <img src="${FileManagerIcon}">
                    <span>File Manager</span>
                    </div>
                    </button>
                    <div id="filecontainer" class="content">
                        <div class="collapsible-content-label">
                            <span>File Manager</span>
                            <input type='checkbox' id='autosavingfiles' style='float:right;' checked> <span style='float:right;'>Autosave:</span>
                            <hr>
                        </div>
                    </div>
                </div>
                </div>

                <div id="brainstplay-profile-menu" class="collapsible-container" style="display: flex; align-items: flex-end; margin-bottom: 10px; padding: 0px; margin: 0px">
                    <button class="collapsible" style="margin: 0; transition: 0.5s; padding: 10px 18px; border: none; border-radius: 0; border-top: 1px solid rgb(0,0,0);" onMouseOver="this.style.borderTop = '1px solid whitesmoke'; this.style.background = 'rgb(25,25,25)';" onMouseOut="this.style.borderTop='rgb(0,0,0)'; this.style.background = 'transparent'">
                    <div class="img-cont">
                    <img id="brainsatplay-profile-img" style=" border-radius: 50%; background: rgb(255,255,255); filter: invert(0)">
                    <span id="brainsatplay-profile-label" style="margin-left: 10px; ">
                    Log In
                    </span>
                    </div>
                    </button>
                </div>
                `
                // <div id="profile-menu" class="collapsible-container">
                //     <button class="collapsible"><div class="img-cont"><img src="./_dist_/assets/user-solid.svg"><span>Profile</span></div></button>
                //     <div class="content">
                //     <div class="collapsible-content-label">
                //         <span>Profile</span>
                //         <hr>
                //     </div>
                //     </div>
                // </div>
                
                // <div class="collapsible-container">
                //     <button class="collapsible"><div class="img-cont"><img src="./_dist_/assets/code-solid.svg"><span>Dev Tools</span></div></button>
                //     <div class="content">
                //         <div class="collapsible-content-label">
                //         <span>Server</span>
                //         <hr>
                //     </div>
                //         <button id='ping'>Send Ping</button>
                //         <button id='getusers'>Get Users</button>
                //         <button id='createGame'>Make Game session</button>
                //         <button id='subscribeToGame'>Subscribe to game session (connect device first)</button>
                //         <button id='spectateGame'>Spectate game</button>
                //         <button id='subscribeToSelf'>Subscribe to self</button>

                //         <div class="collapsible-content-label">
                //             <span>Other</span>
                //             <hr>
                //         </div>
                //         <button id='enableTutorial'>Enable Tutorial</button>

                //     </div>
                // </div>
                + `
            </div>
            </div>
            <div id="sidebar-toggle"></div>
            <div class="overlay"></div>
        </div>
        </div>
        `; 

        this.uiFragments.Buttons = new DOMFragment(
        connectHTML,
        document.body,
        undefined,
        () => {

            // document.getElementById('ping').onclick = () => {
            //     this.session.sendWSCommand(['ping']); //send array of arguments
            // }
            // document.getElementById('getusers').onclick = () => {
            //     this.session.sendWSCommand(['getUsers']);
            // }
            // document.getElementById('createGame').onclick = () => {
            //     this.session.sendWSCommand(['createGame','test',['eeg'],['eegch_FP1','eegch_FP2','eegch_AF7','eegch_AF8']]);
            //     //session.sendWSCommand(['createGame','game',['muse'],['eegch_AF7','eegch_AF8']]);
            // }
            // document.getElementById('subscribeToGame').onclick = () => {
            //     this.session.subscribeToGame(undefined,false,(res)=>{console.log("subscribed!", res)});
            // }
            // document.getElementById('spectateGame').onclick = () => {
            //     this.session.subscribeToGame(undefined,true,undefined,(res)=>{console.log("subscribed!", res)});
            // }
            // document.getElementById('subscribeToSelf').onclick = () => {
            //     this.session.addStreamParam([['eegch','FP1','all'],['eegch','FP2','all'],['eegch','AF7','all'],['eegch','AF8','all'],['hegdata',0]]);
            //     //session.addStreamParam([['eegch','AF7','all'],['eegch','AF8','all']]);
            //     this.session.subscribeToUser('guest',[['eegch','FP1',],['eegch','FP2'],['eegch','AF7'],['eegch','AF8'],['hegdata',0]],undefined,(res)=>{console.log("subscribed!", res)});
            //     //session.subscribeToUser('guest',['eegch_AF7','eegch_AF8'],(res)=>{console.log("subscribed!", res)});
            // }

            document.getElementById('autosavingfiles').onchange = () => {
                this.state.data.autosaving = document.getElementById('autosavingfiles').checked;
            }
        },
        undefined,
        'NEVER'
        );

        let closeAllOpenCollapsibles = (content=null) => {
            Array.from(document.getElementsByClassName("collapsible")).forEach(toggleButton => {
                let overlay = toggleButton.nextElementSibling
                if (overlay){
                if (overlay.style.opacity === "1" && overlay != content){
                    overlay.style.opacity = "0";
                    overlay.style.right = "0";
                    overlay.style.pointerEvents = 'none'              
                }
            }
            })
        }

        var coll = document.getElementsByClassName("collapsible");
        var i;
        for (i = 0; i < coll.length; i++) {
            let nextSibling = coll[i].nextElementSibling;
            if (nextSibling){
                coll[i].nextElementSibling.style.opacity = '0'
            coll[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.opacity === "0") {
                    content.style.opacity = "1";
                    content.style.right = `-${content.clientWidth}px`;
                    content.style.pointerEvents = 'auto'
                    let currentHeight = content.clientHeight
                    let positionY = content.getBoundingClientRect().top
                    let extraBottomMargin = 50 // px
                    let maxHeight = window.innerHeight - positionY - extraBottomMargin
                    content.style.maxHeight = `${maxHeight}px`;
                    if ( content.clientHeight >= maxHeight) content.style.height = content.style.maxHeight;
                    content.style.overflowY = 'scroll'
                    closeAllOpenCollapsibles(content)
                } else {
                    content.style.opacity = "0";
                    content.style.right = "0";
                    content.style.pointerEvents = 'none'      
                }
            });
            coll[i].nextElementSibling.addEventListener('mouseleave', function() {
                this.classList.toggle("active");
                this.style.opacity = "0";
                this.style.right = "0";
                this.style.pointerEvents = 'none'
            })
        }
        }

        let app = document.querySelector('.app')
        let sidebar = app.querySelector('#sidebar')
        sidebar.addEventListener('mouseleave', function(e) {           
            closeAllOpenCollapsibles()
        })

        this.uiFragments.page = new DOMFragment(
            page_template,
            app
        );
        // this.uiFragments.topbar = new DOMFragment(
        //     topbar_template,
        //     document.getElementById('page')
        // );
        
        let contentChild1 = Array.from(app.querySelector('#applet-menu').childNodes).filter(n => n.className==="content")[0]
        this.uiFragments.select = new DOMFragment(
            appletselect_template,
            contentChild1
        );

        // Layout Selector
        contentChild1.innerHTML += `
        <br>
        <div>
        <div class="collapsible-content-label">
            <span>Layout</span>
            <hr>
        </div>        
        <div style="margin: 10px 10px 0px 10px;">
            <select id="layout-selector" style="width: 100%;">
            <option value='Focus'>Focus</option>
            <option value='Grid'>Grid</option>
            </select>
        </div>
        </div>
        `

        document.getElementById('layout-selector').onchange = () => {
            this.appletManager.enforceLayout()
            this.appletManager.responsive()
        }

        // Applet Browser Button
        document.getElementById('applet-browser-button').onclick = () => {
            if (location.hash != ''){
                window.history.pushState({ additionalInformation: 'Updated URL to Applet Browser' },'',`${window.location.origin}`)
                document.getElementById("preset-selector").value = 'default'
                this.appletManager.deinitApplets()       
                this.appletManager.initAddApplets()       
            }    
        }


        // let contentChild2 = Array.from(app.querySelector('#device-menu').childNodes).filter(n => n.className==="content")[0]
        this.session.makeConnectOptions(document.body, app.querySelector('#device-menu').querySelector('button'));
        
        // let contentChild3 = Array.from(app.querySelector('#profile-menu').childNodes).filter(n => n.className==="content")[0]
        // this.uiFragments.login = new DOMFragment(
        //     login_template,
        //     contentChild3
        // );

        let checkIters = 0;
        const checkIfLoggedIn = () => {
            if (window.gapi?.auth2?.initialized !== true && window.navigator.onLine && checkIters < 3){
                setTimeout(checkIfLoggedIn, 50);//wait 50 millisecnds then recheck
                checkIters++
                return;
            } else {
                    if (window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get()){
                        this.session.loginWithRealm(auth.currentUser.get().getAuthResponse()).then(user => {
                            this.updateProfileUI(user)
                            this.updateOverlay()
                        })
                    } else {
                        this.updateProfileUI()
                        this.updateOverlay()
                    }
            }
        }
        checkIfLoggedIn();

        // app.querySelector('#login-button').onclick = () => {
        //     let form = app.querySelector('#login-form')
        //     let formDict = {}
        //     let formData = new FormData(form);
        //     for (var pair of formData.entries()) {
        //         formDict[pair[0]] = pair[1];
        //     } 
        //     this.session.setLoginInfo(formDict.username, formDict.password)
        //     this.session.login(true)
        // }

        if(this.useFS) {
            this.uiFragments.filemenu = new DOMFragment(
                filemenu_template,
                'filecontainer',
            )
        }
        this.uiFragments.appletbox = new DOMFragment(
            appletbox_template,
            document.getElementById('page'),
            {
                containerId:'applets', 
                styleInlineText:''
            }
        );

        let presetSelector = document.getElementById("preset-selector")
        document.getElementById("brainsatplay-preset-container").style.display = 'none'
		presetSelector.onchange = (e) => {
            window.history.pushState({ 
                // applet1: document.getElementById('applet1').value,
                // preset: document.getElementById('preset-selector').value,
                // layout: document.getElementById('layout-selector').value,
                additionalInformation: 'Updated URL based on Preset' 
            },'',`${window.location.origin}/#${presetSelector.value}`)
            this.appletManager.deinitApplets()       
            this.appletManager.initAddApplets()   
         }

        //  document.getElementById('enableTutorial').onclick = () => {
        //     this.tutorialManager.setTutorialDefault(true)
        //     this.tutorialManager.openTutorial()
        //     this.tutorialManager.updateStandaloneTutorialContent(0,0)
        //  }
    }

    updateOverlay = () => {
        // Remove overlay only if on Chrome
        if (window.isChrome){
            document.body.querySelector('.loader').style.opacity = 0;
            this.tutorialManager.initializeTutorial()
        } else {
            document.body.querySelector('.loader-error').innerHTML = 'Error: Please switch to Google Chrome';
            document.body.querySelector('.loader-error').style.opacity = 1;
        }
    }

    initUI = () => { //Setup all of the UI rendering and logic/loops for menus and other non-applet things

        this.session.onconnected = () => {
            try{
                let contentChild = Array.from(document.querySelector('.app').querySelector('#device-menu').childNodes).filter(n => n.className==="content")[0]
                if(this.uiFragments.controls !== undefined) {this.uiFragments.controls.deleteNode();} //set new controls
                this.uiFragments.controls = this.session.deviceStreams[this.session.info.nDevices-1].device.addControls(contentChild);
            }
            catch (err) { console.error(err); }

            this.appletManager.responsive();    
        }

        this.session.ondisconnected = () => {
            if(this.uiFragments.controls !== undefined) this.uiFragments.controls.deleteNode();
        }

        this.setupUITemplates();
    }

    deinitUI = () => { //Destroy the UI and logic/loops
        this.uiFragments.appletbox.deleteNode();
        this.uiFragments.select.deleteNode();
        this.uiFragments.filemenu.deleteNode();
        this.uiFragments.Buttons.deleteNode();
    }

    updateProfileUI(user){
        let profileButton = document.getElementById('brainstplay-profile-menu').querySelector('button')
        let profileImg = document.getElementById(`brainsatplay-profile-img`)
        if (user != null){
            document.getElementById(`brainsatplay-profile-img`).src = user._profile.data.pictureUrl
            document.getElementById(`brainsatplay-profile-label`).innerHTML = 'Your Profile' // user._profile.data.name
            profileImg.style.padding = "0"
            let selector = document.getElementById(`applet0`)
            let choice = 'Profile Manager'
            profileButton.onclick = () => {
                selector.value = choice
                window.history.pushState({additionalInformation: 'Updated URL to View Profile' },'',`${window.location.origin}/#${choice}`)
                selector.onchange()
            }
            if (selector.value === choice) profileButton.click() // Refresh profile if necessary
        } else {
            document.getElementById(`brainsatplay-profile-img`).src = GoogleIcon
            document.getElementById(`brainsatplay-profile-label`).innerHTML = 'Log In' // user._profile.data.name
            profileImg.style.padding = "10px"
            profileButton.onclick = async (e) => {
                this.session.loginWithGoogle().then(authResponse => {
                    this.session.loginWithRealm(authResponse).then(user => {
                        this.updateProfileUI(user)
                    }).catch((e) => {
                        console.log(e)
                    })
                }).catch((e) => {
                    console.log(e)
                })
            }
        }
    }

    getConfigsFromHashes() {
        let hashes = window.location.hash;
        if(hashes === "") { return []; }
        let hasharr = hashes.split('#');
        hasharr.shift();
        let appletConfigs = [];
        hasharr.forEach((hash,i) => {
            let rep = decodeURIComponent(hash);
            rep = rep.replaceAll("'",'"'); //replace single quotes with double quotes
            let cfg;
            if(rep.indexOf('{') > -1) //parse if its an object
                cfg = JSON.parse(rep); // expects cfg object on end of url like #{name:"",idx:n,settings:["a","b","c"]}#{...}#...
            else cfg = rep; //otherwise its just a string
            appletConfigs.push(cfg);
        });
        return appletConfigs;    
    }

    init = (settingsFileContents='') => {

        // ------ need to flesh this out -------
        if(settingsFileContents.length > 0){
            let settings = JSON.parse(settingsFileContents);
            if(settings.appletConfigs) {
                this.appletConfigs = settings.appletConfigs;
            }
            if(settings.autosaving || settings.autosaving === false) {
                this.state.data.autosaving = settings.autosaving;
                document.getElementById('autosavingfiles').checked = this.state.data.autosaving;
            }
            //console.log(this.appletConfigs)
        }
        //console.log(this.appletConfigs)
        let configs = this.getConfigsFromHashes(); //overrides old settings
        if(configs.length > 0){
            this.appletConfigs = configs;
        } else if(this.appletConfigs.length > 0) {
            this.appletConfigs.forEach((c) => {
                if(typeof c === 'object') window.location.href += "#"+JSON.stringify(c);
                else window.location.href += "#"+c;
            })
        }
        // -------------------------------------
        
        this.appletManager = new AppletManager(
            this.initUI,
            this.deinitUI,
            this.appletConfigs,
            this.appletSelectIds,
            this.session
        )
    }

    setApps( //set the apps and create a new UI or recreate the original
        appletConfigs=this.appletConfigs   //expects an object array like           [{name:"uPlot Applet",idx:0-3,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
    ) {
        this.appletConfigs = appletConfigs;

        if(this.appletManager === null) {
            this.init();
        }
        else {
            this.appletManager.deinitApplets();
            this.appletManager.deinitUI();
            this.init();
        }
    }

    //Inits the AppletManager within the context of the filesystem so the data can be autosaved on demand (there should be a better method than mine)
    initFS = () => {
        let oldmfs = fs.getRootFS();
        BrowserFS.FileSystem.IndexedDB.Create({}, (e, rootForMfs) => {
            if(!rootForMfs) {
                let configs = this.getConfigsFromHashes();
                this.appletManager = new AppletManager(this.initUI, this.deinitUI, configs,undefined,this.session);
                throw new Error(`?`);
            }
            this.fs = rootForMfs;
            BrowserFS.initialize(rootForMfs);
            fs.exists('/data', (exists) => {
                if(exists) { }
                else {
                    fs.mkdir('/data');
                }
                let contents = "";
                fs.appendFile('/data/settings.json','',(e) => {
                    if(e) throw e;
                    fs.readFile('/data/settings.json', (err, data) => {
                        if(err) {
                            fs.mkdir('/data');
                            fs.writeFile('/data/settings.json',
                            JSON.stringify(
                                {
                                    appletConfigs:this.appletConfigs
                                }
                            ), (err) => {
                                this.init();
                                if(err) throw err;
                            });
                        }
                        if(!data) {
                            let newcontent = 
                                JSON.stringify({
                                    appletConfigs:[]
                                });
                            contents = newcontent;
                            fs.writeFile('/data/settings.json', newcontent, (err) => {
                                if(err) throw err;
                                console.log("New settings file created");
                                this.init(contents);
                                listFiles();
                                document.getElementById("saveBCISession").onclick = () => {
                                    saveSettings();
                                }
                                   
                            });
                        }
                        else{ 
                            contents = data.toString();    
                            this.init(contents);
                            listFiles();
                            document.getElementById("saveBCISession").onclick = () => {
                                saveSettings();
                            }
                               
                        }

                        //configure autosaving when the device is connected
                        this.session.state.data.info = this.session.info;
 
                        //console.log(this.session.state.data.info);
                        let sub = this.session.state.subscribe('info',(info) => {
                            if(info.nDevices > 0) {
                                let mainDevice = this.session.deviceStreams[info.nDevices-1].info.deviceType;
                                if(mainDevice === 'eeg') {
                                    this.session.subscribe(this.session.deviceStreams[info.nDevices-1].info.deviceName, this.session.deviceStreams[info.nDevices-1].info.eegChannelTags[0].ch,undefined, (row) => {                                    
                                        //console.log(row.count, this.state.data.eegSaveCounter);
                                        if(this.state.data.autosaving) {
                                            if(this.state.data.saveCounter > row.count) { this.state.data.eegSaveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                                            if(row.count - this.state.data.eegSaveCounter >= this.state.data.saveChunkSize) { 
                                                saveSettings();
                                                autoSaveEEGChunk(this.state.data.eegSaveCounter,undefined,this.session.deviceStreams[info.nDevices-1].info.deviceType+"_"+this.session.deviceStreams[info.nDevices-1].info.deviceName);
                                                this.state.data.eegSaveCounter = row.count;
                                            }
                                        }
                                    });

                                    document.getElementById("saveBCISession").onclick = () => {
                                        saveSettings();
                                        if(this.state.data.eegSaveCounter > row.count) { this.state.data.eegSaveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                                        autoSaveEEGChunk(this.state.data.saveCounter,undefined,this.session.deviceStreams[info.nDevices-1].info.deviceType+"_"+this.session.deviceStreams[info.nDevices-1].info.deviceName);
                                        this.state.data.eegSaveCounter = row.count;
                                        
                                    }
                                    
                                    document.getElementById("newBCISession").onclick = () => {
                                        newSession();
                                    }

                                } else if (mainDevice === 'heg'){
                                    this.session.subscribe(this.session.deviceStreams[info.nDevices-1].info.deviceName, info.nDevices-1,undefined, (row) => {
                                        if(this.state.data.autosaving) {
                                            //if(this.state.data.saveCounter > row.count) { this.state.data.saveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                                            if(row.count - this.state.data.hegSaveCounter >= this.state.data.saveChunkSize) {
                                                saveSettings();
                                                autoSaveHEGChunk(this.state.data.hegSaveCounter,undefined,this.session.deviceStreams[info.nDevices-1].info.deviceType+"_"+this.session.deviceStreams[info.nDevices-1].info.deviceName);
                                                this.state.data.hegSaveCounter = row.count;
                                            }
                                        }
                                    });
                                    document.getElementById("saveBCISession").onclick = () => {
                                        saveSettings();
                                        autoSaveHEGChunk(this.state.data.hegSaveCounter,undefined,this.session.deviceStreams[info.nDevices-1].info.deviceType+"_"+this.session.deviceStreams[info.nDevices-1].info.deviceName);
                                        this.state.data.hegSaveCounter = this.session.atlas.data.heg[0].count;
                                        
                                    }
                                    
                                    document.getElementById("newBCISession").onclick = () => {
                                        newSession();
                                    }
                                }
                            }
                        });
                    });
                });
            });
    
            const newSession = () => {
                let deviceType = this.session.deviceStreams[info.nDevices-1].info.deviceType
                let sessionName = new Date().toISOString(); //Use the time stamp as the session name
                if(deviceType === 'eeg') { 
                    sessionName += "_eeg"
                } else if (deviceType === 'heg') {
                    sessionName += "_heg"
                }
                this.state.data.sessionName = sessionName;
                this.state.data.sessionChunks = 0;
                this.state.data.saveChunkSize = 2000;
                this.state.data.newSessionCt++;
                fs.appendFile('/data/'+sessionName,"", (e) => {
                    if(e) throw e;
                    listFiles();
                });
            }

            const deleteFile = (path) => {
                fs.unlink(path, (e) => {
                    if(e) console.error(e);
                    listFiles();
                });
            }
    
            const listFiles = () => {
                fs.readdir('/data', (e,dirr) => { 
                    if(e) return;
                    if(dirr) {
                        console.log("files",dirr)
                        let filediv = document.getElementById("filesystem");
                        filediv.innerHTML = "";
                        dirr.forEach((str,i) => {
                            if(str !== "settings.json"){
                                filediv.innerHTML += file_template({id:str});
                            }
                        });
                        dirr.forEach((str,i) => {
                            if(str !== "settings.json") {
                                document.getElementById(str+"svg").onclick = () => {
                                    console.log(str);
                                    writeToCSV(str);
                                } 
                                document.getElementById(str+"delete").onclick = () => { 
                                    deleteFile("/data/"+str);
                                } 
                            }
                        });
                    }
                });
            }

            
            const saveSettings = () => {
                let configs = [];
                this.appletManager.applets.forEach((applet) => {
                    if(applet.name)
                        configs.push(applet.name)
                });
                this.appletConfigs = configs;
                let newsettings = JSON.stringify({   
                    time:toISOLocal(new Date()),
                    appletConfigs:this.appletConfigs,
                    autosaving:this.state.data.autosaving
                });
                fs.writeFile('/data/settings.json',
                    newsettings, 
                    (err) => {
                        if(err) throw err;
                        console.log("saved settings to /data/settings.json", newsettings);
                });
            }

            function toISOLocal(d) {
                var z  = n =>  ('0' + n).slice(-2);
                var zz = n => ('00' + n).slice(-3);
                var off = d.getTimezoneOffset();
                var sign = off < 0? '+' : '-';
                off = Math.abs(off);
              
                return d.getFullYear() + '-' //https://stackoverflow.com/questions/49330139/date-toisostring-but-local-time-instead-of-utc
                       + z(d.getMonth()+1) + '-' +
                       z(d.getDate()) + 'T' +
                       z(d.getHours()) + ':'  + 
                       z(d.getMinutes()) + ':' +
                       z(d.getSeconds()) + '.' +
                       zz(d.getMilliseconds()) + 
                       "(UTC" + sign + z(off/60|0) + ':00)'
            }

            const autoSaveEEGChunk = (startidx=0,to='end',deviceName='eeg') => {
                if(this.state.data.sessionName === '') { this.state.data.sessionName = toISOLocal(new Date()) + "_"+ deviceName;}
                let from = startidx; 
                if(this.state.data.sessionChunks > 0) { from = this.state.data.eegSaveCounter; }
                let data = this.session.deviceStreams[0].device.atlas.readyEEGDataForWriting(from,to);
                console.log("Saving chunk to /data/"+this.state.data.sessionName,this.state.data.sessionChunks);
                if(this.state.data.sessionChunks === 0) {
                    fs.appendFile('/data/'+this.state.data.sessionName, data[0]+data[1], (e) => {
                        if(e) throw e;
                        this.state.data.sessionChunks++;
                        listFiles();
                    }); //+"_c"+State.data.sessionChunks
                    
                }
                else {
                    fs.appendFile('/data/'+this.state.data.sessionName, "\n"+data[1], (e) => {
                        if(e) throw e;
                        this.state.data.sessionChunks++;
                    }); //+"_c"+State.data.sessionChunks
                }
                
            }

            const autoSaveHEGChunk = (startidx=0,to='end', deviceName="heg") => {
                if(this.state.data.sessionName === '') { this.state.data.sessionName = toISOLocal(new Date()) + "_"+deviceName;}
                let from = startidx; 
                if(this.state.data.sessionChunks > 0) { from = this.state.data.hegSaveCounter; }
                let data = this.session.deviceStreams[0].device.atlas.readyHEGDataForWriting(from,to);
                console.log("Saving chunk to /data/"+this.state.data.sessionName,this.state.data.sessionChunks);
                if(this.state.data.sessionChunks === 0) {
                    fs.appendFile('/data/'+this.state.data.sessionName, data[0]+data[1], (e) => {
                        if(e) throw e;
                        this.state.data.sessionChunks++;
                        listFiles();
                    }); //+"_c"+State.data.sessionChunks
                }
                else {
                    fs.appendFile('/data/'+this.state.data.sessionName, "\n"+data[1], (e) => {
                        if(e) throw e;
                        this.state.data.sessionChunks++;
                    }); //+"_c"+State.data.sessionChunks
                }
            }
                
            //Read a chunk of data from a saved dataset
            const readFromDB = (path,begin=0,end=5120) => {
                fs.open('/data/'+path,'r',(e,fd) => {
                    if(e) throw e;
                
                    fs.read(fd,end,begin,'utf-8',(er,output,bytesRead) => { 
                        if (er) throw er;
                        if(bytesRead !== 0) {
                            let data = output.toString();
                            //Now parse the data back into the buffers.
                            fs.close(fd);
                            return data;
                        };
                    }); 
                });
            }

            //Write CSV data in chunks to not overwhelm memory
            const writeToCSV = (path) => {
                fs.stat('/data/'+path,(e,stats) => {
                    if(e) throw e;
                    let filesize = stats.size;
                    console.log(filesize)
                    fs.open('/data/'+path,'r',(e,fd) => {
                        if(e) throw e;
                        let i = 0;
                        let maxFileSize = this.state.data.fileSizeLimitMb*1024*1024;
                        let end = maxFileSize;
                        if(filesize < maxFileSize) {
                            end = filesize;
                            fs.read(fd,end,0,'utf-8',(e,output,bytesRead) => { 
                                if (e) throw e;
                                if(bytesRead !== 0) CSV.saveCSV(output.toString(),path);
                                fs.close(fd);
                            }); 
                        }
                        else {
                            const writeChunkToFile = () => {
                                if(i < filesize) {
                                    if(i+end > filesize) {end=filesize - i;}  
                                    let chunk = 0;
                                    fs.read(fd,end,i,'utf-8',(e,output,bytesRead) => {   
                                        if (e) throw e;
                                        if(bytesRead !== 0) {
                                            CSV.saveCSV(output.toString(),path+"_"+chunk);
                                            i+=maxFileSize;
                                            chunk++;
                                            writeChunkToFile();
                                            fs.close(fd);
                                        }
                                    });
                                }
                            }  
                        }
                        //let file = fs.createWriteStream('./'+State.data.sessionName+'.csv');
                        //file.write(data.toString());
                    }); 
                });
                
            }


        });
    }




    downloadImages(w,h){

        let canvases = document.querySelectorAll('canvas')

        for (let canvas of canvases){
            let width = w ?? canvas.width
            let height = h ?? canvas.height
            let transformedC = document.createElement('canvas');
            // Transform Image to Specified Container Size (if necesssary)
            transformedC.width = width
            transformedC.height = height
            let oldAspect = canvas.width/canvas.height
            let newWidth = Math.min(width,canvas.width)
            let newHeight = Math.min(height,canvas.height)
            if (newWidth/newHeight > oldAspect){
                newWidth = newHeight * oldAspect
            } else {
                newHeight = newWidth / oldAspect
            }
            let xTransform = (width - newWidth) / 2
            let yTransform = (height - newHeight) / 2

            // Draw Background
            let transctx = transformedC.getContext("2d")
            transctx.fillStyle = 'black';
            transctx.fillRect(0, 0, width, height);

            // Draw Image
            transctx.drawImage(
                canvas, 
                0,0,canvas.width, canvas.height, 
                xTransform,yTransform,newWidth, newHeight
                )
            let image = transformedC.toDataURL("image/png").replace("image/png", "image/octet-stream")
            var a = document.createElement('a');
            a.href = image;
            a.download = 'screenshot.png';
            document.body.appendChild(a);
            a.click();
        }
    }

}
