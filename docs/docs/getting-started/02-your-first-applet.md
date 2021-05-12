---
sidebar_position: 2
---

# Your First Applet

Now that you've set up a local version of The Brains@Play Platform, this tutorial will guide you through the creation of an applet using brainsatplay.js.

## Create your Applet
---

### Copy the Template
First, copy the Applet Template folder (`src/applets/Templates/app`) into the relevant category folder of the `src/applets` directory. 

Rename the template according to the details of your applet. It should look something like this:
```
myapplet
    settings.js
    MyApplet.js
```

### Edit Applet Metadata
Information contained in `settings.js` is used to populate an Applet Manifest used to quickly reference information about applets on The Brains@Play Platform.  Specify a name (and other metadata) for your applet here!

```js

// import featureImg from './feature.png'

export const settings = {
    "name": "My First Applet", // The name of your applet
    "devices": ["EEG","HEG"], // Compatible devices for your applet
    "author": "Me", // The author of your applet
    "description": "This is my first applet.", // A short description of your applet
    "categories": ["train"], // Category tags for your applet
    "module": "Applet", // The module name for your applet (must match the Applet.js file name)
    // "image":  featureImg,
	"instructions":"Coming soon..." // Extended instructions on how to use your applet
}

```

To specify a custom thumbnail image, place your image within your applet's directory and edit the commented code in `settings.js` to point to it. When left unspecified, this will default to a placeholder thumbnail.

### Test Applet Configuration
Restart your development environment using `npm start`. If everything is shipshape, your applet will appear in the Applet Browser! 

If you enter your applet from the Applet Browser, a URL fragment (e.g. `https://localhost:1234/#My%20First%20Applet` will appear in the address bar to ensure that you return to your applet when refreshing the page.

## Review Applet Methods
---

Each applet is self-contained and, therefore, all applet logic should be written internally to the class. 

### constructor()
On initialization, applets are passed a [**Session**](../reference/classes/session) that contains all information about device streams and references a **Data Atlas** where all current user data is stored.

``` javascript
import {Session} from './../../../../library/src/Session'
import {DOMFragment} from './../../../../library/src/ui/DOMFragment'
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class Applet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };
    }
}
```

### init()
The `init()` function contains an HMTLtemplate string, a `setupHTML()` function, and any other logic and functions to handle your rendering and logic in your applet. 

``` javascript
//Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
init() {
    //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
    let HTMLtemplate = (props=this.props) => { 
        return `<div id='${props.id}' style='height:100%; width:100%;'></div>`;
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
```

### deinit()
The `deinit()` function should destroy animation loops, delete event listeners, and remove extraneous HTML elements from the document. It is called whenever the applet is removed from our **Applet Manager** in the Brains@Play Platform.

``` javascript
//Delete all event listeners and loops here and delete the HTML block
deinit() {
    this.AppletHTML.deleteNode();
    //Be sure to unsubscribe from state if using it and remove any extra event listeners
}
```


### responsive()
The `responsive()` function is called when your applet is resized *and* when new devices are connected. It should handle any window resizing logic—as well as spawning HTML elements (e.g. selectors, buttons, etc.) depending on device connections.

``` javascript
//Responsive UI update, for resizing and responding to new connections detected by the UI manager
responsive() {
    //let canvas = document.getElementById(this.props.id+"canvas");
    //canvas.width = this.AppletHTML.node.clientWidth;
    //canvas.height = this.AppletHTML.node.clientHeight;
}
```

### configure()
The `configure()` function is called on initialization if you have multiple specifications available for your applet. 

``` javascript
configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
    settings.forEach((cmd,i) => {
        //if(cmd === 'x'){//doSomething;}
    });
}
```

In our **Applet Manager**, URL fragments (e.g. `https://localhost:1234/#{"name":"My Applet","settings":["EEG"]}`) will spawn the named applet and pass the array of arguments from the settings property. This allows you to customize which state your applet initializes in. 

## Incorporate Biosignals
Now that you understand how an applet is organized, it's time to use brain data from the **Data Atlas** of the [**Session**](../reference/classes/session). Here we'll set up our applet to display the current *frontal alpha coherence*.

``` javascript
init() {

    let HTMLtemplate = (props=this.props) => { 
        return `
            <div id='${props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                <div>
                    <h1>Frontal Alpha Coherence</h1>
                    <p id="${props.id}-coherence"></p>
                </div>
            </div>
        `;
    }

    // ...

    let animate = () => {

        // Get Frontal Alpha Coherence
        let coherence = this.session.atlas.getCoherenceScore(this.session.atlas.getFrontalCoherenceData(),'alpha1')

        // Display Alpha Coherence
        document.getElementById(`${this.props.id}-coherence`).innerHTML = coherence

        // Continue Animation
        setTimeout(this.animation = window.requestAnimationFrame(animate),1000/60) // Limit framerate to 60fps
    }

    // Start Animation
    animate()

}
```

Don't forget to clean up after yourself!
``` javascript
deinit() {

    // Stop Animation
    if (this.animation){
        window.cancelAnimationFrame(this.animation)
        this.animation = undefined  
    }

    // Delete Applet HTML
    this.AppletHTML.deleteNode();
}
```

After adding this code, your applet should look like this:

![Applet UI](../../static/img/02-your-first-applet/ui.png)

## Test Out your Hard Work
After everything is wired up, head over to your applet and activate the **Synthetic Stream** from the Device Manager. 

![Applet Readout](../../static/img/02-your-first-applet/devices.png)

This should begin updating the real-time readout on your applet.

![Applet Readout](../../static/img/02-your-first-applet/readout.png)


## Conclusion
Congratulations on creating your first application with Brains@Play! Of course, there's much more that can be done with our framework—but we hope this has inspired you to dive deeper into the growing field of neurotechnology and begin developing fully-featured applications. 

To get the specific data required by your application, head over to the [**Reference**](../reference) page of our documentation. We're so excited to experience what you dream up!
