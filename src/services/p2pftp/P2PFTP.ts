import * as BFS from 'brainsatplay-storage'

type BufferedChunk = {
    filename:string,
    source:string,
    size:number,
    start:number|undefined, //let us know what chunk of the file we have
    end:string|number|undefined,
};

//for seeding or leeching
type FTPSource = {
    filename:string,
    source:string,
    size:number,
    start:number|undefined, //let us know what chunk of the file we have
    end:string|number|undefined,
    buffered:BufferedChunk[] //lets us know if we have multiple pieces of a file
}



//Uses a BrowserFS instance of IndexedDB to create a file transfer protocol, e.g. through WebRTC (like Webtorrent)
//Webtorrent will seed files sequentially to buffer e.g. video, or can seed randomly as normal torrents. We should do both too
export class P2PFTP {
    files:string[];
    leeching:FTPSource[];
    seeding:FTPSource[];

    constructor (leeching:FTPSource[], seeding:FTPSource[], localdir='data') {
        this.seeding = seeding; //filenames 
        this.leeching = leeching;

        this.setupFTP(localdir);

    }


    async setupFTP(localdir:string) {
        this.files = await BFS.listFiles(localdir);

        this.seeding.forEach((f:FTPSource) => {
            this.seedIndexedDBFile(f.filename,f.source);
        });

        this.leeching.forEach((f:FTPSource) => {
            this.leechFile(f.filename,f.source,f.start,f.end,false);
        })
    }

    
    //seed a local file
    seedIndexedDBFile(filename:string, source:string|undefined) {
        //create a room or supply a source to seed through
    }

    //if toCSV is false, writes leeched file to indexedDB by default. Can leech only chunks of a file
    //Need to know the size of the file and preallocate if we can or otherwise keep the data in order if its seeded randomly
    leechFile(filename:string, source:string, start:number=0, end:string|number='end', toCSV=false) {
        //connect to the source pool and ask for data
    }

    //As you write to IndexedDB, make it available for seeding
    reseedFile(filename:string, source:string|undefined) {
        //check if its already being leeched or exists locally to be seeded
    }   

    //then more BrowserFS macros

    //also create parity on the backend

}


/*
Abstract:

with a Dataset in memory

Encode as CSV text (or preferred format) into IndexedDB (becoming byte buffers) via BrowserFS
If dataset exceeds a certain size after enough written (e.g. over time), 
    split the file into chunks in IndexedDB (e.g. 50Mb is a lot for the browser) and create an indexed folder that can be streamed

Now a peer connects for your saved data:

If a peer is only looking for a piece of an indexed dataset: stream that chunk or that part of that chunk to them. They will be able to download directly to CSV

If a peer wants to seed, stream the chunks to them and they become a seeder. Can toggle if a dataset should be distributed fully or if chunks should be divided between seeders
    if fully copying datasets to each seeder, then anyone can go offline at anytime and the dataset is still fully accessible
    if distributing chunks of the dataset, some chunks may go offline but the data will be more widely distributable

We can use the Session service to organize rooms with access and customizable controls



Peer --> Request file chunk
Seeder --> Parse file chunk from DB, stream in chunks
Peer --> Receive chunks, parse into IndexedDB to become seeder or for downloading/backing up



*/