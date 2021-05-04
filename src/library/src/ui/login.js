
// Auth
import * as Realm from "realm-web";
// import googleOneTap from 'google-one-tap';

// let mongodb = {
//     collection: "profiles",
//     service: "mongodb-atlas",
//     database: "brainsatplay"
// }

// .get("mongodb-atlas")

const app = new Realm.App("brainsatplay-tvmdj");
const client_id = "354011508571-521lgm8ulo8nl6bevis1n94nlekf44ge.apps.googleusercontent.com";

const redirectUri = `${window.location.origin}/`;
const credentials = Realm.Credentials.google(redirectUri);


if(!document.getElementById('googleapi')) {
    document.head.insertAdjacentHTML('beforeend',`
        <script id='googleapi' async defer src="https://apis.google.com/js/api.js" 
        onload="this.onload=function(){};window.handleClientLoad();" 
        onreadystatechange="console.log(window.gapi, this.readyState); if (this.readyState === 'complete') this.onload();">
        </script>
    `);
}


/**
 *  Sign out the user upon button click.
 */
window.handleSignoutClick = function(event) {
    window.gapi.auth2.getAuthInstance().signOut();
}

window.handleClientLoad = function() {
    window.gapi.load('client:auth2', window.initClient);
}


window.updateSigninStatus = function(isSignedIn) {
    if (isSignedIn) {
        console.log("Signed in with Google, Drive, Docs, and Sheets available.")
    } else {
        console.log("Signed out of Google")
    }
}


window.initClient = function() {
    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ];

    window.gapi.client.init({
        apiKey: 'AIzaSyDkUs-ofe1TPDftg4_T5wcA8y7qp03f6nU',
        clientId: client_id,
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
        window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        window.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        
    }, function(error) {
        console.log(error);//appendPre(JSON.stringify(error, null, 2));
    });
}



export const LoginWithGoogle = async () => {

    let credentials = await window.gapi.auth2.getAuthInstance().signIn();
    console.log(credentials)
    // credentials = gapi.auth2 
    return credentials; // ????
}

export const handleAuthRedirect = () => Realm.handleAuthRedirect();



// // Open the Google One Tap menu
// export const LoginWithGoogle = () => {
//     googleOneTap({ client_id }, async (response) => {
//     const credentials = Realm.Credentials.google(response.credential)
//     const user = await app.logIn(credentials);
//     console.log(`Logged in with id: ${user.id}`);
//     });
// }
