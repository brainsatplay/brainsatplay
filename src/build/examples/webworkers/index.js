
import worker from './worker.js'

window.w = new Worker(worker);

console.log(window.w);