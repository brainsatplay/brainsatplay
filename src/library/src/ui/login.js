
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
