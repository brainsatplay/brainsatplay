//Load and save CSV data
import { Session } from '../Session';
import { StateManager } from '../ui/StateManager';
import {CSV} from './csv'

import filesvg from '../ui/assets/file_noun.svg'
import csvsvg from '../ui/assets/file-csv-solid.svg'
import deletesvg from '../ui/assets/trash-alt-regular.svg'

export function file_template(props={id:Math.random()}) {
    return `
    <div id="`+props.id+`">
        <div style="display:flex; align-items: center; justify-content: space-between;">
        <p id="`+props.id+`filename" style='color:white; font-size: 80%;'>`+props.id+`</p>
        <div style="display: flex;">
            <img id="`+props.id+`svg" src="`+csvsvg+`" style="height:40px; width:40px; fill:white; padding: 10px; margin: 5px;">
            <img id="`+props.id+`delete" src="`+deletesvg+`" style="height:40px; width:40px; fill:white; padding: 10px; margin: 5px;">
            </div>
        </div>
    </div>
    `;
}

import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs');
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;

export class DataManager {
    constructor(session=new Session(), onload = this.onload) {
        this.session = session;
        this.atlas = this.session.atlas;
        this.state = new StateManager({
            sessionName: '',
            autosaving: true,
            saveChunkSize: 0,
            saveChunkSize: 2000,
            sessionChunks: 0,
            eegSaveCounter: 0,
            hegSaveCounter: 0,
            newSessionCt: 0,
            fileSizeLimitMb: 250,
            loaded:{header:[],data:{},type:''}
        });

        this.onload = onload;

        this.sub = this.state.subscribe('loaded',(loaded)=>{this.onload(loaded);});
        this.infoSub = null;
        this.deviceSub = null;
        this.deviceName = null;
    }

    deinit = () => {
        this.state.unsubscribeAll('loaded');
        if(this.infoSub) this.state.unsubscribe('info',this.infoSub);
        if(this.deviceSub) this.state.unsubscribe('')
    }      
    
    onload = (loaded) => {
        //console.log(loaded);
    }

    readyHEGDataForWriting = (from=0,to='end') => {
        let data = this.atlas.readyHEGDataForWriting(from,to);
        return data;
    }

    readyEEGDataForWriting = (from=0,to='end',getFFTs=true) => {
        let data = this.atlas.readyEEGDataForWriting(from,to,getFFTs);
        return data;
    }

    saveHEGdata = (from=0,to='end') => {
        CSV.saveCSV(this.atlas.readyHEGDataForWriting(from,to),this.toISOLocal(new Date())+"_heg");
    }

