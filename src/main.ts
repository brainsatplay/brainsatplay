let express = require("express")
let cors = require("cors")
let http = require("http")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")

// Import the brainsatplay API
import * as api from './backend/index'

import { User } from '../examples/schemas/user.schema'
import { Note } from '../examples/schemas/note.schema'

// Set Environment Variables
import { resolve } from "path";
import { config } from "dotenv";
import {Router} from './core/Router'

import OSCService from './services/osc/osc.backend'
import WebRTCService from './services/webrtc/webrtc.backend'

import SessionsService from './services/sessions/sessions.service'
import DatabaseService from './services/database/database.service'
import UnsafeService from './services/unsafe/unsafe.service'
config({ path: resolve(__dirname, `../.env`) });
config({ path: resolve(__dirname, `../.key`) });

import {settings} from 'src/server_settings.js'
import StructService from './services/database/structs.service'

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

console.log('using port ', port);

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
  function init(db?:any) {

    // Instantiate the Router class to handle services
    let controller = new Router({ debug: false });

    // Enable HTTP Messages
    if (services.http){
      let http = new api.HTTPService(controller);

      app.get("**", http.controller);
      app.post("**", http.controller);
      controller.load(http);
  }

    // Enable WebSocket Messages
    if (services.websocket){
      let websocket = new api.WebsocketService(controller, server);
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
  }
}

export default main