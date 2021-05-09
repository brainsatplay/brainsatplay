# Add Device Support

This tutorial will get you started adding device support to Brains@Play! 

## Creating a Device Plugin
---

You can find all driver plugins created for Brains@Play in the `library/src/devices` directory. To create a new device plugin, copy the devicePluginTemplate and rename it. 

### init()
In the `init()` function, set info.sps and info.deviceType to the correct specifications. 

> **Muse Plugin:** Here we added specifications for what channels correspond to what tags—plus additional  biquad filters to filter raw data automatically. 

> **FreeEEG / Cyton Plugin:** Here you will see how we handled setting up USB with custom data stream drivers found within those folders. Then we set it up to pipe data into our DataAtlas system which will handle the rest for the front end.

### connect()
Customize the `connect()` function to run the connection protocol for your selected device. Leave the onconnect and setIndicator functions alone, the onconnect is customized externally to link in with the rest of the frontend.

### disconnect()
Do the same for the `disconnect()` function. Be sure to add any exception handling you may need for connection errors.

### addControls()
The last function you may want to customize is addControls(), like in the case of the HEGduino which can be turned on or off or switched into different streaming modes via commands. 

<div class="brainsatplay-tutorial-subheader">
<p>Part Two</p>
<h2>Adding Session Support</h2>
</div>

Now to add support to the Session frontend, open Session.js and find the deviceStream class. Add your device name and plugin class (be sure import it) to the this.deviceConfigs array. Then go up to makeConnectOptions and add specification for the new device in the deviceOptions array with the list of device names, and then add the connect response to the `brainsatplay-${o}`.onclick function just below. You will notice that the devices here have arrays specifying things like 'eegfft' or 'eegcoherence', these are additional postprocessing algorithms you can add which will run in a separate loop and utilize our web workers. Leave the array empty for no additional processing. We are still adding more supported algorithms and optimizing what we do have so we can create a robust and automated data processing system.

> **A Note on Web Workers:**  If you want to add new analysis functions that require intensive computations, they need to be offloaded to workers. You will find eeg.worker.js in library/src/algorithms. Within this you will see a switch case list that calls different functions then reports them back generically in an object. 

Now you need to add an analyzer function to the analysis loop in DataAtlas.js. You can do this by calling addAnalyzerFunc(name,function=()=>{}) after setting the atlas within the device plugin init() function. Alternatively you can add the functions to DataAtlas.addDefaultAnalyzerFuncs() by following the format there. These will be called every frame. For worker functions they stagger so as to not send a new worker command until the previous has returned, so intensive processes can complete and not overwhelm slower computers. 

To add worker responses you can add more if statements in DataAtlas.workeronmessage() to process different messages form the worker. Less intuitively you can push functions to the workerResponses array (seen in the constructor of DataAtlas) and parse the responses according to the result in msg.foo and if the msg.origin matches, which requires a bit more internal knowledge of the framework.

## Novel Device Support
---

Brains@Play currently supports EEG and HEG hardware—as well as basic eye tracking. For new and novel devices, there may be additional functionality to add to the DataAtlas so you can store and parse that data correctly. 

We suggest that you study the available plugins. As long as you match those templates as closely as possible, you will be fine. For specific questions about your own hardware, feel free to reach out to [contact@brainsatplay.com](mailto:contact@brainsatplay.com) for support.