    saveEEGdata = (from=0,to='end',getFFTs=true) => {
        CSV.saveCSV(this.atlas.readyEEGDataForWriting(from,to,getFFTs),this.toISOLocal(new Date())+"_eeg");
    }

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    parseHEGData = (data=[], header=[]) => {
        let t = [], red = [], ir = [], ratio = [], temp=[], ratiosma = [], ambient = [], bpm=[], hrv=[], brpm=[], brv=[], beatTimes=[], breathTimes=[], notes=[], noteTimes=[], noteIndices=[];
        let err = 0;
        let mse = 0;

        let noteidx = undefined;
        let note = header.find((h,i) => {
            if(h.toLowerCase().indexOf('note') > -1) 
            {
                noteidx = i;
                return true;
            }
        });
        data.forEach((r,i)=>{
            let row = r.split(',');
            t.push(parseFloat(row[1]));
            red.push(parseFloat(row[2]));
            ir.push(parseFloat(row[3]));
            ratio.push(parseFloat(row[4]));
            temp.push(parseFloat(row[5]));
            if(row[6] && row[6] !== "") {bpm.push(parseFloat(row[6]));hrv.push(parseFloat(row[7])); beatTimes.push(t[t.length-1]);}
            if(row[8] && row[8] !== "") {brpm.push(parseFloat(row[8]));brv.push(parseFloat(row[9])); breathTimes.push(t[t.length-1]);}

            if(ratio.length > 40) ratiosma.push(this.mean(ratio.slice(ratio.length-40)))
            else ratiosma.push(this.mean(ratio.slice(0)));
            ambient.push(parseFloat(row[5]));

            if(noteidx) {
                if(row[noteidx]) {
                    notes.push(row[noteidx]);
                    noteTimes.push(t[t.length-1]);
                    noteIndices.push(i);
                }
            }

            err += Math.abs((ratio[ratio.length-1] - ratiosma[ratiosma.length-1])/ratiosma[ratiosma.length-1])
            mse += Math.pow((ratio[ratio.length-1] - ratiosma[ratiosma.length-1]),2)
        });
        err = err/ratio.length;
        let rmse = Math.sqrt(mse/ratiosma.length);
        this.state.data.type = 'heg';
        this.state.data.loaded.header = header;
        this.state.data.loaded.data = { 
            times:t, red:red, ir:ir, ratio:ratio, ratiosma:ratiosma, ambient:ambient, temp:temp, error:err, rmse:rmse, notes:notes, noteTimes:noteTimes, noteIndices:noteIndices,
            bpm:bpm, hrv:hrv, brpm:brpm, brv:brv, beatTimes:beatTimes, breathTimes:breathTimes
        };
    }

    //for getting data saved in our format
    getHEGDataFromCSV = () => {
        CSV.openCSV(',',(data, header) => {
            this.parseHEGData(data,header);
        });
    }

    parseEEGData = (data, header) => {
        let channels = {times:[], fftTimes:[], fftFreqs:[], notes:[], noteTimes:[], noteIndices: []};
        let indices = [];
        let dtypes = [];
        let names = [];
        let ffts = false;
        header.forEach((value, idx) => {
            let v = value.split(';');
            if(v.length > 1) {
                if(v[1].toLowerCase().indexOf("fft") > -1) {
                    if(ffts === true & channels.fftFreqs.length === 0) {
                        channels.fftFreqs = header.slice(indices[indices.length-1]+1,idx).map(x => x = parseFloat(x));
                    }
                    ffts=true;
                    indices.push(idx);
                    dtypes.push('fft');
                    channels[v[0]+"_fft"] = [];
                    names.push(v[0]+"_fft");
                }
            } else if (ffts === false && idx > 2) {
                indices.push(idx); //push all headers till we get to the first fft header
                channels[v[0]+"_signal"] = [];
                names.push(v[0]+"_signal");
                dtypes.push('signal');
            } else if (v[0].toLowerCase().indexOf('unix') > -1) {
                dtypes.push('times');
                names.push('times');
                indices.push(idx);
            } else if (v[0].toLowerCase().indexOf('note') > -1) {
                dtypes.push('notes');
                names.push('notes');
                indices.push(idx);
                //console.log(idx)
            }
        });

        data.forEach((r,i) => {
            let row = r.split(',');
            let j = 0;
            let ffttime = false;
            indices.forEach((idx,j) => {
                if(dtypes[j] === 'signal') {
                    channels[names[j]].push(parseFloat(row[idx]));
                } else if (dtypes[j] === 'fft' && row[idx+1]) {
                    if(!ffttime) {channels.fftTimes.push(parseFloat(row[1])); ffttime = true;}
                    if(indices[j+1]) {
                        channels[names[j]].push([...row.slice(idx+1,indices[j+1])].map(x => parseFloat(x)));
                    }
                    else channels[names[j]].push([...row.slice(idx+1)].map(x => parseFloat(x)));
                } else  if (dtypes[j] === 'times') {
                    channels.times.push(parseFloat(row[1]));
                } else if (dtypes[j] === 'notes' && row[idx]) {
                    channels.notes.push(row[idx]);
                    channels.noteTimes.push(parseFloat(row[1]));
                    channels.noteIndices.push(i)
                }
            });
        });

        this.state.data.loaded = {type:'eeg', header:header, data:channels};
    }

