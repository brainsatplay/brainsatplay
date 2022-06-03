import { Service, Routes, ServiceMessage } from "../Service";


export class WebRTCbackend extends Service {

    name='webrtc'

    routes:Routes={}

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }


    transmit = (message:any|ServiceMessage) => {

    }

    receive = () => {

    }
}