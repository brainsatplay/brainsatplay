if(self instanceof WorkerGlobalScope) {
    console.log("Worker!");
}

self.onmessage = (ev) => {
    console.log(ev);
}