    getEEGDataFromCSV = () => {
        CSV.openCSV(',',(data, header) => {
            this.parseEEGData(data,header);
        });
    }

    toISOLocal(d) { //pass in a new Date(utc timestamp) object
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

    //----------------------
    //------BrowserFS-------
    //----------------------


    initFS = (oninit=()=>{}, onerror=()=>{}) => {
        let oldmfs = fs.getRootFS();
        BrowserFS.FileSystem.IndexedDB.Create({}, (e, rootForMfs) => {
            if (e) throw e;
            if (!rootForMfs) {
                onerror();
                throw new Error(`Error creating BrowserFS`);
            }
            BrowserFS.initialize(rootForMfs); //fs now usable with imports after this

            let p1 = new Promise(resolve => {
            fs.exists('/data', (exists) => {
                if (exists) {
                    console.log('exists!')
                    resolve()
                }
                else {
                    fs.mkdir('data', (errr) => {
                        if (errr) throw err;
                        resolve()
                    });
                }
            });
        })
        let p2 = new Promise(resolve => {
            fs.exists('/projects', (exists) => {
                if (exists) {
                    console.log('exists!')
                    oninit();
                }
                else {
                    fs.mkdir('projects', (errr) => {
                        if (errr) throw err;
                        oninit();
                    });
                }

            });
        });

        Promise.all([p1,p2]).then((values) => {
            oninit();
        })

    })
    }


    setupAutosaving = () => {
        //configure autosaving when the device is connected
        this.session.state.data.info = this.session.info;

        //console.log(this.session.state.data.info);
        this.infoSub = this.session.state.subscribe('info', (info) => {
            if (info.nDevices > 0) {
                let mainDevice = this.session.deviceStreams[this.session.info.nDevices-1].info.deviceType;
                this.deviceType = mainDevice;
                if (mainDevice === 'eeg') {
                    this.deviceName = this.session.deviceStreams[this.session.info.nDevices-1].info.deviceName;
                    if (this.state.data.sessionName === '') { 
                        this.state.data.sessionName = this.toISOLocal(new Date()) + "_" + this.deviceName;
                        fs.appendFile('/data/' + this.state.data.sessionName, '', (e) => {
                            if (e) throw e;
                            this.listFiles();
                        }); //+"_c"+State.data.sessionChunks
                    } 
                    this.deviceSub = this.session.subscribe(this.deviceName, this.session.atlas.data.eegshared.eegChannelTags[0].ch, undefined, (row) => {
                        //console.log(row.count, this.state.data.eegSaveCounter);
                        if (this.state.data.autosaving) {
                            if (this.state.data.saveCounter > row.count) { this.state.data.eegSaveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                            if (row.count - this.state.data.eegSaveCounter >= this.state.data.saveChunkSize) {
                                this.autoSaveEEGChunk(this.state.data.eegSaveCounter, undefined, 'eeg' + "_" +  this.deviceName);
                                this.state.data.eegSaveCounter = row.count;
                            }
                        }
                    });
                    document.getElementById("saveBCISession").onclick = () => {
                        console.log(this.session.deviceStreams)
                        let row = this.session.atlas.getEEGDataByChannel(this.session.atlas.data.eegshared.eegChannelTags[0].ch);
                        if (this.state.data.eegSaveCounter > row.count) { this.state.data.eegSaveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                        this.autoSaveEEGChunk(this.state.data.saveCounter, undefined, 'eeg' + "_" + this.deviceName);
                        this.state.data.eegSaveCounter = row.count;

                    }

                    document.getElementById("newBCISession").onclick = () => {
                        this.newSession();
                    }

                } else if (mainDevice === 'heg') {
                    this.deviceName = this.session.deviceStreams[this.session.info.nDevices-1].info.deviceName;
                    
                    if (this.state.data.sessionName === '') { 
                        this.state.data.sessionName = this.toISOLocal(new Date()) + "_" + this.deviceName;
                        fs.appendFile('/data/' + this.state.data.sessionName, '', (e) => {
                            if (e) throw e;
                            this.listFiles();
                        }); //+"_c"+State.data.sessionChunks
                        
                    }   
                    this.deviceSub = this.session.subscribe(this.deviceName, this.session.info.nDevices-1, undefined, (row) => {
                        if (this.state.data.autosaving) {
                            //if(this.state.data.saveCounter > row.count) { this.state.data.saveCounter = this.session.atlas.rolloverLimit - 2000; } //rollover occurred, adjust
                            if (this.session.atlas.data.heg[0].count - this.state.data.hegSaveCounter >= this.state.data.saveChunkSize) {
                                this.autoSaveHEGChunk(this.state.data.hegSaveCounter, undefined, 'heg' + "_" + this.deviceName);
                                this.state.data.hegSaveCounter = this.session.atlas.data.heg[0].count;
                            }
                        }
                    });
                    document.getElementById("saveBCISession").onclick = () => {
                        this.autoSaveHEGChunk(this.state.data.hegSaveCounter, undefined, 'heg' + "_" + this.deviceName);
                        this.state.data.hegSaveCounter = this.session.atlas.data.heg[0].count;

                    }

                    document.getElementById("newBCISession").onclick = () => {
                        this.newSession();
                    }
                }
            }
        });
    }

    newSession = (oncreated=this.listFiles) => {
        let deviceType = this.session.deviceStreams[this.session.info.nDevices].info.deviceType
        let sessionName = new Date().toISOString(); //Use the time stamp as the session name
        if (deviceType === 'eeg') {
            sessionName += "_eeg"
        } else if (deviceType === 'heg') {
            sessionName += "_heg"
        }
        this.state.data.sessionName = sessionName;
        this.state.data.sessionChunks = 0;
        this.state.data.saveChunkSize = 2000;
        this.state.data.newSessionCt++;
        fs.appendFile('/data/' + sessionName, "", (e) => {
            if (e) throw e;
            oncreated();
        });
    }

    getFilenames = (onload=(directory)=>{}, directory = '/data') => {
        fs.readdir(directory, (e, dir) => {
            if (e) throw e;
            if (dir) {
                console.log("files", dir);
                onload(dir);
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

    deleteFile = (path="/data/" + this.state.data['sessionName'], ondelete=this.listFiles) => {
        if (path != ''){
            fs.unlink(path, (e) => {
                if (e) console.error(e);
                ondelete();
            });
        } else {
            console.error('Path name is not defined')
        }
    }

    saveFileText(text, path){
        return new Promise(resolve => {
            fs.appendFile(path,text,(e)=>{
                if(e) throw e;
                resolve(text)
            });
        })
    }

    readFiles(path){
        return new Promise(resolve => {
            fs.readdir(path, function(e, output) {
                resolve(output)
            });
        })
    }

    readFile(path){
        return new Promise(resolve => {
            fs.readFile(path, function(e, output) {
                resolve(output)
            });
        })
    }

    readFileText(path){
        fs.open(path, 'r', (e, fd) => {
            if (e) throw e;
            fs.read(fd, end, begin, 'utf-8', (er, output, bytesRead) => {
                if (er) throw er;
                if (bytesRead !== 0) {
                    let data = output.toString();
                    //Now parse the data back into the buffers.
                    fs.close(fd, () => {
                        onread(data,filename);
                    });
                };
            });
        });
    }


    //Read a chunk of data from a saved dataset
    readFromDB = (filename=this.state.data['sessionName'], begin = 0, end = 5120, onread=(data)=>{}) => {
        if (filename != ''){
        fs.open('/data/' + filename, 'r', (e, fd) => {
            if (e) throw e;

                fs.read(fd, end, begin, 'utf-8', (er, output, bytesRead) => {
                    if (er) throw er;
                    if (bytesRead !== 0) {
                        let data = output.toString();
                        //Now parse the data back into the buffers.
                        fs.close(fd, () => {
                            onread(data,filename);
                        });
                    };
                });
            });
        } else {
            console.error('Path name is not defined')
        }
    }

    loadCSVintoDB = (onload=(data)=>{}) => {
        CSV.openCSVRaw((data,path)=>{
            let split = path.split(`\\`);
            let filename = split[split.length-1].slice(0,split[split.length-1].length-4);
            console.log(filename);
            fs.appendFile('/data/'+filename,data,(e)=>{
                if(e) throw e;
                onload(data);
            });
        });
    }

    parseDBData = (data,head,filename,hasend=true) => {
        let lines = data.split('\n'); 
        lines.shift(); 

        if(hasend === false) lines.pop(); //pop first and last rows if they are likely incomplete
        if(filename.indexOf('heg') >-1 ) {
            this.parseHEGData(lines,head);
            //this.session.dataManager.loaded
        } else { //eeg data
            this.parseEEGData(lines,head);
        }
        return this.state.data.loaded;
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
                    fs.close(fd,()=>{   
                        onOpen(header, filename);
                    });
                };
            }); 
        });
    }

    //
    listFiles = (onload=(directory)=>{},fs_html_id="filesystem") => {
        fs.readdir('/data', (e, directory) => {
            if (e) throw e;
            if (directory) {
                console.log("files", directory);
                onload(directory);
                if(fs_html_id){
                    let filediv = document.getElementById(fs_html_id);
                    filediv.innerHTML = "";
                    directory.forEach((str, i) => {
                        if (str !== "settings.json") {
                            filediv.innerHTML += file_template({ id: str });
                        }
                    });
                    directory.forEach((str, i) => {
                        if (str !== "settings.json") {
                            document.getElementById(str + "svg").onclick = () => {
                                console.log(str);
                                this.writeToCSV(str);
                            }
                            document.getElementById(str + "delete").onclick = () => {
                                this.deleteFile("/data/" + str);
                            }
                        }
                    });
                }
            }
        });
    }



    autoSaveEEGChunk = (startidx = 0, to = 'end', deviceName = 'eeg', getFFTs=true, onsaved=this.listFiles) => {
        if (this.state.data.sessionName === '') { this.state.data.sessionName = this.toISOLocal(new Date()) + "_" + deviceName; }
        let from = startidx;
        if (this.state.data.sessionChunks > 0) { from = this.state.data.eegSaveCounter; }
        let data = this.session.atlas.readyEEGDataForWriting(from, to, getFFTs);
        console.log("Saving chunk to /data/" + this.state.data.sessionName, this.state.data.sessionChunks);
        if (this.state.data.sessionChunks === 0) {
            fs.appendFile('/data/' + this.state.data.sessionName, data[0] + data[1], (e) => {
                if (e) throw e;
                this.state.data.sessionChunks++;
                onsaved();
            }); //+"_c"+State.data.sessionChunks

        }
        else {
            fs.appendFile('/data/' + this.state.data.sessionName, "\n" + data[1], (e) => {
                if (e) throw e;
                this.state.data.sessionChunks++;
                onsaved();
            }); //+"_c"+State.data.sessionChunks
        }

    }

    autoSaveHEGChunk = (startidx = 0, to = 'end', deviceName = "heg", onsaved=this.listFiles) => {
        if (this.state.data.sessionName === '') { this.state.data.sessionName = this.toISOLocal(new Date()) + "_" + deviceName; }
        let from = startidx;
        if (this.state.data.sessionChunks > 0) { from = this.state.data.hegSaveCounter; }
        let data = this.session.atlas.readyHEGDataForWriting(from, to);
        console.log("Saving chunk to /data/" + this.state.data.sessionName, this.state.data.sessionChunks);
        if (this.state.data.sessionChunks === 0) {
            fs.appendFile('/data/' + this.state.data.sessionName, data[0] + data[1], (e) => {
                if (e) throw e;
                this.state.data.sessionChunks++;
                onsaved();
            }); //+"_c"+State.data.sessionChunks
        }
        else {
            fs.appendFile('/data/' + this.state.data.sessionName, "\n" + data[1], (e) => {
                if (e) throw e;
                this.state.data.sessionChunks++;
                onsaved();
            }); //+"_c"+State.data.sessionChunks
        }
    }

    //Write CSV data in chunks to not overwhelm memory
    writeToCSV = async (filename=this.state.data['sessionName']) => {
        if (filename != ''){
            fs.stat('/data/' + filename, (e, stats) => {
                if (e) throw e;
                let filesize = stats.size;
                console.log(filesize)
                fs.open('/data/' + filename, 'r', (e, fd) => {
                    if (e) throw e;
                    let i = 0;
                    let maxFileSize = this.state.data.fileSizeLimitMb * 1024 * 1024;
                    let end = maxFileSize;
                    if (filesize < maxFileSize) {
                        end = filesize;
                        fs.read(fd, end, 0, 'utf-8', (e, output, bytesRead) => {
                            if (e) throw e;
                            if (bytesRead !== 0) CSV.saveCSV(output.toString(), filename);
                            fs.close(fd);
                        });
                    }
                    else {
                        const writeChunkToFile = async () => {
                            if (i < filesize) {
                                if (i + end > filesize) { end = filesize - i; }
                                let chunk = 0;
                                fs.read(fd, end, i, 'utf-8', (e, output, bytesRead) => {
                                    if (e) throw e;
                                    if (bytesRead !== 0) {
                                        CSV.saveCSV(output.toString(), filename + "_" + chunk);
                                        i += maxFileSize;
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
        } else {
            console.error('File name is not defined.')
        }
    }

    //------------------------
    //-GOOGLE DRIVE FUNCTIONS-
    //------------------------
    
    checkFolder(onResponse=(result)=>{}) {
        window.gapi.client.drive.files.list({
            q:"name='Brainsatplay_Data' and mimeType='application/vnd.google-apps.folder'",
        }).then((response) => {
            if(response.result.files.length === 0) {
                this.createDriveFolder();
                if(onResponse) onResponse(response.result);
            }
            else if(onResponse) onResponse(response.result);
        });
    }

    createDriveFolder(name='Brainsatplay_Data') {
        let data = new Object();
        data.name = name;
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.create({'resource': data}).then((response)=>{
            console.log(response.result);
        });
    }

    //backup file to drive by name (requires gapi authorization)
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

    //doSomething(){}
    listDriveFiles(listDivId,onload=this.listFiles,ondownload=(csvdata)=>{}) {
        this.checkFolder((result)=> {
            window.gapi.client.drive.files.list({
                q: `'${result.files[0].id}' in parents`,
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name)"
            }).then((response) => {
                document.getElementById(this.props.id+'drivefiles').innerHTML = ``;
                //this.appendContent('Drive Files (Brainsatplay_Data folder):','drivefiles');
                var files = response.result.files;
                if (files && files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        document.getElementById(listDivId).insertAdjacentHTML('beforeend',`<div id=${file.id} style='border: 1px solid white;'>${file.name}<button id='${file.id}dload'>Download</button></div>`);
                        document.getElementById(file.id+'dload').onclick = () => {
                            
                            //Get CSV data from drive
                            var request = gapi.client.drive.files.export({'fileId': file.id, 'mimeType':'text/csv'});
                            request.then((resp) => {
                                let filename = file.name;
                                fs.appendFile('/data/'+filename,resp.body,(e)=>{
                                    if(e) throw e;
                                    ondownload(resp.body);
                                });
                            });
                        }
                    }
                    onload();
                } else {
                    return undefined;//this.appendContent('<p>No files found.</p>','drivefiles');
                }
              });
        })
        
    }

}
