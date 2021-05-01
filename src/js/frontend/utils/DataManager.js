//Load and save CSV data
import {DataAtlas} from '../../../library/src/DataAtlas'
import { StateManager } from '../../../library/src/ui/StateManager';
import {CSV} from '../../general/csv'

class DataManager {
    constructor(atlas=new DataAtlas()) {
        this.atlas = atlas;
        this.state = new StateManager({
            loaded:{header:[],data:{}}
        });
    }

    readyHEGDataForWriting = (from=0,to='end') => {
        let data = this.atlas.readyHEGDataForWriting(from,to);
        return data;
    }

    readyEEGDataForWriting = (from=0,to='end') => {
        let data = this.atlas.readyEEGDataForWriting(from,to);
        return data;
    }

    //for getting data saved in our format
    getHEGDataFromCSV = () => {
        CSV.openCSV(',',(data, header) => {
            let t = [], red = [], ir = [], ratio = [], ratiosma = [], ambient = [];
            let err = 0;
            let mse = 0;
            data.forEach((row)=>{
                t.push(parseFloat(row[1]));
                red.push(parseFloat(row[2]));
                ir.push(parseFloat(row[3]));
                ratio.push(parseFloat(row[4]));
                if(ratio.length > 40) ratiosma.push(this.mean(ratio.slice(ratio.length-40)))
                else ratiosma.push(this.mean(ratio.slice(0)));
                ambient.push(parseFloat(row[5]));
                err += Math.abs((ratio[ratio.length-1] - ratiosma[ratiosma.length-1])/ratiosma[ratiosma.length-1])
                mse += Math.pow((ratio[ratio.length-1] - ratiosma[ratiosma.length-1]),2)
            });
            err = err/ratio.length;
            let rmse = Math.sqrt(mse/ratiosma.length);
            this.state.data.loaded.header = header;
            this.state.data.loaded.data = { times:t, red:red, ir:ir, ratio:ratio, ratiosma:ratiosma, ambient:ambient, error:err, rmse:rmse};
        });
    }

    getEEGDataFromCSV = () => {
        CSV.openCSV(',',(data, header) => {
            header.forEach((value) => {

            });
        });
    }

}