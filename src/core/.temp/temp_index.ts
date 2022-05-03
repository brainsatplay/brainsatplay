
    
          //we can't circularly export a namespace for index.ts so this is the intermediary
          //import * as bundle from './x' then set globalThis[key] = bundle; The only other option is dynamic importing or a bigger bundler with more of these features built in
          
          export * from '../index' //still works in esm, getting out of .temp
          
          //this takes all of the re-exported modules in index.ts and contains them in an object
          import * as bundle from '../index' // getting out of .temp
          
          //webpack? i.e. set the bundled index.ts modules to be globally available? 
          // You can set many modules and assign more functions etc. to the same globals without error
          
          //globals are not declared by default in browser scripts, these files are function scopes!
    
        
             
              if(typeof globalThis['brainsatplay'] !== 'undefined') Object.assign(globalThis['brainsatplay'],bundle); //we can keep assigning the same namespaces more module objects without error!
              else globalThis['brainsatplay'] = bundle;
            