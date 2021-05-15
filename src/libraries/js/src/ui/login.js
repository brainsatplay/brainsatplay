
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
    let response = await window.gapi.auth2.getAuthInstance().signIn();
    let authResponse = response.getAuthResponse()
    return authResponse
}

export const LoginWithRealm = async (authResponse) => {
    let user;
    if (app.currentUser?.isLoggedIn) user = app.currentUser
    else {
        const credentials = Realm.Credentials.google(authResponse.id_token)
        credentials.payload.redirectUrl = redirectUri
        user = await app.logIn(credentials);
    }
    let data =  await user.refreshCustomData()
    return user;
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
