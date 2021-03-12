## Front end
The frontend ties together several simplified systems after beating my head against a ton of different frameworks from React to Nativescript to lit-html, and so on. I always ended up coming back to the same basic fragments in vanilla JS and then using the standard document functions because I could do everything so much quicker - ironic considering everything is made for productivity but maybe I'm just in a niche here with my needs. My system ends up seriously benchmarking javascript, however. Plus Dovydas (@Giveback007) showed me some great tricks with his state manager but I wanted to simplify it to basic js. Full documentation pending but the code is written to be plainly readable so check it out.

In order of abstraction:

##### ObjectListener.js: 
Custom object listener lets you watch most kinds of data you might put into an object, including other objects and functions. Listener loops can be created for specified objects and optionally specific properties, and set to have either a framerate interval or set millisecond intervals for checking if a specific property or anything in the entire object was changed. 

It catches most circular references (mainly if you have DOM objects referenced in the object) but can crash if there are a ton of them. Object listeners are optimized so you can add multiple function responses to a single listener, meaning multiple functions across an app can be called simultaneously when a change is detected. 

##### StateManager.js: 
A simple homebrew state manager with arbitrary event listeners allowing you to subscribe or unsubscribe to state variables and have functions fire off accordingly as variables change. 

This basically just wraps the ObjectListener.js with some functions to make it easier to create keys and responses for your state object. You can set what interval the state system updates. It's purely optional to use but I use it to organize the app and make it easy to know when new data has been read into the system. 

This is then instantiated in State.js where the initial settings for the app are created and then are referenceable and subscribable from anywhere in the app. I use this to know when to save, when to update visuals, when to push FFTs, etc, which happens across many files. This isn't the only state object in the app if you count the EEG and ATLAS instances which store data across the app.

##### DOMFragment.js: 
There is a custom document fragment rendering system with vanilla JS templating. UITemplates.js contains a bunch of examples of how the templates work. So you can create your template strings and have properties rendered from a props object in the render settings (read the code for now), and even set an interval to have the object re-render using an ObjectListener instance if any props are changed. 

Because templates render from strings, you need to set up your onclick functions etc after rendering the fragment, which you can take care of by setting an onRender function and targeting simply with document.getElementById() or similar. You can also add an onchange callback (again use arrow functions) if you want something to happen if the fragment gets updated (not counting the initial render). 

If you only are changing one or a few things in a large fragment it is faster to manipulate the elements directly using document.getElementById() than update the whole fragment, where you should just leave the update interval as NEVER as I do throughout this app on all of my applets which have quite a bit of independent stuff going on in them.

##### EEGInterface.js: 
This is where all of the cross communication is set up between the data streaming class from eeg32.js (which has functions for the Serial API and stores a raw data buffer), the atlas class from eeg32.js used for more intuitively organizing data (it's not perfect but stays out of the way), and the web worker in eegworker.js (instantiated in the index.html file) that handles signal analysis. 

So most of the EEG data organizing happens here for the front end. There are also some EEG-related UI functions for generating menu settings (e.g. channel options and tagging which channels you want to watch and associated with what sites for mapping), and processing all of these data structures into CSV data.

##### UIManager.js: 
This is just a hack I put together to manage the applets. It sets up and resizes the applets for you according to the set functions in the applet templates. It's important to keep that format to make the applets load into the UI correctly, which is covered in applets.md better.




### Also the file system

This is a work in progress. I am using IndexedDB via BrowserFS, which is just a nice fs wrapper for a bunch of file systems that have their own syntaxes. IndexedDB allows for arbitrary cache sizes and I can parse directly to a CSV file from there or performantly scroll cached datasets thanks to the big data developers behind it. BrowserFS is not well documented and has some mysteries as to how to use it across the app, so right now it's all in app.js and wraps the UI initialization in a semi-messy way. 
