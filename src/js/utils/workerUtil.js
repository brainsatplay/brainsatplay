export class WorkerUtil {

    constructor(nThreads=1, workerSrc = './js/eegworker.js', onReceivedMsg = this.onReceivedMsg, debug = false) {
        // this.onReceivedMsg = onReceivedMsg || this.onReceivedMsg

        // if(!receivedMsg) { this.onReceivedMsg = onReceivedMsg; }
        this.workers;
        this.threads = nThreads;
        this.threadRotation = 0;
        this.debug = debug;

        try {
            this.workers = [];
                for(var i = 0; i < this.threads; i++){
                    this.workers.push(new Worker(workerSrc));
                    this.workers[i].onmessage = (e) => {
                        var msg = { idx: i, msg: e.data}; //Returned parsed string
                        if(this.debug === true){console.log(i,": ", msg);}
                        onReceivedMsg(msg);
                    };
                }
                console.log("worker threads: ", this.threads)

            }
        catch (err) {
            this.workers = undefined;
            console.error("Worker error: ", err);
        }
    }

    addWorker(callback=this.onReceivedMsg) {
        this.threads++;
        var i = this.threads - 1;
        this.workers.push(new Worker(workerSrc));
        this.workers[i].onmessage = (e) => {
            var msg = { idx: i, msg: e.data}; //Returned parsed string
            if(this.debug === true){console.log(i,": ", msg);}
            callback;
        };
    }

    removeWorker(idx=null){
        if(this.workers.length > 0) {
            if(idx === null) {
                this.workers[this.threads-1].terminate();
                this.workers.pop();
            }
            else{
                this.workers[idx].terminate();
                this.workers.splice(idx,1);
            }
        }
    }

    //Sends info to worker threads for execution based on defined function "foo"
    postToWorker = (input,workeridx = null) => {
        if(workeridx === null) {
            this.workers[this.threadRotation].postMessage(input);
            if(this.debug === true){console.log("worker: ", this.threadRotation, " was sent: ", input);}
            if(this.threads > 1){
                this.threadRotation++;
                if(this.threadRotation >= this.threads){
                    this.threadRotation = 0;
                }
            }
        }
        else{
            this.workers[workeridx].postMessage(input);
            if(this.debug === true){console.log("worker: ", workeridx, " was sent: ", input);}
        }
    }

    //Callback when message data is received, expects eegworker.js formatted stuff
    onReceivedMsg = (msg) => {
        console.log(msg);
    }
}

