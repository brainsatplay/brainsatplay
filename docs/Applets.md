## Applets

The Brains@Play platform uses a simple template system to create and render/destroy applets. This is used by our applet management system to organize apps, but the apps also can be run standalone using only the internal functions for the Applet and our simple built in fragment rendering system. 

To create a new applet, from src/js/applets/Templates make a copy of the Applet folder. Now give the AppletTemplate.js a unique name and make the class name inside the file match. Adjust the settings file to have the correct information as well.

To add this new applet to the manager, open up src/js/applets/appletList.js and fill out a new row in the AppletInfo object array with your new applet information, like this ` 'Applet Name':{folderURL:'./Templates/Applet', devices:['eeg','heg'], categories:['data']  }  ` with the correct name, folder URL, and matching device and category specification. This is our quick lookup table for dynamically loading scripts.

Now, to customize the Applets, all you need to do is go into the init() function in the template and modify the HTMLtemplate string, the setupHTML function, and add any other logic and functions you may need to handle rendering and app logic. Each applet is passed a Brains@Play Session which will contain all information about device streams and reference the data atlasses where all current user data is stored. Look through the many example applets we provided for diverse use cases.

Call any necessary cleanup functions in deinit() (i.e. destroying any animation loops or event listeners). 

We base our rendering off of a custom [DOMFragment](https://github.com/moothyknight/JS_UI_Utils) and optional state management system for speed but this is optional as long as you provide the correct cleanup calls in your deinit() function to remove any extraneous HTML.

The responsive() function is called to resize the applet and also fires when a new device is connected, so place any window resizing logic in here. 

The configure() function is called on initialization if you have multiple specifications available for your applet. In the manager, if you add a hash to the address bar like `#{"name":"uPlot","settings":["Coherence"]}` this will spawn the selected applet and pass the array of arguments from teh settings property. For uPlot you can customize which graph shows up first. Alternatively you can use `#uPlot` to get the default applet.

All new logic you add is to be written internally to the class with new functions so it's all self contained.
