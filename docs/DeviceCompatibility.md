## Device Compatibility

Here we'll show you how to add new device support to our system. This will let you stream data to our software as well as set up any preprocessing functions and any additional remote streaming functions you may want to add. We simplified this as much as possible with some templating systems though there are a few specifics you have to worry about.

In library/src/devices you will find the driver plugins we've created for the platform. Some of them are in their own folders with their additional dependencies. We simply use whatever is available in javascript to connect with brand name devices, it's also fairly simple to write your own Serial USB or Bluetooth protocols using Javascript's frameworks to accept arbitrary data streams then format it into our system. We wrote everything to be fully generalizable for any type of hardware, then it can simple feed into our data and streaming system for rapid content creation.

To create a new device plugin, copy the devicePluginTemplate and rename it. 

In the init() function, set info.sps and info.deviceType to the correct specifications. If you check out musePlugin.js you will see we added specifications for what channels correspond to what tags, plus additional biquad filters to filter raw data automatically. If you check the FreeEEG32 or Cyton plugin you will see how we handled setting up USB with custom data stream drivers found within those folders. Then we set it up to pipe data into our DataAtlas system which will handle the rest for the front end.

Customize the connect() function to run the connection protocol for your selected device. Leave the onconnect and setIndicator functions alone, the onconnect is customized externally to link in with the rest of the frontend.

Do the same for the disconnect() function. Be sure to add any exception handling you may need for connection errors.

The last function you may want to customize is addControls(), like in the case of the HEGduino which can be turned on or off or switched into different streaming modes via commands. 

### Wiring up Frontend Support

Now to add support to the Session frontend, open Session.js and find the deviceStream class. Add your device name and plugin class (be sure import it) to the this.deviceConfigs array. Then go up to makeConnectOptions and add specification for the new device in the deviceOptions array with the list of device names, and then add the connect response to the `brainsatplay-${o}`.onclick function just below. You will notice that the devices here have arrays specifying things like 'eegfft' or 'eegcoherence', these are additional postprocessing algorithms you can add which will run in a separate loop and utilize our web workers. Leave the array empty for no additional processing. We are still adding more supported algorithms and optimizing what we do have so we can create a robust and automated data processing system.

If you want to add new analysis functions that require intensive computations, they need to be offloaded to workers. You will find eeg.worker.js in library/src/algorithms. Within this you will see a switch case list that calls different functions then reports them back generically in an object. 

Now you need to add an analyzer function to the analysis loop in DataAtlas.js. You can do this by calling addAnalyzerFunc(name,function=()=>{}) after setting the atlas within the device plugin init() function. Alternatively you can add the functions to DataAtlas.addDefaultAnalyzerFuncs() by following the format there. These will be called every frame. For worker functions they stagger so as to not send a new worker command until the previous has returned, so intensive processes can complete and not overwhelm slower computers. 

To add worker responses you can add more if statements in DataAtlas.workeronmessage() to process different messages form the worker. Less intuitively you can push functions to the workerResponses array (seen in the constructor of DataAtlas) and parse the responses according to the result in msg.foo and if the msg.origin matches, which requires a bit more internal knowledge of the framework.

## Additional

For the rest of your questions I would study the available plugins first, as long as you match those templates as closely as possible you will be fine. For new and novel devices there may be additional functionality to add to the DataAtlas so you can store and parse that data correctly. We currently have fleshed everything out for EEG and HEG, as well as basic eye tracking, but there are no limits here.

