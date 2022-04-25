let express = require("express")
let cors = require("cors")
let http = require("http")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")

// Import the brainsatplay API
import * as api from '../../src/backend/index'
import WebsocketService from '../../src/services/websocket/websocket.backend'
import HTTPService from '../../src/services/http/http.backend'

import * as brainsatplay from '../../src/core/index'

import { User } from '../schemas/user.schema'
import { Note } from '../schemas/note.schema'

// Set Environment Variables
import { resolve } from "path";
import { config } from "dotenv";
import {Router} from '../../src/core/Router'

import OSCService from '../../src/services/osc/osc.backend'
import WebRTCService from '../../src/services/webrtc/webrtc.backend'

import SessionsService from '../../src/services/sessions/sessions.service'
import DatabaseService from '../../src/services/database/database.service'
import UnsafeService from '../../src/services/unsafe/unsafe.service'
config({ path: resolve(__dirname, `../.env`) });
config({ path: resolve(__dirname, `../.key`) });

import {settings} from '../../src/settings'
import StructService from '../../src/services/database/structs.service'

const main = (port=settings.port, services:{[x:string] : boolean}={}) => {

const app = express();

// Parse Body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors()); // how to allow data to only intended website without cors

// Set Server
let protocol = settings.protocol;
 port = port;
const server = http.createServer(app);

// Start Server
server.listen(parseInt(port), () => {
  console.log(`Server created on ${protocol}://${settings.hosturl}:${port}`);
});

// ---------------- Start Database --------------------
// Connect to your local instance of Mongoose
mongoose.connection.on("open", () => console.log("DB Connected!"));


mongoose
  .connect(process.env.DB_URI ?? "")
  .then(() => {
    init(mongoose.connections[0].db)
  })
  .catch(() => {
    console.error("Error: MongoDB not initialized...");
    init();
  });

  // ----------------- Initialize API ------------------
  async function init(db?:any) {

    // Instantiate the Router class to handle services
    let controller = new Router({ debug: false });

    // Enable HTTP Messages
    if (services.http){
      let http = new HTTPService(controller);

      app.get("**", http.controller);
      app.post("**", http.controller);
      controller.load(http);
  }

    // Enable WebSocket Messages
    if (services.websocket){
      let websocket = new WebsocketService(controller, server);
      controller.load(websocket)
    }

    if (services.osc){
      let osc = new OSCService(controller);
      controller.load(osc)
    }

    if (services.webrtc){
      let webrtc = new WebRTCService(controller);
      controller.load(webrtc)
    }

    if (services.sessions){
      let sessions = new SessionsService(controller);
      controller.load(sessions)
    }

    if (services.database){

      let database = new DatabaseService(controller, {
        collections: {
          // Included
          users: {
            model: User,
            match: ['id', 'username', 'email'],
            filters: {
              get: () => {
                return true
              },
              post: () => {
                return true
              }
            }
          },

          // Custom
          notes: {
            model: Note,
            match: ['id']
          }
        }
      });
      
      controller.load(database)
    }

    if (services.structs){
      const structs = new StructService(controller, {db, mode: 'local'})
      controller.load(structs)
    }

    if (services.unsafe){
      let unsafe = new UnsafeService(controller)
      controller.load(unsafe)
    }



    // ---------------------------- Create Graph ----------------------------
    const add = new brainsatplay.Graph({
      tag: 'add',
      increment: 1,
      operator: (self, origin, input) => {
        return input + self.increment
      }
    })

    const log = new brainsatplay.Graph({
      tag: 'log',
      operator: (self, origin, input) => console.log(input)
    })

    add.subscribe(log) // This should output 3 to the console

    const random = new brainsatplay.Graph({
      tag: 'random',
      operator: () => Math.floor(100*Math.random())
    })

    random.subscribe((v) => {
      add.increment = v
    })

    log.subscribe(random) // This will update the increment value after every run

    random.run() // initialize random value

    await add.run(2)
    console.log('Done 1')
    await add.run(2)
    console.log('Done 2')
    await add.run(2)
    console.log('Done 3')

  }
}

export default main