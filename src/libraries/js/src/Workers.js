import Worker from 'web-worker'


let workerURL = './_dist_/libraries/js/src/utils/eeg.worker.js';
let defaultWorkerThreads = 2;

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

                this.workers.push(eegWorkers[i]);
            }
            console.log("worker threads: ", this.workers.length)
        }
        catch (err) {
            console.error(err);
        }
    }

    addWorker = (workerurl) => {
        console.log('add worker')
        try {
            this.workers.push(new Worker(workerurl,//new URL(workerurl, import.meta.url),
            {
            name:'eegworker_'+this.workers.length, 
            type: 'module',
            }));
            this.workers[i].onmessage = (e) => {
                var msg = e.data;
                //console.log(msg)
                //window.receivedMsg(msg);
                this.workerResponses.forEach((foo,i) => {
                foo(msg);
                })
            };
            console.log("worker threads: ", this.workers.length)
            return this.workers.length-1; //index
        } catch (err) {
            console.log(err);
        }
    }

    postToWorker = (input,workeridx = null) => {
        if(workeridx === null) {
            this.workers[this.workerThreadrot].postMessage(input);
            if(this.workerThreads > 1){
                this.workerThreadrot++;
                if(this.workerThreadrot >= this.workerThreads){
                    this.workerThreadrot = 0;
                }
            }
        }
        else{
            this.workers[workeridx].postMessage(input);
        }
    }
}
