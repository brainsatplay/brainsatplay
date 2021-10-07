// const WebSocket = require('ws'); 

export class CortexAdapter {
    constructor(clientId='LrJ04MX7khH8MlWc5DQCSlxDdzc81oudV6hEAVcW', clientSecret='aT4srOFNPKUSEJBeitSJETSuTZ0tpZ6j1FVqipqLGwMDXgRviUzFcpwrCQ8B8as5YeKWtBIK1MNe7ucJ2uvkSs37YI2ZLUUD1eOzZb3XH1YbdH1WYDfPkP2SbKu7s8jy'){
        // if (process) process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

        // Properties 
        this.socketUrl = 'wss://localhost:6868'; // The Cortex web server URL
        this.clientId = clientId ; // Client id - you will need to register an app with Emotiv to get this 
        this.clientSecret = clientSecret; // Client secret - you will need to register an app with Emotiv to get this
        this.isLoggedIn = false;
        this.accessGranted = false; 
        this.cortexToken; 
        this.availableHeadsets; 
        this.headsetId; 
        this.connectMsg; 
        this.connectedHeadsets = [];
        this.sessionId = null;
        this.streams; 
        this.subscribed = [];
        this.profileName = null; 
        this.trainStatus; 

        // Upon instantiation, we want to create our connection to the web server
        this.socket = new WebSocket(this.socketUrl);
        console.log('[Main message] Connecting to Cortex Web Socket...'); 


        // Message IDs
        this.checkUserLoginID = 1; 
        this.requestAccessID = 2;
        this.authorizeID = 3; 
        this.queryHeadsetID = 4; 
        this.controlDeviceID = 5; 
        this.disconnectDeviceID = 6; 
        this.createSessionID = 7;
        this.closeSessionID = 8;
        this.subscribeID = 9; 
        this.unsubscribeID = 10; 
        this.queryProfileID = 11; 
        this.setupProfileID = 12;
        this.getTrainedActionsID = 13;
        this.trainID = 14;
        this.detectionID = 15; 
        this.activeActionID = 16; 


        // Event listener for when a message arrives 
        this.socket.onmessage = (res)=>{
            // Checking login
            let data =JSON.parse(res.data)
            console.log(data)
            if(data['id']===this.checkUserLoginID){
                if(data['result'].length > 0){ // If the 'result' field of the response isn't empty, 
                    // Alert
                    console.log('[Cortex message] Logged into Emotiv ID...'); 
                    // User is logged in
                    this.resolve(true);

                } else { // else if field is empty,
                    // Alert
                    console.log('[Cortex message] Not logged in! Make sure you log in to Emotiv ID.'); 
                    // User is not logged in
                    this.resolve(false); 

                }
            } 
            
            // Requesting access 
            else if (data['id']===this.requestAccessID){ 
                if (data.result?.accessGranted){ // If access was granted, 
                    console.log('[Cortex message] Access granted!'); 
                    this.resolve(true); // Resolve true
                
                } else { // If access wasn't granted,
                    this.resolve(false); // Resolve false
                }
            } 

            // Authorizing account
            else if(data['id']===this.authorizeID){
                if (data.hasOwnProperty('error')){ // If there was an error in the message, 
                    this.reject(data['error']); // Reject the promise with the error message 

                } else {
                    console.log("[Cortex message] Authorization token generated"); 
                    this.resolve(data['result']['cortexToken']); // Otherwise we resolve with the token 
                }

            } 

            // Querying headsets
            else if(data['id']===this.queryHeadsetID){
                if (data['result'].length > 0){ // Resolve with headsets if headsets were found
                    console.log('[Cortex message] Headsets found.');
                    this.availableHeadsets = data['result']; // Save list of headsets
                    this.resolve(data['result']); 

                } else { // Resolve with empty array if no headsets are found 
                    console.log('[Cortex message] No headsets found.');
                    this.availableHeadsets = []; // Save empty array 
                    this.resolve([]);
                }
            }

            // Connecting headset
            else if (data['id']===this.controlDeviceID){
                this.connectMsg = data['result']['message'];
                
                if (!(this.headsetId in this.connectedHeadsets)){ // Add headset to list of connected headsets
                    //this.connectedHeadsets = headsetId; 
                    this.connectedHeadsets.push(this.headsetId); 
                }
                this.resolve(); 
                
            }
            // Connecting headset - receive the actual connection status. 
            else if (data.hasOwnProperty('warning')){
                let warning = data['warning'];
                if (warning.code === 104){
                    console.log('[Cortex message] ' + warning.message.headsetId + ' ' + warning.message.behavior);
                    this.connectMsg = warning.message.behavior; 
                    this.resolve(); 
                } else if (warning.code === 100 || warning.code === 101 || warning.code === 102 || warning.code === 113){ 
                    console.log('[Cortex message] ' + warning.message.headsetId + ' ' + warning.message.behavior); 
                    this.connectMsg = warning.message.behavior; 
                    // this.headsetId = null; // Set to null if there was an error? 
                    this.reject(); 
                }                 
            }    
            
            // Disconnecting headset 
            else if(data['id']===this.disconnectDeviceID){
                console.log('[Cortex message] ' + data['result']['message']); 
            } 

            // Creating a session
            else if(data['id']===this.createSessionID){ 
                if (data.hasOwnProperty('result')){
                    this.sessionId = data['result']['id'];
                    this.resolve(); 
                } else if (data.hasOwnProperty('error')) { 
                    this.reject(data['error']);
                } else {
                    console.log(data); 
                }
                
            } 

            // Closing a session
            else if (data['id']===this.closeSessionID){
                if (data['result'].hasOwnProperty('status')){
                    if (data['result']['status']==='closed'){
                        this.sessionId = null; 
                        console.log('[Cortex message] Session closed.'); 
                        this.resolve();
                    } else {
                        console.log(data);
                    }
                } else if (data.hasOwnProperty('error')) {
                    this.reject(data['error']);
                }
                else {
                    console.log(data); 

                }
            }

            // Suscribing to a stream
            else if (data['id']===this.subscribeID){
                if (data.hasOwnProperty('result')){
                    if(data['result']['failure'].length > 0){ // If streams failed, reject
                        this.reject(data['result']['failure']);   
                    } else  {
                        this.resolve('[Cortex message] Successfully subscribed.'); // Otherwise, resolve a success message 
                    }
                } else if (data.hasOwnProperty('error')){
                    this.reject(data['error']);
                } else {
                    console.log(data); 
                }

            }

            // Unsubscribing to a stream
            else if (data['id']===this.unsubscribeID){
                if(data['result']['failure'].length > 0){ // Log if failure occurs
                    console.log('[Cortex message] ' + data['result']['failure']);  
                    this.reject(); 
                } else {
                    let idx = this.subscribed.findIndex(str => str === this.streams[0])
                    this.subscribed.splice(idx, 1); 
                    this.resolve('[Cortex message] Successfully unsubscribed.'); 
                }
            }

            // Querying profiles
            else if (data['id']===this.queryProfileID){
                if (data.hasOwnProperty('result')){
                    this.resolve(data['result']);

                } else if (data.hasOwnProperty('error')) {
                    this.reject(data['error']); 
                }
            }

            // Controlling a profile
            else if (data['id']===this.setupProfileID){
                if (data.hasOwnProperty('result')){
                    this.resolve(data['result']['message']); 

                } else if (data.hasOwnProperty('error')){
                    this.reject(data['error']);
                }
            }
            
            // Getting a profile's trained actions
            else if (data['id']===this.getTrainedActionsID){
                if (data.hasOwnProperty('result')){
                    this.resolve(data['result']['trainedActions']); 

                } else if (data.hasOwnProperty('error')){
                    this.reject(data['error']);
                }
            }

            else if (data['id']===this.trainID){
                console.log(data);
            }
            
            // Training
            else if (data.hasOwnProperty('sys')){
   
                if (this.trainStatus === 'start'){
                    if(data['sys'][1]==='MC_Started'){
                        console.log('[Cortex message] Training started...');

                    } else if(data['sys'][1]==='MC_Succeeded'){
                        console.log('[Cortex message] Training succeeded.')
                        this.resolve(true); 
                    }      
                }
                else if (this.trainStatus === 'accept'){
                    if(data['sys'][1]==='MC_Completed'){
                        console.log('[Cortex message] Training completed.'); 
                        this.resolve(true); 
                    }   
                }
                else if (this.trainStatus === 'erase'){
                    if(data['sys'][1]==='MC_DataErased'){
                        console.log('[Cortex message] Training data erased.'); 
                        this.resolve(true); 
                    } 
                   
                }
            }

            else if (data['id']===this.detectionID){
                if (data.hasOwnProperty('result')){
                    console.log(data['result']);
                } else if (data.hasOwnProperty('error')){
                    console.log(data['error']);
                }
                
            }

            // Getting active actions for a profile
            else if (data['id']===this.activeActionID){
                if (data.hasOwnProperty('result')){
                    this.resolve(data['result']);
                } else if (data.hasOwnProperty('error')){
                    this.reject(data['error']);
                }

            }

            // Error Handling
            else if (data.hasOwnProperty('error')){
                console.log('i am in general error handling');
                console.log(data); 
                this.reject(data['error']); // Reject with the error 
            }
        }
        
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------
    // Setup function
    // - makes sure cortex socket is open
    // - checks if the user is logged in with their Emotiv ID
    // - requests access using the client ID and Secret and saves the results
    // - authorizes to generate a Cortex Token (needed for most subsequent requests, except querying/connecting headsets)

    async setUpCortex(){

        // Check to see if the socket is already open
        if (this.socket.readyState !== this.socket.OPEN){ // If the socket is not open
            try{
                await this.onConnect(); // Await connection 
            } catch (error) {
                console.log(error); // Error handling
            }
        }
        

        // Check to see if the user is logged in with their Emotiv ID
        // If user is not logged in, keep checking until it returns true. User must go and log in with their Emotiv ID. 
        try{
            this.isLoggedIn = await this.checkLogin(); 
            console.log(`Logged in: ${this.isLoggedIn}.`); 
            /* while (!this.isLoggedIn){
                console.log('[Cortex message] You must log in with your Emotiv ID to continue.'); // Alert
                await this.waitForUser(); 
                this.isLoggedIn = await this.checkLogin(); // Check if logged in 
            }  */
        } catch (error) {
            console.log(error);  // Error handling
        }

        // Request access
         // If accessGranted returns false, keep checking until it returns true. User must go and approve in their Emotiv App. 
        try{
            this.accessGranted = await this.requestAccess(); 
            console.log(`Access granted: ${this.accessGranted}.`);
/*             while (!this.accessGranted){ 
                console.log('[Cortex message] You must approve access in the Emotiv App to continue.'); // Alert
                await this.waitForUser(); // Pause to wait for user to complete requested action 
                this.accessGranted = await this.requestAccess(); // Request access again
            } */

        } catch (error) {
            console.log(error); // Error handling 

        }

        // Authorize to generate Cortex Token
        try{
            this.cortexToken = await this.authorize(); // Authorize 
            console.log('done', this.cortexToken)
            return true; 

        } catch (error){
            console.log(error); // Error handling 
            return false; 
        }
        
        // Setup complete! 
    }


    // ------------------------------------------------------------------------------------------------------------------------------------------
    // Universal functions - all engines will have these methods
    // Headset specific functions - connecting to and setting up headsets     

    // Function to find available headsets
    // Promise resolves with the available headsets, or an empty array if no headsets are found
    // Saves list of available headsets as a property this.available headsets 
    queryAvailableHeadsets(){
        return new Promise((resolve, reject)=>{

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Querying headsets...');

            // Send message to cortex 
            let queryHeadsetMsg = JSON.stringify({"id":this.queryHeadsetID, "jsonrpc":"2.0", "method":"queryHeadsets"});
            this.socket.send(queryHeadsetMsg); 

        })
    }

    // Function to connect a headset
    // Promise resolves with a success message (how to handle errors here?)
    connectHeadset(headset){
        return new Promise((resolve, reject)=>{

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Connecting headset...');

            // Save headset
            this.headsetId = headset.id; 
            this.headset = headset; 

            // Send message to cortex
            let params = {"command":"connect", "headset": this.headsetId}; 
            let controlDeviceMsg = JSON.stringify({"id":this.controlDeviceID, "jsonrpc":"2.0", "method":"controlDevice", "params":params});
            this.socket.send(controlDeviceMsg); 
            
        })  
    }

    // Function to disconnect a headset
    // Promise resolves with message if successful
    disconnectHeadset(headset=this.headset){

        // Alert
        console.log('[Cortex message] Disconnecting headset...');

        // Send message to cortex
        let params = {"command":"disconnect", "headset": headset.id};
        let disconnectDeviceMsg = JSON.stringify({"id":this.disconnectDeviceID, "jsonrpc":"2.0", "method":"controlDevice", "params":params});
        this.socket.send(disconnectDeviceMsg); 
        
    }

    // Function to check headset impedance  
    async checkImpedance(){
        // Subscribe to the 'dev' data stream 
        try{
            let subscribeMsg = await this.subscribe(['dev']);
            console.log(subscribeMsg); 
            this.subscribed.push('dev');
        } catch (error){
            console.log(error); 
        }
    }

    // Function to train a command 
    async train(command, request){

        // Subscribe to system events if not already subscribed
        if (!(this.subscribed.includes('sys'))){
            
            try{
                let subscribMsg = await this.subscribe(['sys']);
                console.log(subscribMsg); 
                this.subscribed.push('sys');

            } catch (error){
                console.log(error)
            }
        }

        // Start training
        if (request === 'start'){
            try {
                let trainSucceeded = await this.trainRequest(command, request); 
                return trainSucceeded;
            } catch (error){
                
                console.log(error); 
            }
        }

        // Accept training 
        else if (request === 'accept'){
            try{
                let acceptSucceeded = await this.trainRequest(command, request); 
                return acceptSucceeded;
            } catch (error){
                console.log(error); 
            }
            
        }

        // Erase training
        else if (request === 'erase'){
            console.log(`[Cortex message] Erasing ${command} training data...`);
            try{
                let eraseSucceeded = await this.trainRequest(command, request); 
                return eraseSucceeded;
            } catch (error){
                console.log(error); 
            }
        }
    }

    // --------------------------------------------------------------------------------------------------------------------------------------------
    // Cortex specific methods

    // Promise that will resolve when socket is connected  
    onConnect(){
        return new Promise((resolve, reject) => {     
            try {
            this.socket.onopen = ()=>{
                console.log('[Cortex message] Connection established at ' + this.socketUrl); 
                resolve(); 
            }
            } catch (error){ // If there is an error, reject with an error
                reject(error); 
            } 
        })
    } 

    // Promise to check if a user is logged in
    // Resolves true if user is logged in, false if not, rejects if error occurs. 
    checkLogin(){
        return new Promise((resolve, reject) => {

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Checking user login...');

            // Send the message to cortex
            let checkUserLoginMsg = JSON.stringify({"id":this.checkUserLoginID, "jsonrpc":"2.0", "method":"getUserLogin"}); // Cortex message
            this.socket.send(checkUserLoginMsg); 
        })
    }

    
    // Promise to request Access to Cortex API
    // Resolves true if access is granted, resolves false if it was not granted  
    requestAccess(){
        return new Promise((resolve, reject)=>{
            
            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Requesting access...');

            // Send the message to cortex
            let params = { "clientId": this.clientId, "clientSecret": this.clientSecret}; // Parameters for message
            let requestAccessMsg = JSON.stringify({"id":this.requestAccessID, "jsonrpc":"2.0", "method":"requestAccess", "params": params}); // Craete JSON object for message
            this.socket.send(requestAccessMsg); // Send message to Cortex
    
        })
    }

    // Function to generate cortex authorization token 
    // Promise resolves the cortex token, or rejects if an error occurs 
    authorize(){
        return new Promise((resolve, reject) => {

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Authorizing...'); 

            // Send message to cortex 
            let params = {"clientId":this.clientId, "clientSecret":this.clientSecret}; // Parameters for message
            let authorizeMsg = JSON.stringify({"id":this.authorizeID, "jsonrpc":"2.0", "method":"authorize", "params": params}); // Create JSON object for message
            this.socket.send(authorizeMsg); // Send message to Cortex
            console.log('sent authorize message')
        });
    }

    // Function to create a new session 
    createSession(cortexToken, headsetId){
        return new Promise((resolve, reject) => {

            this.resolve = resolve;
            this.reject = reject; 

            // Alert
            console.log("[Cortex message] Getting session id..."); 

            // Send message to cortex 
            let params = {"cortexToken":cortexToken, "headset":headsetId, "status":"active"}
            let createSessionMsg = JSON.stringify({"id":this.createSessionID, "jsonrpc":"2.0", "method":"createSession", "params":params});
            this.socket.send(createSessionMsg); 

        });
    }

    closeSession(){
        return new Promise((resolve, reject) => {
            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Closing session...'); 
        
            // Send message to cortex
            let params = {"cortexToken":this.cortexToken, "session":this.sessionId, "status":"close"};
            let closeSessionMsg = JSON.stringify({"id":this.closeSessionID, "jsonrpc":"2.0", "method":"updateSession", "params":params});
            this.socket.send(closeSessionMsg); 

        })

    }

    // Function to subscribe to data streams
    subscribe(streams){
        return new Promise((resolve, reject) => {

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Subscribing to data streams: ');
            streams.forEach(streamName => { console.log('[stream] ' + streamName) });

            // Send message to cortex
            let params = {"cortexToken":this.cortexToken, "session":this.sessionId, "streams":streams};
            let subscribeMsg = JSON.stringify({"id":this.subscribeID, "jsonrpc":"2.0", "method":"subscribe", "params":params});
            this.socket.send(subscribeMsg); 

        })
    }


    unsubscribe(streams){
        return new Promise((resolve, reject) => {

            this.resolve = resolve; 
            this.reject = reject; 

            this.streams = streams; 

            // Alert
            console.log('[Cortex message] Unsubscribing from data streams: ');
            streams.forEach(streamName => { console.log('[stream] ' + streamName) }); 

            // Send message to cortex
            let params = {"cortexToken": this.cortexToken, "session": this.sessionId, "streams": streams};
            let unsubscribeMsg = JSON.stringify({"id":this.unsubscribeID, "jsonrpc":"2.0", "method":"unsubscribe", "params":params});
            this.socket.send(unsubscribeMsg); 

        })
    }

    queryProfiles(){
        return new Promise((resolve, reject) => {

            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log('[Cortex message] Querying profiles...'); 

            // Send message to cortex
            let params = {"cortexToken": this.cortexToken};
            let queryProfileMsg = JSON.stringify({"id":this.queryProfileID, "jsonrpc":"2.0", "method":"queryProfile", "params":params});
            this.socket.send(queryProfileMsg); 

        })
    }

    setupProfile(profileName, request){
        return new Promise((resolve, reject) => {
            
            this.resolve = resolve; 
            this.reject = reject; 

            this.profileName = profileName; // Save profile name 

            // Alert
            console.log(`[Cortex message] ${request} profile ${profileName}...`);

            // Send message to cortex
            let params = {"cortexToken": this.cortexToken, "headset": this.headsetId, "profile": profileName, "status": request};
            let setupProfileMsg = JSON.stringify({"id":this.setupProfileID, "jsonrpc":"2.0", "method":"setupProfile", "params":params});
            this.socket.send(setupProfileMsg); 
        })
    }

    getTrainedActions(){
        return new Promise((resolve, reject) => {
            
            this.resolve = resolve; 
            this.reject = reject; 
            
            // Send message to cortex
            let params = {"cortexToken": this.cortexToken, "detection": "mentalCommand", "profile": this.profileName};
            let getTrainedActionsMsg = JSON.stringify({"id":this.getTrainedActionsID, "jsonrpc":"2.0", "method":"getTrainedSignatureActions", "params":params});
            this.socket.send(getTrainedActionsMsg); 
        })
    }

    trainRequest(command, status){
        return new Promise((resolve, reject) => {

            this.resolve = resolve;
            this.reject = reject; 

            this.trainStatus = status;           

            // Send message to cortex
            let params = {"action":command, "cortexToken":this.cortexToken, "detection":"mentalCommand", "session":this.sessionId, "status":status};

            let trainMsg = JSON.stringify({"id":this.trainID, "jsonrpc":"2.0", "method":"training", "params":params});
            this.socket.send(trainMsg);
        })
    }  

    getDetectionInfo(detection){

        let params = {"detection": detection};
        let detectionInfoMsg = JSON.stringify({"id":this.detectionID, "jsonrpc":"2.0", "method":"getDetectionInfo", "params":params});
        this.socket.send(detectionInfoMsg);
        
    }

    mentalCommandActiveAction(profileName, status, activeCommands=[]){
        return new Promise((resolve, reject) => {
            this.resolve = resolve; 
            this.reject = reject; 

            // Alert
            console.log(`[Cortex message] Getting active commands from ${profileName} profile...`);

            let params = {"cortexToken": this.cortexToken, "status":status, "profile": profileName, "session":this.sessionId };
            if (status === 'set'){
                params.actions = activeCommands; 
            }
            
            let activeActionMsg = JSON.stringify({"id":this.activeActionID, "jsonrpc":"2.0", "method":"mentalCommandActiveAction", "params":params});
            this.socket.send(activeActionMsg); 
        })
    }

}

/* const keySender = require('./keysender'); 

// Test Code
async function main(){
    let cortex = new CortexAdapter(); 
    await cortex.setUpCortex(); 
   let headsets = await cortex.queryAvailableHeadsets(); 
    let headsetID = headsets[0].id; 
    await cortex.connectHeadset(headsetID); 
    console.log(cortex.connectMsg);
    console.log(cortex.connectedHeadsets); 

    cortex.sessionId = await cortex.createSession(cortex.cortexToken, headsetID); 

    try{
        await cortex.subscribe(['com']);

    }catch (err){
        console.log(err); 
    }

    let settings = {}; 
    settings.command = 'push'; 
    settings.threshold = '50'; 
    settings.action = 'w'; 
    settings.sendAction = true; 

    
    let myBuffer = [];
    let rate = 1;
    let samplingRate = 8; 
    let limitedRate = samplingRate*rate; 

    cortex.socket.on('message', (data)=>{
        if(JSON.parse(data).hasOwnProperty('com')){
            myBuffer.push(JSON.parse(data)['com']);
            if(myBuffer.length === limitedRate){
                keySender(settings, myBuffer[0]);
                myBuffer = []; 
            }

        }
    });



}

main();  */

