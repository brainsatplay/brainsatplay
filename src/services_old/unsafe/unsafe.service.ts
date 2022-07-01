import { parseFunctionFromText } from "../../common/parse.utils";
import { Service } from "../../core_old/Service";

// Garrett Flynn and Joshua Brewster, AGPL v3.0
class UnsafeService extends Service {
    name = 'unsafe'
    routes = [
        { //add a local function, can implement whole algorithm pipelines on-the-fly
          route: 'createRoute', post: async (self,graphOrigin,router,origin,...args) => { //arg0 = name, arg1 = function string (arrow or normal)

            // let newFunc = (typeof args[1] === 'string') ? parseFunctionFromText(args[1]) : args[1]
  
            // let newCallback = args[0]
            router.addRoute(args[0]) // 
            return true;
          }
        },
        {
          route:'runfunc', //pass a stringified function, parse, and run it. Use second argument for the function argument array. Good for testing
          post:(self,graphOrigin,router,origin,...args)=>{
              if(args[0] && args[1]) {
                  let func = parseFunctionFromText(args[0]);
                  try{
                      let result = func(router,args[1],origin);
                      return result;
                  } catch(err) {return err;}          
              }
          }
        },
        { //set locally accessible values, just make sure not to overwrite the defaults in the callbackManager
          route: 'setValues', post: (self,graphOrigin,router,origin,...args) => {
            if (typeof args === 'object') {
              Object.keys(args).forEach((key) => {
                router[key] = args[key]; //variables will be accessible in functions as this.x or this['x']
              });
              return true;
            } else return false;
          }
        },
        { //append array values
          route: 'appendValues', post: (self,graphOrigin,router,origin,...args) => {
            if (typeof args === 'object') {
              Object.keys(args).forEach((key) => {
                if(!router[key]) router[key] = args[key];
                else if (Array.isArray(args[key])) router[key].push(args[key]); //variables will be accessible in functions as this.x or this['x']
                else router[key] = args[key];
              });
              return true;
            } else return false;
          }
        },
        { //for use with transfers
          route: 'setValuesFromArrayBuffers', post: (self,graphOrigin,router,origin,...args) => {
            if (typeof args === 'object') {
              Object.keys(args).forEach((key) => { 
                if(args[key].__proto__.__proto__.constructor.name === 'TypedArray') router[key] = Array.from(args[key]);
                else router[key] = args[key];
              });
              return true;
            } else return false;
          }
        },
        { //for use with transfers
          route: 'appendValuesFromArrayBuffers', post: (self,graphOrigin,router,origin,...args) => {
            if (typeof args === 'object') {
              Object.keys(args).forEach((key) => {
                if(!router[key] && args[key].__proto__.__proto__.constructor.name === 'TypedArray') router[key] = Array.from(args[key]);
                else if(!router[key]) router[key] = args[key];
                else if(args[key].__proto__.__proto__.constructor.name === 'TypedArray') router[key].push(Array.from(args[key]));
                else if(Array.isArray(args[key])) router[key].push(args[key]); //variables will be accessible in functions as this.x or this['x']
                else router[key] = args[key];
              });
              return true;
            } else return false;
          }
        },
        { //parses a stringified class prototype (class x{}.toString()) containing function methods for use on the worker
          route: 'transferClassObject', post: (self,graphOrigin,router,origin,...args) => {
            if (typeof args === 'object') {
              Object.keys(args).forEach((key) => {
                if(typeof args[key] === 'string') {
                  let obj = args[key];
                  if(args[key].indexOf('class') === 0) obj = eval('('+args[key]+')');
                  router[key] = obj; //variables will be accessible in functions as this.x or this['x']
                  //console.log(self,key,obj);
                  if (router.threeUtil) router.threeUtil[key] = obj;
                }
              });
              return true;
            } else return false;
          }
        }
        ]

    constructor(router){
        super(router)
    }

}

export default UnsafeService