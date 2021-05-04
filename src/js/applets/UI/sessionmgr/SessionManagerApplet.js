import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import { StateManager } from '../../../../library/src/ui/StateManager'
import * as settingsFile from './settings'
import * as BrowserFS from 'browserfs'
const fs = BrowserFS.BFSRequire('fs');
const BFSBuffer = BrowserFS.BFSRequire('buffer').Buffer;

if(!document.getElementById('googleapi')) {
document.head.insertAdjacentHTML('beforeend',`
<script id='googleapi' async defer src="https://apis.google.com/js/api.js"
      onload="this.onload=function(){};handleClientLoad()"
      onreadystatechange="if (this.readyState === 'complete') this.onload()">
</script>
`);
}

//Session reviewer! Yay!
export class SessionManagerApplet {

    constructor(
        parent=document.body,
        bci=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.bci = bci; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.state = new StateManager({
            sessionName:'',
            autosaving:true,
            saveChunkSize:0,
            saveChunkSize:2000,
            sessionChunks:0,
            eegSaveCounter:0,
            hegSaveCounter:0,
            newSessionCt:0,
            fileSizeLimitMb: 250
        });

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

    //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        fs.exists('./data',(exists) => {
            console.log(exists);
        });

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return ` 
            <div id='${props.id}'>
                <p>Google Sheets API Quickstart</p>

                <!--Add buttons to initiate auth sequence and sign out-->
                <button id="authorize_button" style="display: none;">Authorize</button>
                <button id="signout_button" style="display: none;">Sign Out</button>

                <pre id="content" style="white-space: pre-wrap;"></pre>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            // Array of API discovery doc URLs for APIs used by the quickstart
            var DISCOVERY_DOCS = [
                "https://sheets.googleapis.com/$discovery/rest?version=v4",
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            ];

            var authorizeButton = document.getElementById('authorize_button');
            var signoutButton = document.getElementById('signout_button');

            /**
             *  On load, called to load the auth2 library and API client library.
             */
            function handleClientLoad() {
                gapi.load('client:auth2', initClient);
            }

            /**
             *  Initializes the API client library and sets up sign-in state
             *  listeners.
             */
            function initClient() {
                gapi.client.init({
                    apiKey: 'AIzaSyDkUs-ofe1TPDftg4_T5wcA8y7qp03f6nU',
                    clientId: '354011508571-521lgm8ulo8nl6bevis1n94nlekf44ge.apps.googleusercontent.com',
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: `https://www.googleapis.com/auth/drive.appdata 
                    https://www.googleapis.com/auth/drive.file 
                    https://www.googleapis.com/auth/drive.install 
                    https://www.googleapis.com/auth/docs 
                    https://www.googleapis.com/auth/drive 
                    https://www.googleapis.com/auth/drive.metadata 
                    https://www.googleapis.com/auth/drive.scripts 
                    https://www.googleapis.com/auth/drive.activity 
                    https://www.googleapis.com/auth/spreadsheets`
                }).then(function () {
                    // Listen for sign-in state changes.
                    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                    // Handle the initial sign-in state.
                    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                    authorizeButton.onclick = handleAuthClick;
                    signoutButton.onclick = handleSignoutClick;
                }, function(error) {
                    appendPre(JSON.stringify(error, null, 2));
                });
            }

            /**
             *  Called when the signed in status changes, to update the UI
             *  appropriately. After a sign-in, the API is called.
             */
            function updateSigninStatus(isSignedIn) {
                if (isSignedIn) {
                    authorizeButton.style.display = 'none';
                    signoutButton.style.display = 'block';
                    listMajors();
                } else {
                    authorizeButton.style.display = 'block';
                    signoutButton.style.display = 'none';
                }
            }

            /**
             *  Sign in the user upon button click.
             */
            function handleAuthClick(event) {
                gapi.auth2.getAuthInstance().signIn();
            }

            /**
             *  Sign out the user upon button click.
             */
            function handleSignoutClick(event) {
                gapi.auth2.getAuthInstance().signOut();
            }

            /**
             * Append a pre element to the body containing the given message
             * as its text node. Used to display the results of the API call.
             *
             * @param {string} message Text to be placed in pre element.
             */
            function appendPre(message) {
                var pre = document.getElementById('content');
                var textContent = document.createTextNode(message + '\n');
                pre.appendChild(textContent);
            }

            /**
             * Print the names and majors of students in a sample spreadsheet:
             * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
             */
            function listMajors() {
                gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                    range: 'Class Data!A2:E',
                }).then(function(response) {
                    var range = response.result;
                    if (range.values.length > 0) {
                    appendPre('Name, Major:');
                    for (i = 0; i < range.values.length; i++) {
                        var row = range.values[i];
                        // Print columns A and E, which correspond to indices 0 and 4.
                        appendPre(row[0] + ', ' + row[4]);
                    }
                    } else {
                    appendPre('No data found.');
                    }
                }, function(response) {
                    appendPre('Error: ' + response.result.error.message);
                });
            }
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

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
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