# Creating an Applet, Part 1

These steps will get you started building your first modular applet for the Brain@Play Platform

### Copy the template
First, copy the Apple template folder located at `src/js/applets/Templates`
Place this template folder under `src/js/applets/General`. In the future, you may place your applet anywhere under the `src/js/applets` folder.

Rename the AppletTemplate.js to the name of your app.

It should look something like this
```
TestApp
    settings.js
    TestApp.js
```

### Edit the App's metadata in `settings.js`
Give your app a name by editing the settings object in the `settings.js` file. This information edits what appears on the thumbnail.

To add an image, place an image under `/src/assets/features` and edit the top import line at the top of the file to point to the correct location


```js
export const settings = {
    "name": "Example",
    "devices": ["eeg","heg"],
    "description": "Example",
    "categories": ["feedback"],
    "module": "AppletTemplate",
    "image": featureImg
}
```

### Add the applet to the AppletManager
Now we need to add the app to the Applet Manager. Open `/src/js/applets/appletList.js` and add your app to the end of the `AppletInfo` object

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
### Now test!
Run your development environment, and if everything is shipshape, your app will appear!

Stay tuned for Part 2