import { Service, Routes, ServiceMessage } from "../Service";

//Contains evals and other things you probably don't want wide open on an API
export class UnsafeService extends Service {
    
    name='worker'
    
    routes:Routes={}

    constructor(routes?:Routes) {
        super(routes);
    }


    transmit = (message:any|ServiceMessage) => {

    }

    receive = () => {

    }
}