import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
// import { initRoutes } from "./controllers/init-routes";
// import { HTTPService, WebsocketService } from '../liveserver/src/backend'
import HTTPService from '../../../../services/http/http.backend'
import WebsocketService from '../../../../services/websocket/websocket.backend'

import StructService from '../../../../services/database/structs.service'
// import { StructService } from '../liveserver/src/services/database/'
// import { StructService } from 'liveserver-database'
// import { Router } from '../liveserver/src/core'
import Router from '../../../Router'
// import {Router} from 'liveserver-router'
//import { WebsocketServer } from 'liveserver-backend'
import bodyParser from 'body-parser';



import { settings } from './server_settings'
import { config } from 'dotenv';
const { env } = process;
const app = express();


try {
    //load .env files if they exist
    config({ path: settings.key }); //{ error, parsed } = config({path:'.env'})
}
catch(err) {

}
// Parse Body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(settings.mongodbmode) {
    let MONGODB_URI = `mongodb://${settings.host}:${settings.localdbport}/${settings.localdb}`; //default localdb URI (if running);

    const mongoose = require('mongoose');

    if(settings.mongodbmode === 'production' && typeof env.MONGODB !== 'undefined') {
        MONGODB_URI = env.MONGODB;
    } else if (settings.mongodbmode === 'dev' && typeof env.TESTDB !== 'undefined') {
        MONGODB_URI = env.TESTDB;
    } else if (settings.mongodbmode === 'dev' && typeof env.MONGODB !== 'undefined') {
        MONGODB_URI = env.MONGODB; //or just use this URI if the testdb uri is unavailable but this one is 
    }

    mongoose.connection.on('open', () => console.log(`connected to mongodb ${settings.mongodbmode} server`));

    console.log('MongoDB URI:', MONGODB_URI)
    mongoose.connect(MONGODB_URI)
        .then(() => {
            run(mongoose.connections[0].db) // Pass Database
        })
        .catch((e:any) => {
            console.log('\x1b[31m%s\x1b[0m', '\nERROR:', `Couldn't connect to mongodb ${settings.mongodbmode} server.\n`);
            console.log('MESSAGE:', e.message);
            console.log('REASON:', e.reason);
            console.log('\nFULL ERROR:\n', e, '\n')

            run();
        }
    );
} else {
    run();
}


async function run(db?:any) { 
    app.use(cors()); // how to allow data to only intended website without cors

    // Set Websocket Server
    let protocol = settings.protocol;
    const port = process.env.PORT || `${settings.port}`;


    // const config = {port, protocol, credentials};
    // const server = new WebsocketServer(app, config);

    const server = http.createServer(app);
    const router = new Router(
        // {debug:true}
    );

    let httpService = new HTTPService(router);
    router.load(httpService, 'http');

    app.post('**', httpService.controller);
    app.get('**', httpService.controller);
    app.delete('**', httpService.controller);

    let websocketService = new WebsocketService(router, server);
    router.load(websocketService, 'websockets'); // must match client name

    let databaseService;

    if(db) {
        databaseService = new StructService(router, { mode: "mongodb", db }, settings.debug);
        router.load(databaseService, 'structs');
    } else {
        databaseService = new StructService(router, { mode: "local" }, settings.debug);
        router.load(databaseService, 'structs');
    }
    
    



    // Start Server
    server.listen(parseInt(port), () => {
        console.log(`Brainsatplay server created at ${protocol}://${settings.host}:${port}`);
    });
  

    // handle profile requests
    // router.post("/profile", require("./controllers/profile").profile);
    
    
    // handle fitbit requests
    // const fitbitController = require("./controllers/fitbit");
    // router.post("/fitbit", fitbitController.fitbit);

    // app.use("/", initRoutes(router));
}
