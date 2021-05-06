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
        this.sub = undefined;
        this.sub2 = undefined;
        this.uplot = undefined;
        this.analyze_result = {};
        this.analyze_completed = false;
    
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
                <p>Local Files</p>
                <hr align='left' style='width:25%;'>
                <div id='${props.id}fs'></div>
                <hr>
                <span>Load Brainsatplay CSV into Browser:  <button id='${props.id}loadcsv'>Load</button></span>
                <hr>
                <p>Google API Test</p>
                <div id='${props.id}content'></div>
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
        }
        let head = undefined;
            
        this.getCSVHeader(filename, (header)=> { 
            head = header.split(',');
        });

        this.getFileSize(filename, (size)=> {
            console.log(size);
            let begin = 0;
            let buffersize = 1000000;
            let end = buffersize;
            let nsec = 10; let spsEstimate = 0;
            /*
                -> get data in window
                -> check relative sample rate with unix time
                -> adjust buffer size to that (update rangeend too)
            */

            let rangeend = size - buffersize; if(rangeend < 0) rangeend = 1;
            let val = 0; if(rangeend === 1) val = 1

            document.getElementById(this.props.id+'sessionwindow').innerHTML = `
            <div width="100%">
                <table id=${this.props.id}overlay' style='position:absolute; z-index:4;'>
                    <tr valign='top'><td><button id='${this.props.id}plotclose' style='pointer:cursor;'>X</button></td><td id='${this.props.id}plotmenu'></td><td id='${this.props.id}legend' style='background-color:rgba(255,255,255,1);'></td></tr>
                </table>
                <div id='${this.props.id}uplot' style='background-color:white;'></div>
            </div>
            <div id='${this.props.id}sessioninfo' style='background-color:rgba(50,50,50,1);'>
                <table>
                <tr id='${this.props.id}sessioninforow'>
                <td><span id='${this.props.id}sessionname' style='border:1px solid white'>${filename}</span></td>
                <td>Scroll:<input id='${this.props.id}sessionrange' type='range' min='0' max='${rangeend}' value='${val}' step='1'></td>
                </tr>
                <tr id='${this.props.id}sessionstatsrow'>
                    <td colSpan="2"><div id='${this.props.id}sessionstats'>Stats</div></td>
                </tr>
                </table>
            </div>
            `;

            this.uplot = new uPlotMaker(this.props.id+'uplot');
            //setup uplot
            if(filename.indexOf('heg') > -1) { 
                //loaded.data = {times,red,ir,ratio,ambient,error,rmse,notes,noteTimes}
                let newSeries = [{}];
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
                        <option value='All' selected>All</option>
                    </select>
                `;

                document.getElementById(this.props.id+'sessioninforow').innerHTML += `
                    <td>Session Analytics: <button id='${this.props.id}sessionratio'>HEG Ratio</button></td>
                `;

                document.getElementById(this.props.id+'sessionratio').onclick = () => {
                    this.analyzeSession(filename,'ratio');
                    let waitResult = () => {
                        if(!this.analyze_completed) setTimeout(()=>{requestAnimationFrame(waitResult);},15);
                        else {
                            console.log('completed analysis!'); 
                            document.getElementById(this.props.id+'sessionstatsrow').innerHTML += `
                                <td>Average Ratio: ${this.analyze_result.ratiomean.toFixed(3)}</td>
                            `;
                        }
                    }
                    waitResult();
                }

                document.getElementById(this.props.id+'plotclose').onclick = () => {
                    if(this.uplot) {     
                        this.uplot.deInit();
                        this.uplot = undefined;
                    }
                    document.getElementById(this.props.id+'sessionwindow').innerHTML = "";
                }
            }
            else {
                //loaded.data = {times,fftTimes,tag_signal,tag_fft,(etc),notes,noteTimes}
                document.getElementById(this.props.id+'plotmenu').innerHTML = `
                    <select id='${this.props.id}plotselect'>
                        <option value='Raw'>Raw (Single)</option>
                        <option value='Stacked' selected>Raw (Stacked)</option>
                        <option value='FFT'>FFT</option>
                        <option value='Coherence'>Coherence</option>
                        <option value='MeanCoherence'>Mean Coherence</option>
                    </select>
                `;
            }

            const getData = () => {
                if(end > size) end = size;
                this.readFromDB(filename,begin,end,(data,file)=>{
                    let loaded = this.parseDBData(data,head,file,end===size);
                    if(filename.indexOf('heg') > -1) { 
                        //loaded.data = {times,red,ir,ratio,ratiosma,ambient,error,rmse,notes,noteTimes}
                        let gmode = document.getElementById(this.props.id+'plotselect').value;
                        if(gmode === 'All') {
                            this.uplot.uPlotData = [
                                loaded.data.times,
                                loaded.data.red,
                                loaded.data.ir,
                                loaded.data.ratio,
                                loaded.data.ratiosma,
                                loaded.data.ambient
                            ]
                            this.uplot.plot.setData(this.uplot.uPlotData);
                            console.log(gmode);
                        }
    
                        let sessionchange = (this.mean(loaded.data.ratiosma.slice(loaded.data.ratiosma.length-40))/this.mean(loaded.data.ratiosma.slice(0,40)) - 1)*100;
                        let sessionGain = (this.mean(loaded.data.ratiosma)/this.mean(loaded.data.ratiosma.slice(0,200)) - 1)*100;

                        let errCat = "♥ ฅ(=^ᆽ^=ฅ)"; // "(=<ᆽ<=)?" //"(=xᆽx=)"

                        let changecolor = 'red';
                        let gaincolor = 'red';
                        if(sessionchange > 0) changecolor = 'chartreuse';
                        if(sessionGain > 0) gaincolor = 'chartreuse';

                        
                        document.getElementById(this.props.id+"sessionstats").innerHTML = `
                        <span style='color:`+changecolor+`;'>Change: `+sessionchange.toFixed(2)+`%</span>    
                        | <span style='color:`+gaincolor+`;'>Avg Gain: `+sessionGain.toFixed(2)+`%</span>
                        | <span>Error: `+loaded.data.error.toFixed(5)+`</span>
                        | <span>RMSE: `+loaded.data.rmse.toFixed(5)+`</span>
                        `;
                    
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

            getData();

        });
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

      analyzeSession = async (filename='', analysisType='ratio') => {
        let head = undefined;
        this.analyze_result = {}; this.analyze_completed = false;
        this.getCSVHeader(filename, (header)=> { 
            head = header.split(',');
        });

        this.getFileSize(filename, (size)=> {
            console.log(size);
            let begin = 0;
            let buffersize = 1000000;
            let end = buffersize;
            let spsEstimate = undefined;
            
            let pass=true;

            const analyzeChunk = () => {
                if(end > size) { end = size; }
                this.readFromDB(filename,begin,end,(data,file)=>{
                    let loaded = this.parseDBData(data,head,file,end===size);
                    if(!spsEstimate) spsEstimate = Math.round(loaded.data.times.slice(0,20).reduce((a,c) => {a+c})/20);
                    if(filename.indexOf('heg') > -1) {
                        if(analysisType === 'ratio') { //heg ratio analysis
                            if(!this.analyze_result.ratiomean) {this.analyze_result.ratiomean = (loaded.data.ratio.reduce((a,c) => {return a+c}))/loaded.data.ratio.length; console.log(this.analyze_result.ratiomean); this.analyze_result.error = loaded.data.error; this.analyze_result.rmse = loaded.data.rmse; }
                            else { this.analyze_result.ratiomean = (this.analyze_result.ratiomean + (loaded.data.ratio.reduce((a,c) => {return a+c}))/loaded.data.ratio.length)*.5; this.analyze_result.error = (this.analyze_result.error+loaded.data.error)*.5; this.analyze_result.rmse=(this.analyze_result.rmse+loaded.data.rmse)*.5; }
                        } else if (analysisType === 'hrv') {

                        }
                    }
                    else {
                        if(analysisType === 'ratio') { //bandpower ratios

                        } else if (analysisType === 'fft') {

                        } else if (analysisType === 'coherence') {

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

    
   
} 