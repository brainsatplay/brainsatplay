## Applets
The applet system here is just a simple way to make sure that modular content gets nested correctly in the app with everything else. As long as you maintain the basic format in the template, you can write any kind of javascript you want otherwise and involve any packages you want. There are some useful tools in the dom fragment system and state manager for you to take advantage of too, to ensure performant rendering.

Check out AppletTemplate.js in the src/frontend/applets folder. You'll see a bunch of mostly empty functions and a constructor. In order to create applets, you need to copy and paste this template to a new file and then fill out all of the functions. You can try to extend the class too but I find that to be more mental work than it should be. 

```
import {DOMFragment} from '../utils/DOMFragment'

//Example Applet for integrating with the UI Manager
export class AppletExample {
    constructor(
        parent=document.body,
        bci=undefined,
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.bci = bci; //Reference to the brainsatplay session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        //etc..

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `<div id=`+props.id+`></div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            document.getElementById(props.id);
        }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.


        //Add whatever else you need to initialize
    
    }

    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    onresize() {
        //let canvas = document.getElementById(this.props.id+"canvas");
        //canvas.width = this.AppletHTML.node.clientWidth;
        //canvas.height = this.AppletHTML.node.clientHeight;
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 
```


The most important function to make something happen on screen is the HTMLtemplate, then use the setupHTML function to attach functions to buttons etc. Leave the random id generator alone, also, or make sure you use something just as random, as that lets you add a randomized id to all of your named html elements so they don't accidentally overlap with others. Leave the DOMFragment call alone in the init() function but feel free to add anything below it as that is important for the UI Manager, same with the deInit() function. Basically if it's predefined leave it, I may expand on the defaults more later too but without breaking any prior work as the system as-is works fine by me.

See how this all works in the other examples, the simplest being AppletExample.js. You can use State.subscribe('propname',onchange) to get updates from the app, then pull data from the EEG or ATLAS objects accordingly. Feel free to add any state variables you want or make entirely new state managers as needed. I tried to make this the most straightforward possible way to make content as part of a system with a bunch of moving parts to it, and without any annoying API choices with a ton of useless extra syntax to learn getting in the way. I am just a pure JS type of dude and these solutions can be faster and more elegant as long as you respect the fragments and general optimization rules.

The configure() function is used if you instantiate the applet from a hashtag on the address bar (or if you want to customize a link/shortcut). If your applet has multiple view options etc you can have it be configurable. This will work with a config autosave system being implemented here (probably already done before anyone reads this file) so that when you restart the app, the applets can be reconfigured from file exactly how you want them.

When you want to test your applet, right now you add it to app.js by including it from the file then adding an object to 
State.data.appletClasses.push( just under all of the includes. Format the object just like the other ones there with a name for the applet and the class reference then it should appear and get run through the UI manager.

--

Let me know if that's too confusing, there are a ton of examples. I tried to boil React and other systems down to nothing and get rid of any fluff regarding the state systems and the special syntax you have to apply to everything. Even lit html irritated me because there were a couple things that for some reason were made more difficult than vanillaJS, which in my mind totally kills the purpose, but I am not an erudite coder and just want to get straight to the point with snappy html for visualizing my scripts. You'll notice that literally everything is rendered from javascript in this app so it's all done with the fragment system.
