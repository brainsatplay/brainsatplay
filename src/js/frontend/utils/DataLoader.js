//Load and save CSV data
import {DataAtlas} from '../../../library/src/DataAtlas'
import { StateManager } from '../../../library/src/ui/StateManager';
import {CSV} from '../../general/csv'

export class DataLoader {
    constructor(atlas=new DataAtlas(), onload = this.onload) {
        this.atlas = atlas;
        this.state = new StateManager({
            loaded:{header:[],data:{},type:''}
        });

        this.onload = onload;

        this.sub = this.state.subscribe('loaded',(loaded)=>{this.onload(loaded);});
    }

    deinit = () => {
        this.state.unsubscribeAll('loaded');
    }      
    
    onload = (loaded) => {
        console.log(loaded);
    }

    readyHEGDataForWriting = (from=0,to='end') => {
        let data = this.atlas.readyHEGDataForWriting(from,to);
        return data;
    }

    readyEEGDataForWriting = (from=0,to='end') => {
        let data = this.atlas.readyEEGDataForWriting(from,to);
        return data;
    }

    saveHEGdata = (from=0,to='end') => {
        CSV.saveCSV(this.atlas.readyHEGDataForWriting(from,to),this.toISOLocal(new Date())+"_heg");
    }

    saveEEGdata = (from=0,to='end') => {
        CSV.saveCSV(this.atlas.readyEEGDataForWriting(from,to),this.toISOLocal(new Date())+"_eeg");
    }

    mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

    parseHEGData = (data=[], header=[]) => {
        let t = [], red = [], ir = [], ratio = [], ratiosma = [], ambient = [], notes=[], noteTimes=[];
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
        data.forEach((r)=>{
            let row = r.split(',');
            t.push(parseFloat(row[1]));
            red.push(parseFloat(row[2]));
            ir.push(parseFloat(row[3]));
            ratio.push(parseFloat(row[4]));

            if(ratio.length > 40) ratiosma.push(this.mean(ratio.slice(ratio.length-40)))
            else ratiosma.push(this.mean(ratio.slice(0)));
            ambient.push(parseFloat(row[5]));

            if(noteidx) {
                if(row[noteidx]) {
                    notes.push(row[noteidx]);
                    noteTimes.push(t[t.length-1]);
                }
            }

            err += Math.abs((ratio[ratio.length-1] - ratiosma[ratiosma.length-1])/ratiosma[ratiosma.length-1])
            mse += Math.pow((ratio[ratio.length-1] - ratiosma[ratiosma.length-1]),2)
        });
        err = err/ratio.length;
        let rmse = Math.sqrt(mse/ratiosma.length);
        this.state.data.type = 'heg';
        this.state.data.loaded.header = header;
        this.state.data.loaded.data = { times:t, red:red, ir:ir, ratio:ratio, ratiosma:ratiosma, ambient:ambient, error:err, rmse:rmse, notes:notes, noteTimes:noteTimes};
    }

    //for getting data saved in our format
    getHEGDataFromCSV = () => {
        CSV.openCSV(',',(data, header) => {
            this.parseHEGData(data,header);
        });
    }

    parseEEGData = (data, header) => {
        let channels = {times:[], fftTimes:[], notes:[], noteTimes:[]};
        let indices = [];
        let dtypes = [];
        let names = [];
        let ffts = false;
        header.forEach((value, idx) => {
            let v = value.split(';');
            if(v.length > 1) {
                if(v[1].toLowerCase().indexOf("fft") > -1) {
                    console.log(v[1], idx)
                    ffts=true;
                    indices.push(idx);
                    dtypes.push('fft');
                    channels[v[0]+"_fft"] = [];
                    names.push(v[0]+"_fft");
                }
            } else if (ffts === false && idx > 1) {
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
            }
        });

        data.forEach((r) => {
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
                    channels.noteTimes.push(row[1]);
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

}