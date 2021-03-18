
import {Notion} from '@neurosity/notion'
import 'regenerator-runtime/runtime' //For async functions on node\\

main();

async function main() {
  const notion = new Notion();

  const user = await notion
    .login({
      email: "hans.berger@neurosity.co",
      password: "eegDisc0verer!"
    })
    .catch((error) => {
      console.log("Log in error", error);
    });

  if (user) {
    console.log("logged in!");


    mind.brainwaves().subscribe(brainwaves => {
        console.log(brainwaves);
        /* 
        {
          data: [Number, ... , Number],
          timestamp: Date,
          frequency: [
            [Number, ... , Number]
          ],
          psd: [Number, ... , Number]
        }
        */
      });


  } else {
    return;
  }

  await notion.logout().catch((error) => {
    console.log("Log out error", error);
  });

  console.log("logged out!");
}


export class notionInterface { //Contains structs and necessary functions/API calls to analyze serial data for the FreeEEG32

    constructor(
		onDecodedCallback = this.onDecodedCallback,
		onConnectedCallback = this.onConnectedCallback,
		onDisconnectedCallback = this.onDisconnectedCallback,
		) {

		this.onDecodedCallback = onDecodedCallback;
		this.onConnectedCallback = onConnectedCallback;
        this.onDisconnectedCallback = onDisconnectedCallback;

        this.sps = 512; // Sample rate
        this.nChannels = 32;
        this.nPeripheralChannels = 6; // accelerometer and gyroscope (2 bytes * 3 coordinates each)
        this.updateMs = 1000/this.sps; //even spacing
        this.stepSize = 1/Math.pow(2,24);
        this.vref = 2.50; //2.5V voltage ref +/- 250nV
        this.gain = 8;
            
        this.vscale = (this.vref/this.gain)*this.stepSize; //volts per step.
        this.uVperStep = 1000000 * ((this.vref/this.gain)*this.stepSize); //uV per step.
        this.scalar = 1/(1000000 / ((this.vref/this.gain)*this.stepSize)); //steps per uV.
    
        this.maxBufferedSamples = this.sps*60*5; //max samples in buffer this.sps*60*nMinutes = max minutes of data
        
        this.data = { //Data object to keep our head from exploding. Get current data with e.g. this.data.A0[this.data.counter-1]
          counter: 0,
          startms: 0,
          ms: [],
          'A0': [],
        }
    
    }

	//Callbacks
	onDecodedCallback(newLinesInt){
		//console.log("new samples:", newLinesInt);
	}

	onConnectedCallback() {
		console.log("port connected!");
	}

	onDisconnectedCallback() {
		console.log("port disconnected!");
    }
    
    onData() {
        
        //put it into this.data
        this.onDecodedCallback(newLinesInt)
    }

    }