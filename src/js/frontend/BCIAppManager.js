//summon the web bci app browser/launcher/manager from here


//Setup State
//Setup Templates & UI Logic i.e. applet and file selection menus, and general BCI control menus
//Setup UI Manager
//  -- Setup App Browser and cross-app accessible data via the state manager
//  -- Setup BCI controls e.g. to control analysis on-the-fly.
//Setup BrowserFS logic for indexedDB


import {State} from './State'
import {UIManager} from './utils/UIManager'

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
        appletClasses=[],  //expects an object array formatted like [{name:"uPlot Applet", cls: uPlotApplet},{}] to set available applets in the browser
        appletConfigs=[]   //expects an object array like           [{name:"",idx:n,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
    ) {

        this.bcisession = null; //Device sessions
        this.appletClasses = appletClasses;
        this.appletConfigs = appletConfigs;
        this.appletConfigs.push(...this.getConfigsFromHashes());
        this.uiManager;
        this.fs;

    }

    setupUITemplates = () => {
        
    }

    initUI = () => { //Setup all of the UI rendering and logic/loops

    }

    deinitUI = () => { //Destroy the UI and logic/loops

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

    initUIManager = () => {
        this.uiManager = new UIManager(
            this.initUI,
            this.deinitUI,
            this.appletClasses,
            this.appletConfigs,
            ['app1','app2','app3','app4'],
            'BCIAppManager'
        )
    }

    setApps(
        appletClasses=this.appletClasses,  //expects an object array formatted like [{name:"uPlot Applet", cls: uPlotApplet},{}] to set available applets in the browser
        appletConfigs=this.appletConfigs   //expects an object array like           [{name:"",idx:n,settings:["a","b","c"]},{...}] to set initial applet configs (including objects found from hashtags in the address bar)
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

    initFS = () => {
        this.fs;
    }

}
