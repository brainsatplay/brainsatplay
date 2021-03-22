# BCIAppManager.js

This is an all in one manager for nesting multiple apps together and initializing a BrowserFS system around the app. This will create main menus and other navigation/device connection tools automatically, and allow selecting from all enabled applets to display multiple on screen. It uses UIManager.js to run the template functions and handle automatic init/deinit/resizing for applets to fit in the window alongside other applets. 

To create a manager in your app it's this simple:

```
import {brainsatplay} from './js/brainsatplayv2'
import {BCIAppManager} from './js/frontend/BCIAppManager'
import {AppletExample} from './js/frontend/applets/AppletExample'

let bcisession = new brainsatplay('guest');

let applets = [
     {name:"Example Applet", cls:AppletExample}
];

let mgr = new BCIAppManager(bcisession,applets,undefined,false);

mgr.initUIManager();


```