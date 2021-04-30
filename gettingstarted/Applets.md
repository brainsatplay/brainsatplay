# Creating an Applet

This tutorial will get you started building your first modular applet with Brains@Play! 

While the following steps will show you how to set up your applet for deployment on the Brains@Play Platform, all applets built in this way can also run standalone using only the internal functions and built-in fragment rendering system in our Applet Template. 

<div class="brainsatplay-tutorial-subheader">
<p>Part One</p>
<h2>Applet Setup</h2>
</div>

### Copy the Template
First, copy the Applet Template folder located at `src/js/applets/Templates`.

Place this template folder under `src/js/applets/General`. In the future, you may place your applet anywhere under the `src/js/applets` folder. 

Rename the AppletTemplate.js to the name of your app. It should look something like this:
```
MyApplet
    settings.js
    MyApplet.js
```

### Edit Applet Metadata
Give your applet a name by editing the settings object in the `settings.js` file. This information edits what appears on the thumbnail.

To add an image, place an image under `/src/assets/features` and edit the top import line at the top of the file to point to the correct location:


```js
export const settings = {
    "name": "My Applet",
    "devices": ["eeg","heg"],
    "description": "This is my applet.",
    "categories": ["train"],
    "module": "MyApplet",
    "image": featureImg
}
```

### Add to Applet Manager
Now we need to add the app to our Applet Manager. Open `/src/js/applets/appletList.js` and add your app to the end of the `AppletInfo` object

```js
export const AppletInfo = {
    'Applet Browser': { folderUrl:'./UI/browser',       devices:['eeg','heg'],     categories:['UI']},
    'Randomizer': { folderUrl:'./UI/randomizer',        devices:['eeg','heg'],     categories:['UI']},
    'uPlot': { folderUrl:'./General/uplot',             devices:['eeg','heg'],     categories:['data']},
    'Spectrogram': { folderUrl:'./EEG/spectrogram',     devices:['eeg'],           categories:['data']},
    'Brain Map': { folderUrl:'./EEG/brainmap',          devices:['eeg'],           categories:['data']},
    'Smoothie': { folderUrl:'./EEG/smoothie',           devices:['eeg'],           categories:['data']},
    'Nexus': { folderUrl:'./General/threejs/nexus',     devices:['eeg'],           categories:['multiplayer','feedback']},
    ///  Truncated  ...
    'Blob': { folderUrl:'./General/threejs/blob',       devices:['eeg','heg'],           categories:
    'Text Scroller': { folderUrl:'./HEG/textscroller',  devices:['heg'],           categories:['feedback'] },
    'Sunrise': { folderUrl:'./General/threejs/ThreeSunrise', devices:['heg'],      categories:['feedback'] },
    'Pulse Monitor': { folderUrl:'./HEG/pulsemonitor',  devices:['heg'],           categories:['data'] },
    'Youtube': { folderUrl:'./General/ytube',           devices:['eeg','heg'],     categories:['feedback'] },
    'Multiplayer Example': { folderUrl:'./Templates/Multiplayer', devices:['eeg','heg'], categories:['multiplayer','feedback'] },
    'TestApp': { folderUrl:'./General/TestApp', devices:['eeg','heg'], categories:['feedback'] },

};
```

This is our quick lookup table for dynamically loading scripts.

### Test Applet Configuration
Run your development environment using `npm start`. If everything is shipshape, your applet will appear in the Applet Browser! 

If you enter your applet from the Applet Browser, a URL fragment (e.g. `https://localhost:1234/#My%20Applet` will appear in the address bar to ensure that you return to your applet when refreshing the page.

<div class="brainsatplay-tutorial-subheader">
<p>Part Two</p>
<h2>Writing an Applet</h2>
</div>

Each applet is self-contained and, therefore, all applet logic should be written internally to the class. 

### constructor()
On initialization, applets are passed a Brains@Play Session that contains all information about device streams and references **Data Atlases** where all current user data is stored.

### init()
The `init()` function contains an HMTLtemplate string, a `setupHTML()` function, and any other logic and functions to handle your rendering and logic in your applet. 

### deinit()
The `deinit()` function should destroy animation loops, delete event listeners, and remove extraneous HTML elements from the document. It is called whenever the applet is removed from our **Applet Manager** in the Brains@Play Platform.

### responsive()
The `responsive()` function is called when your applet is resized *and* when new devices are connected. It should handle any window resizing logic—as well as spawning HTML elements (e.g. selectors, buttons, etc.) depending on device connections.

### configure()
The `configure()` function is called on initialization if you have multiple specifications available for your applet. 

In our **Applet Manager**, URL fragments (e.g. `https://localhost:1234/#{"name":"Applet Template","settings":["EEG"]}`) will spawn the named applet and pass the array of arguments from the settings property. This allows you to customize which state your applet initializes in. 