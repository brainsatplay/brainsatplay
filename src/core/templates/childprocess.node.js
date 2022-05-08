import { Graph } from '../dist/index.esm.js';
import {fork, spawn} from 'child_process'
//nodejs-only graph node


//this node runs child processes and returns the logs on the operator. e.g. print('hello world') in python will return the result in node.

// type ChildProcessProperties = {
//     command: string,
//     args?: string[],
//     options?: {[key:string]:any},
//     onerror?:(error)=>{}
//     onclose?:(code)=>{}
// } & GraphProperties

//instance of child_process
export class ChildProcess extends Graph {

    PROCESS;
    CONTROLLER = new AbortController();
    dir=process.cwd();

    constructor(
        properties={command:'echo', 
        args:['Echoed Hello World!'],  
        options:{shell: true, stdio: 'inherit'}}, //these will emit logs to the shell, echo errors without it
        parentNode,
        graph
    ) {
        super(properties,parentNode,graph);

        if(!properties.command) {
            console.error('no commands provided to Child Process node!');
            return;
        }

        if(!properties.operator) {
            this.operator = (self=this,origin=this, ...args) => {
                console.log('Child process "',this.command,this.args.join(' '),'" returned: ', args.toString());
                return args;
            }
        }

        const {signal} = this.CONTROLLER;

        if(!properties.options) properties.options = {signal, env:process.env, cwd:this.dir};
        else properties.options = Object.assign({signal, env:process.env, cwd:this.dir},properties.options);

        if(properties.command.includes('.js')) {
            this.PROCESS = fork(properties.command,properties.args,properties.options); //contains .send()
        }
        else this.PROCESS = spawn(properties.command,properties.args,properties.options);

        if(this.PROCESS.stdout) this.PROCESS.stdout.on('data', (data) => {
            this.run(data); //execute this node with the outputted data from the process
        });

        if(this.PROCESS.stderr) this.PROCESS.stderr.on('data', (error) => {
            console.error('stderr from',this.PROCESS,error);
        });

        this.PROCESS.on('error', (error) => {
            console.error('child process error ', error);
        });

        if(properties.onerror) this.process.stder.on('data',properties.onerror);

        if(properties.onclose) this.process.on('close',properties.onclose);



    }

    message(data) { //send data to node processes with IPC channels 
            if(this.options.cmd === 'node') {
                this.PROCESS.send(data);
            }
    }

    //kill the child process
    abort() {
        this.CONTROLLER.abort();
        this.state.setState({[this.tag]:'closed'});
    }

    

}


