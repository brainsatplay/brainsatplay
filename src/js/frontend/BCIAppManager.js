//summon the web bci app browser/launcher/manager from here


//Setup State
//Setup Templates & UI Logic i.e. applet and file selection menus, and general BCI control menus
//Setup UI Manager
//  -- Setup App Browser and cross-app accessible data via the state manager
//  -- Setup BCI controls e.g. to control analysis on-the-fly.
//Setup BrowserFS logic for indexedDB

import {
    appletbox_template,  
    appletselect_template,
    filemenu_template,
    file_template
} from './menus/UITemplates'

import {UIManager} from './utils/UIManager'
import {CSV} from '../general/csv'
import { StateManager } from './utils/StateManager';
import { DOMFragment } from './utils/DOMFragment';

import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs')
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;



/*
//Name applets and their template classes with specifications for the UI manager
//Append these with the applets you write that you want to load into the frontend on the dev build
export defaultBCIApplets = [ 
            { name:"uPlot Applet",         cls: uPlotApplet        },
            { name:"SmoothieJS Applet",    cls: SmoothieApplet     },
            { name:"BrainMap Applet",      cls: BrainMapApplet     },
            { name:"Spectrogram Applet",   cls: SpectrogramApplet  },
            { name:"BarChart Applet",      cls: BarChartApplet     },
            { name:"MirrorBars Applet",    cls: MirrorBarsApplet   },
            { name:"TimeCharts Applet",    cls: TimeChartsApplet   }
        ]; 
*/

export class BCIAppManager {
    constructor(
        bcisession=null,
        appletClasses=[],  //expects an object array formatted like [{name:"uPlot Applet", cls: uPlotApplet},{}] to set available applets in the browser
        appletConfigs=[],   //expects an object array like           [{name:"",idx:n,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
        useFS=false
    ) {

        this.state = new StateManager({
            sessionName:'',
            saveChunkSize:0,
            saveChunkSize:5120,
            newSessionCt:0,
            fileSizeLimitMb: 250
        });

        this.uiFragments = {}; //store DOMFragments for the UI here

        this.bcisession = bcisession; //brainsatplay class instance
        this.appletClasses = appletClasses;
        this.appletConfigs = appletConfigs;
        this.appletConfigs.push(...this.getConfigsFromHashes());
        this.uiManager;
        this.fs;
        this.useFS = useFS;

        if(this.useFS === true) {
            this.initFS();
        }

    }

    setupUITemplates = () => {
        this.uiFragments.appletbox = new DOMFragment(
            appletbox_template,
            document.body
        );
        this.uiFragments.select = new DOMFragment(
            appletselect_template,
            document.body
        );
        this.uiFragments.filemenu = new DOMFragment(
            filemenu_template,
            document.body
        )
    }

    initUI = () => { //Setup all of the UI rendering and logic/loops for menus and other non-applet things
        this.setupUITemplates();
    }

    deinitUI = () => { //Destroy the UI and logic/loops
        this.uiFragments.appletbox.deleteNode();
        this.uiFragments.select.deleteNode();
    }

    getConfigsFromHashes() {
        let hashes = window.location.hash;
        if(hashes === "") { return [] }
        let hasharr = hashes.split('#');
        hashes.shift();
    
        var appletConfigs = [];
        hasharr.forEach((hash,i) => {
            var cfg = JSON.parse(hash); // expects cfg object on end of url like #{name:"",idx:n,settings:["a","b","c"]}#{...}#...
            appletConfigs.push(cfg);
        });
        return appletConfigs;    
    }

    initUIManager = (settingsFileContents='') => {

        // ------ need to flesh this out -------
        let settings = JSON.parse(settingsFileContents);
        if(settings.appletConfigs) {
            this.appletConfigs = settings.appletConfigs;
        }
        let configs = this.getConfigsFromHashes(); //overrides old settings
        if(configs.length === null){
            this.appletConfigs = configs;
        }
        // -------------------------------------
        
        this.uiManager = new UIManager(
            this.initUI,
            this.deinitUI,
            this.appletClasses,
            this.appletConfigs,
            ['applet1','applet2','applet3','applet4'], //defined in the appletselect template
            'BCIAppManager'
        )
    }

    setApps( //set the apps and create a new UI or recreate the original
        appletClasses=this.appletClasses,  //expects an object array formatted like [{name:"uPlot Applet", cls: uPlotApplet},{}] to set available applets in the browser
        appletConfigs=this.appletConfigs   //expects an object array like           [{name:"uPlot Applet",idx:0-3,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
    ) {
        this.appletClasses = appletClasses;
        this.appletConfigs = appletConfigs;

        if(this.uiManager !== null) {
            this.initUIManager();
        }
        else {
            this.uiManager.deinitApplets();
            this.initUIManager();
        }
    }

    //Inits the UImanager within the context of the filesystem so the data can be autosaved on demand (there should be a better method than mine)
    initFS = () => {
        let oldmfs = fs.getRootFS();
        BrowserFS.FileSystem.IndexedDB.Create({}, (e, rootForMfs) => {
            if(!rootForMfs) {
                let configs = this.getConfigsFromHashes();
                this.uiManager = new UIManager(this.initUI, this.deinitUI, this.appletClasses, configs);
                throw new Error(`?`);
            }
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
                                let configs = getConfigsFromHashes();
                                this.uiManager = new UIManager(this.initUI, this.deinitUI, this.appletClasses, configs);
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
                                this.initUIManager(contents);
                                listFiles();
                            });
                        }
                        else{ 
                            contents = data.toString();    
                            initUIManager(contents);
                            listFiles();
                        }

                        //configure autosaving when the device is connected
                        this.bcisession.state.data.info = this.bcisession.info;
                        this.bcisession.state.subscribe('info',(info) => {
                            if(info.nDevices > 0) {
                                if(this.bcisession.devices[info.nDevices-1].info.deviceType === 'eeg') {
                                    this.bcisession.subscribe(this.bcisession.devices[info.nDevices-1].info.deviceName, this.bcisession.devices[info.nDevices-1].info.eegChannelTags[0].ch,'count', (c) => {
                                        if(c - this.state.data.saveCounter >= this.state.data.saveChunkSize) {
                                            autoSaveEEGChunk();
                                            this.state.data.saveCounter = c;
                                        }
                                    });
                                    document.getElementById("saveEEGSession").onclick = () => {
                                        autoSaveEEGChunk();
                                    }
                                    document.getElementById("newEEGSession").onclick = () => {
                                        newSession();
                                    }
                                }
                            }
                        });
                    });
                });
            });
    
            const newSession = () => {
                let sessionName = new Date().toISOString(); //Use the time stamp as the session name
                this.state.data.sessionName = sessionName;
                this.state.data.sessionChunks = 0;
                this.state.data.saveChunkSize = 5120;
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

            const autoSaveEEGChunk = (startidx=0,to='end') => {
                let from = startidx; 
                if(this.state.data.sessionChunks > 0) { from = this.state.data.saveCounter; }
    
                let data = this.bcisession.devices[0].atlas.readyEEGDataForWriting(from,to);
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

            const saveSettings = () => {
                fs.writeFile('/data/settings.json',
                JSON.stringify({   
                        appletConfigs:this.appletConfigs
                    }
                ), (err) => {
                    if(err) throw err;
                });
            }

        });
    }

}
