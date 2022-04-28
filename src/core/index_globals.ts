//we can't circularly export a namespace for index.ts so this is the intermediary
//import * as bundle from './x' then set INSTALL_GLOBALS[key] = bundle; The only other option is dynamic importing or a bigger bundler with more of these features built in

export * from './index' //still works in esm

//this takes all of the re-exported modules in index.ts and contains them in an object
import * as bundle1 from './index'

//webpack? i.e. set the bundled index.ts modules to be globally available? 
// You can set many modules and assign more functions etc. to the same globals without error
const INSTALL_GLOBALS = { //install bundles as global variables?
    //globalThis key : imported module (or import * as)
    brainsatplay: bundle1
};

//globals are not declared by default in browser scripts, these files are function scopes!
for(const prop in INSTALL_GLOBALS) {
    if(typeof globalThis[prop] !== 'undefined') Object.assign(globalThis[prop],INSTALL_GLOBALS[prop]);
    else globalThis[prop] = INSTALL_GLOBALS[prop];
}

