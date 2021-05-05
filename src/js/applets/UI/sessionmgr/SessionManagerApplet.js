import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import { StateManager } from '../../../../library/src/ui/StateManager'
import {CSV} from '../../../general/csv'
import {DataLoader} from '../../../frontend/utils/DataLoader'
import * as settingsFile from './settings'
import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs');
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;

import brainsvg from '../../../../assets/brain-solid.svg'
import csvsvg from '../../../../assets/file-csv-solid.svg'
import deletesvg from '../../../../assets/trash-alt-regular.svg'

import {uPlotMaker} from '../../../frontend/UX/eegvisuals'

/*
How it will work:
Local files can be analyzed, as in given scores and basic review parameters. 
These analyses will be automatically backed up on drive as a session record system
Large CSVs should be backed up in a separate window.
*/

//Session reviewer! Yay!
export class SessionManagerApplet {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.dataloader = new DataLoader(this.bci.atlas);
        
        this.state = new StateManager({dirr:[], filelist:[]},1000);

        this.looping = false;
        this.sub = null;
        this.sub2 = null;
    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        fs.exists('./data',(exists) => {
            console.log("fs installed: ",exists);
        });

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return ` 
            <div id='${props.id}'>
                <div id='${props.id}sessionwindow' width='100%' height='25%'></div>
                <p>Google API Test</p>
                <div id='${props.id}content'></div>
                <hr>
                <p>Local Files</p>
                <hr align='left' style='width:25%;'>
                <div id='${props.id}fs'></div>
                <hr>
                <span>Load CSV into FS:<button id='${props.id}loadcsv'>Load</button></span>
            </div> 
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            document.getElementById(props.id+'loadcsv').onclick = () => {
                this.loadCSVintoDB();
            }
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.
        
        this.AppletHTML.appendStylesheet("./_dist_/styles/css/uPlot.min.css");

        this.looping = true;
        //Add whatever else you need to initialize
        let awaitsignin = () => {   
            if(this.looping){
                if(window.gapi.auth2.getAuthInstance().isSignedIn.get()){
                    console.log("Signed in, getting files...");
                    this.checkFolder();
                    this.listDriveFiles();
                }
                else setTimeout(()=>{awaitsignin();},1000);
            }
        }

        awaitsignin();

        this.listDBFiles();

        this.checkForUpdatedFiles();

        this.sub = this.state.subscribe('dirr',(dirr)=>{
            this.listDBFiles();
        });

        this.sub2 = this.state.subscribe('filelist',(filelist)=>{
            document.getElementById(this.props.id+'content').innerHTML = ``;
            for (var i = 0; i < filelist.length; i++) {
                var file = filelist[i];
                this.appendContent(`<div id=${file.id} style='border: 1px solid white'>${file.name}</div>`);
            }
        });
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.looping = false;
        this.dataloader.deinit();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    checkForUpdatedFiles = () => {
        if(this.looping) {
            fs.readdir('/data', (e,dirr) => { 
                if(e) return;
                if(dirr) { 
                    this.state.data.dirr = dirr;
                }
            });
            /*
            window.gapi.client.drive.files.list({
                q:"name contains 'Brainsatplay_Data/'",
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name)"
            }).then((response) => {
                this.appendPre('Files:');
                var files = response.result.files;
                if (files && files.length > 0) { 
                    this.state.data.filelist = files;
                }
            });
            */
            setTimeout(()=>{this.checkForUpdatedFiles()},1000);
        }
    }

    file_template(props={id:Math.random()}) {
        return `
        <div id="`+props.id+`">
            <div style="display:flex; align-items: center; justify-content: space-between;">
                <p id="`+props.id+`filename" style='color:white; font-size:80%;'>`+props.id.slice(4)+`</p>
                <div style="display: flex;">
                    <img id="`+props.id+`analyze" src="`+brainsvg+`" style="height:40px; width:40px; filter: invert(100%); padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`svg" src="`+csvsvg+`" style="height:40px; width:40px; filter: invert(100%);padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`delete" src="`+deletesvg+`" style="height:40px; width:40px; filter: invert(100%); padding: 10px; margin: 5px; cursor:pointer;">  
                </div>
            </div>
        </div>
        `;
    }

    appendContent(message) {
        var pre = document.getElementById(this.props.id+'content');
        var textContent = document.insertAdjacentHTML('beforeend',message);
        pre.appendChild(textContent);
      }

    checkFolder() {
        window.gapi.client.drive.files.list({
            q:"name='Brainsatplay_Data' and mimeType='application/vnd.google-apps.folder'",
        }).then((response) => {
            if(response.result.files.length === 0) {
                this.createFolder();
            }
        });
    }

    createFolder(name='Brainsatplay_Data') {
        let data = new Object();
        data.name = name;
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.create({'resource': data}).then((response)=>{
            console.log(response);
        });
    }

    //doSomething(){}
    listDriveFiles() {
        window.gapi.client.drive.files.list({
            q:"name contains 'Brainsatplay_Data/'",
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        }).then((response) => {
            document.getElementById(this.props.id+'content').innerHTML = ``;
            this.appendContent('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                this.appendContent(`<div id=${file.id} style='border: 1px solid white;'>${file.name}</div>`);
              }
            } else {
                this.appendContent('<p>No files found.</p>');
            }
          });
    }

    deleteFile = (path) => {
        fs.unlink(path, (e) => {
            if(e) console.error(e);
            this.listDBFiles();
        });
    }

    listDBFiles = () => {
        fs.readdir('/data', (e,dirr) => { 
            if(e) return;
            if(dirr) {
                this.state.data.dirr = dirr;
                console.log("files",dirr)
                let filediv = document.getElementById(this.props.id+"fs");
                filediv.innerHTML = "";
                dirr.forEach((str,i) => {
                    if(str !== "settings.json"){
                        filediv.innerHTML += this.file_template({id:"mgr_"+str});
                        document.getElementById("mgr_"+str+"svg").onclick = () => {
                            console.log(str);
                            this.writeToCSV(str);
                        } 
                        console.log('set onclick for ', "mgr_"+str)
                        document.getElementById("mgr_"+str+"delete").onclick = () => { 
                            this.deleteFile("/data/"+str);
                        } 
                        document.getElementById("mgr_"+str+"analyze").onclick = () => { 
                            this.scrollFileData(str);
                        } 
                    }
                });
            }
        });
    }

    getFileSize = (filename,onread=(size)=>{console.log(size);}) => {
        fs.stat('/data/'+filename,(e,stats) => {
            if(e) throw e;
            let filesize = stats.size;
            onread(filesize);
        });
    }

    //Read a chunk of data from a saved dataset
    readFromDB = (filename='',begin=0,end=5120,onOpen=(data, filename)=>{console.log(data,filename);}) => {
        fs.open('/data/'+filename,'r',(e,fd) => {
            if(e) throw e;
            fs.read(fd,end,begin,'utf-8',(er,output,bytesRead) => { 
                if (er) throw er;
                if(bytesRead !== 0) {
                    let data = output.toString();
                    //Now parse the data back into the buffers.
                    onOpen(data, filename);
                }
            }); 
        });
    }

    //Write CSV data in chunks to not overwhelm memory
    writeToCSV = (filename) => {
        fs.stat('/data/'+filename,(e,stats) => {
            if(e) throw e;
            let filesize = stats.size;
            console.log(filesize)
            fs.open('/data/'+filename,'r',(e,fd) => {
                if(e) throw e;
                let i = 0;
                let maxFileSize = 100*1024*1024;
                let end = maxFileSize;
                if(filesize < maxFileSize) {
                    end = filesize;
                    fs.read(fd,end,0,'utf-8',(e,output,bytesRead) => { 
                        if (e) throw e;
                        if(bytesRead !== 0) CSV.saveCSV(output.toString(),filename);
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
                                    CSV.saveCSV(output.toString(),filename+"_"+chunk);
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

    analyzeCurrentSession = (type='eeg') => {
        if(type === 'eeg') {

        } else if (type === 'heg') {

        }
    }

    analyzeDBSession = (filename='',type='eeg') => {
        if(type === 'eeg') {
            document.getElementById(this.props.id+'sessionwindow');
        } else if (type === 'heg') {
            
        }
    }

    analyzeLoadedSession = (type='eeg') => {
        if(type === 'eeg') {

        } else if (type === 'heg') {
            
        }
    }

    loadCSVintoDB = () => {
        CSV.openCSVRaw((data,path)=>{
            let split = path.split(`\\`);
            let filename = split[split.length-1].slice(0,split[split.length-1].length-4);
            console.log(filename);
            fs.appendFile('/data/'+filename,data,(e)=>{
                if(e) throw e;
                this.listDBFiles();
            });
        });
    }

    
    getCSVHeader = (filename='',onOpen = (header, filename) => {console.log(header,filename);}) => {
        fs.open('/data/'+filename,'r',(e,fd) => {
            if(e) throw e;
            fs.read(fd,65535,0,'utf-8',(er,output,bytesRead) => {  //could be a really long header for all we know
                if (er) throw er;
                if(bytesRead !== 0) {
                    let data = output.toString();
                    let lines = data.split('\n');
                    let header = lines[0];
                    //Now parse the data back into the buffers.
                    onOpen(header, filename);
                };
            }); 
        });
    }

    parseDBData = (data,head,filename,hasheader=true,hasend=true) => {
        let lines = data.split('\n');
        if(hasheader === false) lines.shift(); 
        if(hasend === false) lines.pop(); //pop first and last rows if they are likely incomplete
        if(filename.indexOf('heg') >-1 ) {
            this.dataloader.parseHEGData(data,head);
            //this.dataloader.loaded
        } else { //eeg data
            this.dataloader.parseEEGData(data,head);
        }
        return this.dataloader.state.loaded;
    }


    /*
        -> select file
        -> get header
        -> begin scrolling file data
        -> wait for user to change the window
        -> update data on change
    */
    scrollFileData = (filename) => {
        this.getFileSize(filename, (size)=> {
            console.log(size);
            let begin = 0;
            let buffersize = 100000;
            let end = buffersize;
            let nsec = 10;
            /*
                -> get data in window
                -> check relative sample rate with unix time
                -> adjust buffer size to that (update rangeend too)
            */

            let head = undefined;
            
            this.getCSVHeader(filename, (header)=> { 
                head = header;
            });

            let rangeend = size - buffersize; if(rangend < 0) rangeend = 1;

            document.getElementById(this.props.id+'sessionwindow').innerHTML = `
            <div id='${this.props.id}uplot'></div>
            <div id='${this.props.id}sessioninfo'>
                <div id='${this.props.id}sessionname'>${filename}</div>
                <input id='${this.props.id}sessionrange' type='range' min='0' max='${rangeend}' value='0' step='1'>
                <div id='${this.props.id}sessionstats'>Stats</div>
            </div>
            `;

            this.plot = new uPlotMaker(this.props.id+'uplot');

            const getData = () => {
                if(end > size) end = size;
                this.readFromDB(filename,begin,end,(data,file)=>{
                    let loaded = this.parseDBData(data,head,file,begin===0,end===size);
                    if(filename.indexOf('heg') > -1) { 
                        //loaded.data = {times,red,ir,ratio,ambient,error,rmse,notes,noteTimes}
                    }
                    else {
                        //loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
                    }
                });
            }

            document.getElementById(this.props.id+'sessionrange').onchange = () => {
                let val = document.getElementById(this.props.id+'sessionrange').value;
                begin = val;
                end = val+buffersize;
                if(end > size) end = size;
                getData();
            }




        });
    }

  





   
} 