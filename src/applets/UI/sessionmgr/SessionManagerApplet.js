import {Session} from '../../../libraries/js/src/Session'
import {DOMFragment} from '../../../libraries/js/src/ui/DOMFragment'
import { StateManager } from '../../../libraries/js/src/ui/StateManager'
import {CSV} from '../../../platform/js/general/csv'
import {DataLoader} from '../../../platform/js/frontend/utils/DataLoader'
import * as settingsFile from './settings'
import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs');
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;

import brainsvg from '../../../platform/assets/brain-solid.svg'
import csvsvg from '../../../platform/assets/file-csv-solid.svg'
import deletesvg from '../../../platform/assets/trash-alt-regular.svg'
import drivesvg from '../../../platform/assets/Google_Drive_icon_2020.svg'

import {uPlotMaker} from '../../../platform/js/frontend/UX/eegvisuals'

/*
How it will work:
Local files can be analyzed, as in given scores and basic review parameters. 
These analyses will be automatically backed up on drive as a session record system
Large CSVs should be backed up in a separate window.

TODO:
- uPlot options 
- Analysis options
- Uploading and comparing analyses over time. 
   -- if loading session into drive with same name but new analysis, just add the new columns
   -- Backs up this data only to drive, the rest is manual
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
        this.sub = undefined;
        this.sub2 = undefined;
        this.uplot = undefined;
        this.analyze_result = {};
        this.analyze_completed = false;
        this.startTime = undefined;
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
            <div id='${props.id}' style='overflow: scroll;'>
                <div id='${props.id}sessionwindow' width='100%' height='25%'></div>
                <p style="transform:translateX(10px);">Local Files</p>
                <hr align='left' style='width:25%;'>
                <div id='${props.id}fs'></div>
                <hr>
                <hr>
                <div id='${props.id}content'></div>
                <hr>
                <span>Load Brains@Play CSV into Browser:  <button id='${props.id}loadcsv' style='border-radius:5px; background-color:white;color:black;font-weight:bold;font-size:16px;'>Load</button></span>
                <hr>
                <div id='${props.id}drivefiles'></div>
                
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
        
        this.AppletHTML.appendStylesheet("./_dist_/platform/styles/css/uPlot.min.css");

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
            document.getElementById(this.props.id+'drivefiles').innerHTML = ``;
            for (var i = 0; i < filelist.length; i++) {
                var file = filelist[i];
                this.appendContent(`<div id=${file.id} style='border: 1px solid white'>${file.name}</div>`,'drivefiles');
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
        if(this.uplot) {
            let lastseries = this.uplot.plot.series;
            this.uplot.deInit();
            let plotselect = document.getElementById(this.props.id+'plotselect').value;
            let newSeries = this.makeSeries(plotselect,this.dataloader.state.data.loaded.header);
            lastseries.forEach((ser,j)=> {
                newSeries[j].show = ser.show;
            });
            this.uplot.makeuPlot(
                newSeries, 
                this.uplot.uPlotData, 
                this.AppletHTML.node.clientWidth, 
                400
            );
            if(plotselect === 'heg' || plotselect.includes('eegraw')) {
                this.uplot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v- this.startTime)*.00001666667)+"m:"+((v- this.startTime)*.001 - 60*Math.floor((v- this.startTime)*.00001666667)).toFixed(0) + "s");}
            }
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
            setTimeout(()=>{this.checkForUpdatedFiles();},1000);
        }
    }

    file_template(props={id:Math.random()}) {
        return `
        <div id="`+props.id+`">
            <div style="display:flex; align-items: right; justify-content: space-between;">
                <p id="`+props.id+`filename" style='color:white;transform:translate(10px,8px);'>`+props.id.slice(4)+`</p>
                <div style="display: flex;">
                    <img id="`+props.id+`analyze" src="`+brainsvg+`" style="height:40px; width:40px; filter: invert(100%); padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`svg" src="`+csvsvg+`" style="height:40px; width:40px; filter: invert(100%);padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`delete" src="`+deletesvg+`" style="height:40px; width:40px; filter: invert(100%); padding: 10px; margin: 5px; cursor:pointer;">  
                </div>
            </div>
        </div>
        `;
    }

    file_template2(props={id:Math.random()}) {
        return `
        <div id="`+props.id+`">
            <div style="display:flex; align-items: center; justify-content: space-between;">
                <p id="`+props.id+`filename" style='color:white; transform:translateX(10px);'>`+props.id.slice(4)+`</p>
                <div style="display: flex;">
                    <img id="`+props.id+`backup" src="`+drivesvg+`" style="height:40px; width:40px; padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`svg" src="`+csvsvg+`" style="height:40px; width:40px; filter: invert(100%);padding: 10px; margin: 5px; cursor:pointer;">
                    <img id="`+props.id+`delete" src="`+deletesvg+`" style="height:40px; width:40px; filter: invert(100%); padding: 10px; margin: 5px; cursor:pointer;">  
                </div>
            </div>
        </div>
        `;
    }

    appendContent(message,id='content') {
        var pre = document.getElementById(this.props.id+id);
        pre.insertAdjacentHTML('beforeend',message);
      }

    checkFolder(onResponse=(result)=>{}) {
        window.gapi.client.drive.files.list({
            q:"name='Brainsatplay_Data' and mimeType='application/vnd.google-apps.folder'",
        }).then((response) => {
            if(response.result.files.length === 0) {
                this.createFolder();
                if(onResponse) onResponse(response.result);
            }
            else if(onResponse) onResponse(response.result);
        });
    }

    createFolder(name='Brainsatplay_Data') {
        let data = new Object();
        data.name = name;
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.create({'resource': data}).then((response)=>{
            console.log(response.result);
        });
    }

    //doSomething(){}
    listDriveFiles() {
        this.checkFolder((result)=> {
            window.gapi.client.drive.files.list({
                q: `'${result.files[0].id}' in parents`,
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name)"
            }).then((response) => {
                document.getElementById(this.props.id+'drivefiles').innerHTML = ``;
                this.appendContent('Drive Files (Brainsatplay_Data folder):','drivefiles');
                var files = response.result.files;
                if (files && files.length > 0) {
                  for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    this.appendContent(`<div id=${file.id} style='border: 1px solid white;'>${file.name}<button id='${file.id}dload'>Download</button></div>`,'drivefiles');
                    document.getElementById(file.id+'dload').onclick = () => {
                          
                        //Get CSV data from drive
                        var request = gapi.client.drive.files.export({'fileId': file.id, 'mimeType':'text/csv'});
                          request.then((resp) => {
                            let filename = file.name;
                            fs.appendFile('/data/'+filename,resp.body,(e)=>{
                                if(e) throw e;
                                this.listDBFiles();
                            });
                        });
                    }
                }
                } else {
                    this.appendContent('<p>No files found.</p>','drivefiles');
                }
              });
        })
        
    }

    backupToDrive = (filename) => {
        if(window.gapi.auth2.getAuthInstance().isSignedIn.get()){
            fs.readFile('/data/'+filename,(e,output)=>{
                if(e) throw e;
                let file = new Blob([output.toString()],{type:'text/csv'});
                this.checkFolder((result)=>{
                    let metadata = {
                        'name':filename+".csv",
                        'mimeType':'application/vnd.google-apps.spreadsheet',
                        'parents':[result.files[0].id]
                    }
                    let token = gapi.auth.getToken().access_token;
                    var form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
                    form.append('file', file);

                    var xhr = new XMLHttpRequest();
                    xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                    xhr.responseType = 'json';
                    xhr.onload = () => {
                        console.log("Uploaded file id: ",xhr.response.id); // Retrieve uploaded file ID.
                        this.listDriveFiles();
                    };
                    xhr.send(form);
                });   
            });
        } else {
            alert("Sign in with Google first!")
        }
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
                let historyfilediv = document.getElementById(this.props.id+'content');
                filediv.innerHTML = "";
                historyfilediv.innerHTML = "";
                dirr.forEach((str,i) => {
                    if(!str.includes("settings") && !str.includes("History")){
                        filediv.insertAdjacentHTML('beforeend',this.file_template({id:"mgr_"+str}));
                        document.getElementById("mgr_"+str+"svg").onclick = () => {
                            //console.log(str);
                            this.writeToCSV(str);
                        } 
                        //console.log('set onclick for ', "mgr_"+str)
                        document.getElementById("mgr_"+str+"delete").onclick = () => { 
                            this.deleteFile("/data/"+str);
                        } 
                        document.getElementById("mgr_"+str+"analyze").onclick = () => { 
                            this.scrollFileData(str);
                        } 
                    } else if(str.includes('History')) {
                        historyfilediv.insertAdjacentHTML('beforeend',this.file_template2({id:"mgr_"+str}));
                        document.getElementById("mgr_"+str+"svg").onclick = () => {
                            //console.log(str);
                            this.writeToCSV(str);
                        } 
                        //console.log('set onclick for ', "mgr_"+str)
                        document.getElementById("mgr_"+str+"delete").onclick = () => { 
                            this.deleteFile("/data/"+str);
                        }
                        document.getElementById("mgr_"+str+"backup").onclick = () => {
                            //console.log(str);
                            //this.writeToCSV(str);
                            this.backupToDrive(str);
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
            console.log(filename, filesize);
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

    parseDBData = (data,head,filename,hasend=true) => {
        let lines = data.split('\n'); 
        lines.shift(); 
        if(hasend === false) lines.pop(); //pop first and last rows if they are likely incomplete
        if(filename.indexOf('heg') >-1 ) {
            this.dataloader.parseHEGData(lines,head);
            //this.dataloader.loaded
        } else { //eeg data
            this.dataloader.parseEEGData(lines,head);
        }
        return this.dataloader.state.data.loaded;
    }


    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    setLegend = () => {
        document.getElementById(this.props.id+"legend").innerHTML = "";
        let htmlToAppend = ``;
        //console.log(this.class.plot.series)
        this.uplot.plot.series.forEach((ser,i) => {
          if(i>0){
            htmlToAppend += `<span id='`+this.props.id+ser.label+`' style='border:1px solid black; padding: 5px 2px; color:`+ser.stroke+`; cursor:pointer;'>`+ser.label+`</span>`;
          }
        });
        document.getElementById(this.props.id+"legend").innerHTML = htmlToAppend;
        this.uplot.plot.series.forEach((ser,i) => {
          if(i>0){
            document.getElementById(this.props.id+ser.label).onclick = () => {
              if(this.uplot.plot.series[i].show === true){
                document.getElementById(this.props.id+ser.label).style.opacity = 0.3;
                this.uplot.plot.setSeries(i,{show:false});
              } else {this.uplot.plot.setSeries(i,{show:true}); document.getElementById(this.props.id+ser.label).style.opacity = 1;}
            }
            if(this.uplot.plot.series[i].show === false){
                document.getElementById(this.props.id+ser.label).style.opacity = 0.3;
              } else {document.getElementById(this.props.id+ser.label).style.opacity = 1;}
        }
        });
      }

    compareSessionHistory = (filename="",seriestag=undefined,sessiontags='') => {
        let file = "";
        let head = "";
        
        let dataToWrite=[];

        let generateTable = (lines) => {
            let tbl = document.getElementById(this.props.id+'sessioncomparisons');
            tbl.innerHTML = '';
            lines.forEach((line,k)=>{
                let l = line.split(",");
                if(k === 0) tbl.innerHTML += "<tr><th>" + l.join('</th><th>') + "</th></tr>"; 
                else tbl.innerHTML += "<tr><td>" + l.join('</td><td>') + "</td></tr>";
            });
        }

        let writeData = () => {
            this.getFileSize(file,(size)=>{
 
                    if(size > head.length+1) {
                        fs.readFile('/data/'+file,(er,output) => {
                            if(er) throw er;
                            let lines = output.toString().split('\n');
                            let lineidx = 0;
                            let line = lines.find((a,j)=>{
                                if(a.includes(filename)){
                                    lineidx = j;
                                    return true;
                                }
                            });
                            if(line) {
                                lines[lineidx] = dataToWrite.join(",");    
                            } else lines.push(dataToWrite.join(","));
                           
                            fs.writeFile('/data/'+file,lines.join('\n'),(errr)=>{
                                if(errr) throw errr;
                                //now show off the data in lines[]
                                generateTable(lines);
                            });
                        
                        
                        });
                    }
                    else{
                        let lines = [head,dataToWrite.join(",")];
                        let str = lines.join('\n'); 
                        fs.writeFile('/data/'+file,str,(errr)=>{
                            if(errr) throw errr;
                            generateTable(lines);
                        });
                        
                        
                    }

            });
        }
        
        if(seriestag) file+= seriestag+"_";
        if(filename.includes('eeg')) {
            file+="EEG_Session_History";
            head = "Session,Duration,Bandpowers,Ratios,Coherence,Noise_Avg_(uVrms),Impedance_Estimate(s),Notes,Tags";

            dataToWrite = [
                filename,
                this.analyze_result.duration,
                this.analyze_result.bandpowers,
                this.analyze_result.eegratios,
                this.analyze_result.eegcoherence,
                this.analyze_result.eegnoise,
                this.analyze_result.eegimpedance,
                this.analyze_result.eegnotes.join(";"),
                sessiontags
            ];

            dataToWrite = dataToWrite.map(d => {if(d === undefined){return "";} else if (typeof d === 'number') {return d.toFixed(4);} else { return d;}});

            fs.exists('/data/'+file,(exists)=>{
                if(!exists) {
                    fs.appendFile('/data/'+file,head+"\n",(e)=>{
                        if(e) throw e;
                        this.listDBFiles();
                        writeData();
                    });
                } else { writeData();}
            });


        } else if (filename.includes('heg')) {
            file+="HEG_Session_History";
            head="Session,Duration,Session_Gain,Mean_Gain,Error,RMSE,Mean_Ratio,Mean_Red,Mean_IR,Mean_Ambient,Mean_HR,Mean_HRV,Mean_BR,Mean_BRV,Notes,Tags";

            dataToWrite = [
                filename,
                this.analyze_result.duration,
                this.analyze_result.heggain,
                this.analyze_result.hegmeangain,
                this.analyze_result.error,
                this.analyze_result.rmse,
                this.analyze_result.meanratio,
                this.analyze_result.meanred,
                this.analyze_result.meanir,
                this.analyze_result.meanambient,
                this.analyze_result.meanbpm,
                this.analyze_result.meanhrv,
                this.analyze_result.meanbrpm,
                this.analyze_result.meanbrv,
                this.analyze_result.hegnotes.join(";"),
                sessiontags
            ];

            dataToWrite = dataToWrite.map(d => {if(d === undefined){return "";} else if (typeof d === 'number') {return d.toFixed(4);} else { return d;}});

            fs.exists('/data/'+file,(exists)=>{
                if(!exists) {
                    fs.appendFile('/data/'+file,head+"\n",(e) => {
                        if(e) throw e;
                        this.listDBFiles();
                        writeData();
                    });
                } else { writeData(); }
            });

        }       
    }

    /*
        -> select file
        -> get header
        -> begin scrolling file data
        -> wait for user to change the window
        -> update data on change
    */
    scrollFileData = (filename) => {
        if(this.uplot) {     
            this.uplot.deInit();
            this.uplot = undefined;
            this.startTime = undefined;
            document.getElementById(this.props.id+'sessionwindow').innerHTML = '';
        }
        let head = undefined;
            
        this.getCSVHeader(filename, (header)=> { 
            head = header.split(',');
        });

        setTimeout(()=>{ //wait a little for the csv header to be passed
        this.getFileSize(filename, (size)=> {
            console.log(size);
            let begin = 0;
            let buffersize = 1100000;
            let end = buffersize;
            let nsec = 10; 
            let spsEstimate = undefined;
            /*
                -> get data in window
                -> check relative sample rate with unix time
                -> adjust buffer size to that (update rangeend too)
            */

            let rangeend = size - buffersize; if(rangeend < 0) rangeend = 1;
            let rval = 0; if(rangeend === 1) rval = 1;

            document.getElementById(this.props.id+'sessionwindow').insertAdjacentHTML('beforeend',`
            <div width="100%">
                <table id=${this.props.id}overlay' width='100%' style='position:absolute; z-index:4;'>
                    <tr valign='top'>
                        <td id='${this.props.id}plotmenu' width='10%'></td>
                        <td width='60%' id='${this.props.id}legend' style='background-color:rgba(255,255,255,1);'></td>
                        <td width='2.5%'><span style='color:black;font-weight:bold; font-size:14px;'>Scroll:</span></td>
                        <td width='25%'> <input style='width:90%;' id='${this.props.id}sessionrange' type='range' min='0' max='${rangeend}' value='${rval}' step='1'></td>
                        <td width='2.5%'><button id='${this.props.id}plotclose' style='pointer:cursor; background-color:crimson;color:white;border-radius:5px; border:1px solid black;'>X</button></td>
                    </tr>
                </table>
                <div id='${this.props.id}uplot' style='background-color:white;'></div>
                <div id='${this.props.id}uplot' style='background-color:white;display:none;'></div>
            </div>
            <div id='${this.props.id}sessioninfo' style='background-color:rgba(50,50,50,1);'>
                <table>
                <tr id='${this.props.id}sessioninforow'>
                    <td><span id='${this.props.id}sessionname' style='font-weight:bold;border-right:1px solid white; padding:0px 10px;'>${filename}</span></td>
                    <td>Session Series: <input id='${this.props.id}sessionseries' type='text' placeholder='Enter Series' style='width:100px;'></td>
                    <td>Session Tag(s):<input id='${this.props.id}tagsession' type='text' placeholder='Enter Tag(s)'  style='width:100px;'></td>
                </tr>
                <tr id='${this.props.id}sessionstatsrow'>
                    <td colSpan="2"><div id='${this.props.id}sessionstats'>Stats</div></td>
                    <td><span>Compare Sessions: <button id='${this.props.id}analyzeSession'>Analyze Session</button></span></td>
                </tr>
                </table>
                <table id='${this.props.id}sessioncomparisons'>
                </table>
            </div>
            `);

            if(window.gapi.client.auth2?.getAuthInstance().isSignedIn.get()) {
                //pull gapi data or expose the option
            }

            document.getElementById(this.props.id+'plotclose').onclick = () => {
                if(this.uplot) {     
                    this.uplot.deInit();
                    this.uplot = undefined;
                }
                document.getElementById(this.props.id+'sessionwindow').innerHTML = "";
            }

            document.getElementById(this.props.id+'analyzeSession').onclick = () => {
                this.analyzeSession(filename);
                let waitResult = () => {
                    if(!this.analyze_completed) setTimeout(()=>{requestAnimationFrame(waitResult);},15);
                    else {
                        console.log('completed analysis!'); 
                        let val = document.getElementById(this.props.id+'sessionseries').value;
                        if(val.length === 0) val = undefined;
                        let val2 = document.getElementById(this.props.id+'sessionseries').value;
                        if(val2.length === 0) val2 = undefined; else val2 = val2.replaceAll(',',';');
                        this.compareSessionHistory(filename,val,val2);

                        if(window.gapi.client.auth2?.getAuthInstance().isSignedIn.get()) {
                            //pull gapi data or expose the option
                        }
                    }
                }
                waitResult();
            }

            this.uplot = new uPlotMaker(this.props.id+'uplot');
            //setup uplot
            if(filename.indexOf('heg') > -1) { 
                //loaded.data = {times,red,ir,ratio,ambient,error,rmse,notes,noteTimes}
                
                let newSeries = this.makeSeries('heg');

                let dummyarr = new Array(100).fill(1);

                this.uplot.uPlotData = [
                    dummyarr,
                    dummyarr,
                    dummyarr,
                    dummyarr,
                    dummyarr,
                    dummyarr
                ];

                newSeries[0].label = "t";
                this.uplot.makeuPlot(
                    newSeries, 
                    this.uplot.uPlotData, 
                    this.AppletHTML.node.clientWidth, 
                    400
                );

                this.setLegend();
                this.uplot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v- this.uplot.uPlotData[0][0])*.00001666667)+"m:"+((v- this.uplot.uPlotData[0][0])*.001 - 60*Math.floor((v-this.uplot.uPlotData[0][0])*.00001666667)).toFixed(1) + "s");
                //loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
                document.getElementById(this.props.id+'plotmenu').innerHTML = `
                    <select id='${this.props.id}plotselect'>
                        <option value='heg' selected>All</option>
                    </select>
                `;

                
            }
            else {
                let newSeries = this.makeSeries('eegraw',head);
                newSeries[0].label = "t";
                let dummyarr = new Array(100).fill(1);
                newSeries.forEach((s)=>{
                    this.uplot.uPlotData.push(dummyarr);
                })

                this.uplot.makeuPlot(
                    newSeries, 
                    this.uplot.uPlotData, 
                    this.AppletHTML.node.clientWidth, 
                    400
                );

                //console.log(newSeries);
                this.setLegend();
                
                //loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
                document.getElementById(this.props.id+'plotmenu').innerHTML = `
                    <select id='${this.props.id}plotselect'>
                        <option value='eegraw'>Raw (Single)</option>
                        <option value='Stackedeegraw' selected>Raw (Stacked)</option>
                        <option value='eegfft'>FFT</option>
                        <option value='eegcoh'>Coherence</option>
                        <option value='meaneegcoh'>Mean Coherence</option>
                    </select>
                `;
            }

            const getData = () => {
                if(end > size) end = size;
                this.readFromDB(filename,begin,end,(data,file)=>{
                    let loaded = this.parseDBData(data,head,file,end===size);
                    if(!spsEstimate) {
                        let diff = 0;
                        loaded.data.times.slice(0,20).forEach((t,i) => {if(i>0) diff+=(t-loaded.data.times[i-1])});
                        spsEstimate = 1/(0.001*(diff/19));
                    }
                    if(!this.startTime) {
                        this.startTime = loaded.data.times[0];
                    }1
                    if(filename.indexOf('heg') > -1) { 
                        //loaded.data = {times,red,ir,ratio,ratiosma,ambient,error,rmse,notes,noteTimes}
                        let gmode = document.getElementById(this.props.id+'plotselect').value;
                        if(gmode === 'heg') {
                            this.uplot.uPlotData = [
                                loaded.data.times,
                                loaded.data.red,
                                loaded.data.ir,
                                loaded.data.ratio,
                                loaded.data.ratiosma,
                                loaded.data.ambient,
                                loaded.data.temp
                            ];
                            this.uplot.plot.setData(this.uplot.uPlotData);
                            this.uplot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v- this.startTime)*.00001666667)+"m:"+((v- this.startTime)*.001 - 60*Math.floor((v- this.startTime)*.00001666667)).toFixed(1) + "s");
                        }
    
                    
                    }
                    else {
                        // loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
                        let gmode = document.getElementById(this.props.id+'plotselect').value;
                        this.uplot.uPlotData = [
                            loaded.data.times
                        ];
                        if(gmode.includes('eegraw')){
                            for(const prop in loaded.data) {
                                if(prop.includes('signal')) {
                                    this.uplot.uPlotData.push(loaded.data[prop]);
                                }
                            }
                            this.uplot.plot.setData(this.uplot.uPlotData);
                        } else if(gmode.includes('eegfft')){
                            for(const prop in loaded.data) {
                                if(prop.includes('fft')) {
                                    this.uplot.uPlotData.push(loaded.data[prop]);
                                }
                            }
                            this.uplot.plot.setData(this.uplot.uPlotData);
                        } else if(gmode === 'eegcoh'){
                            for(const prop in loaded.data) {
                                if(prop.includes('::')) {
                                    this.uplot.uPlotData.push(loaded.data[prop]);
                                }
                            }
                            this.uplot.plot.setData(this.uplot.uPlotData);
                        } else if(gmode === 'meaneegcoh'){
                            for(const prop in loaded.data) {
                                if(prop.includes('::')) {
                                    //this.uplot.uPlotData.push(loaded.data[prop]);
                                }
                            }
                            this.uplot.plot.setData(this.uplot.uPlotData);
                        }
                        this.uplot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v-this.startTime)*.00001666667)+"m:"+((v- this.startTime)*.001 - 60*Math.floor((v-this.startTime)*.00001666667)).toFixed(1) + "s");
                        
                    }
                });
            }

            document.getElementById(this.props.id+'sessionrange').onchange = () => {
                let val = document.getElementById(this.props.id+'sessionrange').value;
                //console.log(val)
                begin = parseInt(val);
                end = begin+buffersize;
                if(end > size) end = size;
                getData();
            }

            getData();

        });
        },100);
    }

    msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
      }
 
    analyzeSession = async (filename='', analysisType=undefined) => {
        let head = undefined;
        this.analyze_result = {}; this.analyze_completed = false;
        this.getCSVHeader(filename, (header)=> { 
            head = header.split(',');
        });

        this.getFileSize(filename, (size)=> {
            console.log(size);
            let begin = 0;
            let buffersize = 1100000;
            let end = buffersize;
            let spsEstimate = undefined;
            let startTime = undefined;
            
            let pass=true;

            const analyzeChunk = () => {
                if(end > size) { end = size; }
                this.readFromDB(filename,begin,end,(data,file)=>{
                    let loaded = this.parseDBData(data,head,file,end===size);
                    if(!spsEstimate) {
                        let diff = 0;
                        loaded.data.times.slice(0,20).forEach((t,i) => {if(i>0) diff+=(t-loaded.data.times[i-1])});
                        spsEstimate = 1/(0.001*(diff/19));
                    }
                    if(!startTime) {
                        startTime = loaded.data.times[0];
                    }
                    if(filename.includes('heg')) {

                        /*
                            this.analyze_result.heggain,
                            this.analyze_result.hegmeangain,
                            this.analyze_result.error,
                            this.analyze_result.rmse,
                            this.analyze_result.meanratio,
                            this.analyze_result.meanred,
                            this.analyze_result.meanir,
                            this.analyze_result.meanambient,
                            this.analyze_result.meanhrv,
                            this.analyze_result.meanbrv,
                            this.analyze_result.hegnotes,
                        */

                        if(!this.analyze_result.meanratio) {
                            this.analyze_result.meanratio = (loaded.data.ratio.reduce((a,c) => {return a+c}))/loaded.data.ratio.length; 
                            this.analyze_result.error = loaded.data.error; this.analyze_result.rmse = loaded.data.rmse; 
                        }
                        else { 
                            this.analyze_result.meanratio = (this.analyze_result.meanratio + (loaded.data.ratio.reduce((a,c) => {return a+c}))/loaded.data.ratio.length)*.5; 
                            this.analyze_result.error = (this.analyze_result.error+loaded.data.error)*.5; 
                            this.analyze_result.rmse=(this.analyze_result.rmse+loaded.data.rmse)*.5; 
                        }
                        
                        if(!this.analyze_result.meanred) {this.analyze_result.meanred = (loaded.data.red.reduce((a,c) => {return a+c}))/loaded.data.red.length;}
                        else { this.analyze_result.meanred = (this.analyze_result.meanred + (loaded.data.red.reduce((a,c) => {return a+c}))/loaded.data.red.length)*.5;}
                        
                        if(!this.analyze_result.meanir) {this.analyze_result.meanir = (loaded.data.ir.reduce((a,c) => {return a+c}))/loaded.data.ir.length; }
                        else { this.analyze_result.meanir = (this.analyze_result.meanir + (loaded.data.ir.reduce((a,c) => {return a+c}))/loaded.data.ir.length)*.5;}
                        
                        if(!this.analyze_result.meanambient) {this.analyze_result.meanambient = (loaded.data.ambient.reduce((a,c) => {return a+c}))/loaded.data.ambient.length;}
                        else { this.analyze_result.meanambient = (this.analyze_result.meanambient + (loaded.data.ambient.reduce((a,c) => {return a+c}))/loaded.data.ambient.length)*.5;}
                        
                        if(!this.analyze_result.meanred) {this.analyze_result.meanred = (loaded.data.red.reduce((a,c) => {return a+c}))/loaded.data.red.length;}
                        else { this.analyze_result.meanred = (this.analyze_result.meanred + (loaded.data.red.reduce((a,c) => {return a+c}))/loaded.data.red.length)*.5;}
                        
                        if(!this.analyze_result.meanhrv) {this.analyze_result.meanhrv = (loaded.data.hrv.reduce((a,c) => {return a+c}))/loaded.data.hrv.length; }
                        else { this.analyze_result.meanhrv = (this.analyze_result.meanhrv + (loaded.data.hrv.reduce((a,c) => {return a+c}))/loaded.data.hrv.length)*.5;}

                        if(!this.analyze_result.meanbrv) {this.analyze_result.meanbrv = (loaded.data.brv.reduce((a,c) => {return a+c}))/loaded.data.brv.length; }
                        else { this.analyze_result.meanbrv = (this.analyze_result.meanbrv + (loaded.data.brv.reduce((a,c) => {return a+c}))/loaded.data.brv.length)*.5;}
                        
                        if(!this.analyze_result.meanbpm) {this.analyze_result.meanbpm = (loaded.data.bpm.reduce((a,c) => {return a+c}))/loaded.data.bpm.length; }
                        else { this.analyze_result.meanbpm = (this.analyze_result.meanbpm + (loaded.data.bpm.reduce((a,c) => {return a+c}))/loaded.data.bpm.length)*.5;}

                        if(!this.analyze_result.meanbrpm) {this.analyze_result.meanbrpm = (loaded.data.brpm.reduce((a,c) => {return a+c}))/loaded.data.brpm.length; }
                        else { this.analyze_result.meanbrpm = (this.analyze_result.meanbrpm + (loaded.data.brpm.reduce((a,c) => {return a+c}))/loaded.data.brpm.length)*.5;}
                        

                        if(!this.analyze_result.hegnotes) {this.analyze_result.hegnotes = loaded.data.notes;} else {this.analyze_result.hegnotes.push(loaded.data.notes);}
                        if(!this.analyze_result.hegnoteTimes) {this.analyze_result.hegnoteTimes = loaded.data.noteTimes;} else {this.analyze_result.hegnoteTimes.push(loaded.data.noteTimes);}

                        if(!this.analyze_result.heggain) {
                            this.analyze_result.heggain = this.mean(loaded.data.ratiosma.slice(0,40));
                            this.analyze_result.hegmeangain = this.mean(loaded.data.ratiosma.slice(0,40));
                        } if( end === size ) { 

                            this.analyze_result.duration = this.msToTime(loaded.data.times[loaded.data.times.length-1]-startTime);

                            this.analyze_result.heggain = 100*(this.mean(loaded.data.ratiosma.slice(loaded.data.ratiosma.length-40))/this.analyze_result.heggain - 1);
                            this.analyze_result.hegmeangain = 100*(this.analyze_result.meanratio/this.analyze_result.hegmeangain - 1);
                        }


                    }
                    else if (filename.includes('eeg')) {
                        /*
                            this.analyze_result.bandpowers,
                            this.analyze_result.eegratios,
                            this.analyze_result.eegcoherence,
                            this.analyze_result.eegnoise,
                            this.analyze_result.eegimpedance,
                            this.analyze_result.eegnotes,
                        */
                       //if(analysisType === '') {}
                       if(end === size) {
                           this.analyze_result.duration = this.msToTime(loaded.data.times[loaded.data.times.length-1]-startTime);
                       }
                    }
                    pass = true;
                    if(end === size) { this.analyze_completed = true; } else {begin+= buffersize; end += buffersize;}
                });
            }

            let run = () => {
                if(!this.analyze_completed) {
                    if(pass === true) {pass=false; analyzeChunk();}
                    setTimeout(()=>{run();},10);
                } else {
                    console.log(this.analyze_result);    
                    return; 
                } 
            }

            run();
        });
    }

    makeSeries = (type='heg' , head=undefined) => {
        let newSeries = [{}];
        if(type==='heg'){
            newSeries.push({
                label:"Red",
                show:false,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,0,0)"
            });
            newSeries.push({
                label:"IR",
                show:false,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(0,155,155)"
            });
            newSeries.push({
                label:"Ratio",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,0,155)"
            });
            newSeries.push({
                label:"Ratio SMA",
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(155,155,0)"
            });
            newSeries.push({
                label:"Ambient",
                show:false,
                value: (u, v) => v == null ? "-" : v.toFixed(1),
                stroke: "rgb(0,0,0)"
            });  
        } else if(head) {
            let fft = false;
            console.log(type)
            if (type.includes('eegraw')) {
                head.forEach((value, idx) => {
                    let val = value.split(';');
                    if(val.length > 1) {
                        fft=true;
                    } else if (idx > 1 && fft === false) {
                        newSeries.push({
                            label:val[0],
                            value: (u, v) => v == null ? "-" : v.toFixed(1),
                            stroke: 'rgb('+Math.random()*155+','+Math.random()*155+','+Math.random()*155+')'
                        });
                    } 
                });
            }
            else if (type.includes('eegfft')) {
                head.forEach((value, idx) => {
                    let val = value.split(';');
                    if(val.length > 1) {
                        if(val[1].toLowerCase().indexOf("fft") > -1) {
                            if(val[0].indexOf('::') < 0) {
                                newSeries.push({
                                    label:val[0],
                                    value: (u, v) => v == null ? "-" : v.toFixed(1),
                                    stroke: 'rgb('+Math.random()*155+','+Math.random()*155+','+Math.random()*155+')'
                                });
                            }
                        }
                    }
                });
            } 
            else if (type.includes('eegcoh')) {
                head.forEach((value, idx) => {
                    let val = value.split(';');
                    if(val.length > 1) {
                        if(val[1].toLowerCase().indexOf("fft") > -1) {
                            if(val[0].indexOf('::') > -1) {
                                newSeries.push({
                                    label:val[0],
                                    value: (u, v) => v == null ? "-" : v.toFixed(1),
                                    stroke: 'rgb('+Math.random()*155+','+Math.random()*155+','+Math.random()*155+')'
                                });
                            }
                        }
                    }
                });
            }
        
        }
        return newSeries;
    }

    setuPlot = () => {
        /*
            <option value='eegraw'>Raw (Single)</option>
            <option value='Stackedeegraw' selected>Raw (Stacked)</option>
            <option value='eegfft'>FFT</option>
            <option value='eegcoh'>Coherence</option>
            <option value='meaneegcoh'>Mean Coherence</option>
        */
        let gmode = document.getElementById(this.props.id+'plotselect').value;
        if(gmode === 'heg') {
            let newSeries = this.makeSeries('heg');

            let dummyarr = new Array(100).fill(1);

            this.uplot.uPlotData = [
                dummyarr,
                dummyarr,
                dummyarr,
                dummyarr,
                dummyarr,
                dummyarr
            ];

            newSeries[0].label = "t";
            this.uplot.makeuPlot(
                newSeries, 
                this.uplot.uPlotData, 
                this.AppletHTML.node.clientWidth, 
                400
            );

            this.setLegend();
            this.uplot.plot.axes[0].values = (u, vals, space) => vals.map(v => Math.floor((v- this.uplot.uPlotData[0][0])*.00001666667)+"m:"+((v- this.uplot.uPlotData[0][0])*.001 - 60*Math.floor((v-this.uplot.uPlotData[0][0])*.00001666667)).toFixed(1) + "s");
            //loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
        }
        else if (gmode === 'eegraw') {
            let newSeries = this.makeSeries('eegraw',head);
            newSeries[0].label = "t";
            let dummyarr = new Array(100).fill(1);
            newSeries.forEach((s)=>{
                this.uplot.uPlotData.push(dummyarr);
            })

            this.uplot.makeuPlot(
                newSeries, 
                this.uplot.uPlotData, 
                this.AppletHTML.node.clientWidth, 
                400
            );

            //console.log(newSeries);
            this.setLegend();
            
        }
    }

    updateuPlot = () => {

    }
   

} 
