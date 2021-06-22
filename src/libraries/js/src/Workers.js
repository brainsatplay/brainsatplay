import Worker from 'web-worker'


let workerURL = './_dist_/libraries/js/src/utils/eeg.worker.js';
let defaultWorkerThreads = 0;

let eegWorkers = [];

// // WEBPACK
// import worker from './utils/eeg.worker.js'

// for(var i = 0; i < defaultWorkerThreads; i++){
//     eegWorkers.push(new worker())
// }

// SNOWPACK
for(var i = 0; i < defaultWorkerThreads; i++){
    eegWorkers.push(
        new Worker(
            workerURL,
            {name:'eegworker_'+i, type: 'module'}
        )
    )
}

export class WorkerManager {
    constructor(){
        this.workerResponses = []
        this.workers = []
        this.workerThreads = defaultWorkerThreads
        this.workerThreadrot = 0

        // Setup EEG Workers
        try {
            for(var i = 0; i < eegWorkers.length; i++){

                eegWorkers[i].onmessage = (e) => {
                    var msg = e.data;
                    //console.log(msg)
                    //window.receivedMsg(msg);
                    this.workerResponses.forEach((foo,i) => {
                        foo(msg);
                    });
                };
                let id = "worker_"+Math.floor(Math.random()*10000000000);
                this.workers.push({worker:eegWorkers[i],id:id});
            }
            console.log("worker threads: ", this.workers.length)
        }
        catch (err) {
            console.error(err);
        }
    }

    addWorker = (workerurl='./_dist_/libraries/js/src/utils/eeg.worker.js') => {
        console.log('add worker')
        try {
            let id = "worker_"+Math.floor(Math.random()*10000000000);
            let newWorker = new Worker(workerurl,//new URL(workerurl, import.meta.url),
            {name:'eegworker_'+this.workers.length, type: 'module',});
            this.workers.push({worker:newWorker, id:id});
            newWorker.onmessage = (e) => {
                var msg = e.data;
                //console.log(msg)
                //window.receivedMsg(msg);
                this.workerResponses.forEach((foo,i) => {
                    foo(msg);
                })
            };
            console.log("worker threads: ", this.workers.length)
            return id; //worker id
        } catch (err) {
            console.log(err);
        }
    }

    postToWorker = (input, id = null) => {
        if(id === null) {
            this.workers[this.workerThreadrot].worker.postMessage(input);
            if(this.workerThreads > 1){
                this.workerThreadrot++;
                if(this.workerThreadrot >= this.workerThreads){
                    this.workerThreadrot = 0;
                }
            }
        }
        else{
            this.workers.find((o)=>{
                if(o.id === id) {
                    o.worker.postMessage(input); 
                    return true;}
            })
        }
    }

    terminate(id) {
        let idx;
        let found = this.workers.find((o,i)=>{
            if(o.id === id) {
                idx=i;
                o.worker.terminate();
                return true;
            }
        });
        if(found) {
            this.workers.splice(idx,1);
            return true;
        } else return false;
    }
}
