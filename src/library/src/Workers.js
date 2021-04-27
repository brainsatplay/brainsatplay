import Worker from 'web-worker'

//window.workers = new WorkerUtil(2,'./js/utils/eegworker.js',receivedMsg); // ???
//console.log(window.workers);
export let workerResponses=[]; //array of onmessage functions for the return trip data from webworkers
export let workers = [];
export let workerThreads = 2; //Make multiple workers for big tasks
export let workerThreadrot = 0;
//WebWorker only works when hosted (e.g. with node)

let workerURL = './algorithms/eeg.worker.js';

try {
    workers = [];
    for(var i = 0; i < workerThreads; i++){
        workers.push(new Worker(workerURL,//new URL('./algorithms/eeg.worker.js', import.meta.url),
        {name:'eegworker_'+workers.length, type: 'module'}));
        workers[i].onmessage = (e) => {
            var msg = e.data;
            //console.log(msg)
            //window.receivedMsg(msg);
            workerResponses.forEach((foo,i) => {
                foo(msg);
            });
        };
    }
    console.log("worker threads: ", workers.length)
}
catch (err) {
    console.error(err);
}

export const addWorker = (workerurl=workerURL) => {
    try {
        workers.push(new Worker(workerurl,//new URL(workerurl, import.meta.url),
        {
        name:'eegworker_'+workers.length, 
        type: 'module',
        }));
        workers[i].onmessage = (e) => {
            var msg = e.data;
            //console.log(msg)
            //window.receivedMsg(msg);
            workerResponses.forEach((foo,i) => {
            foo(msg);
            })
        };
        console.log("worker threads: ", workers.length)
        return workers.length-1; //index
    } catch (err) {
        console.log(err);
    }
}

//input = {foo:'',data:[],origin:''}
//foo options: "xcor, autocor, cov1d, cov2d, sma, dft, multidft, multibandpassdft"
export const postToWorker = (input,workeridx = null) => {
    if(workeridx === null) {
        workers[workerThreadrot].postMessage(input);
        if(workerThreads > 1){
            workerThreadrot++;
            if(workerThreadrot >= workerThreads){
                workerThreadrot = 0;
            }
        }
    }
    else{
        workers[workeridx].postMessage(input);
    }
}