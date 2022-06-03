import { Service, Routes, ServiceMessage } from "../Service";

//this spawns the workers
export class WorkerService extends Service {
    
    name='worker'
    
    routes:Routes={}

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }


    transmit = (message:any|ServiceMessage) => {

    }

    receive = () => {

    }
}