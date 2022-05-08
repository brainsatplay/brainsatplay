//run this script: 'node testchildprocess.js'


import { ChildProcess } from "./childprocess.node.js";

//run python script
let pyNode = new ChildProcess(
    {
        command:'python',args:['test.py']
    }
)

//print text file contents
let textNode = new ChildProcess(
    {
        command:'more', args:['test.txt']
    }
)


let echoNode = new ChildProcess(); //run the default function