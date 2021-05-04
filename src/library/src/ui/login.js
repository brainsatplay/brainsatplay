
// Auth
import * as Realm from "realm-web";
import googleOneTap from 'google-one-tap';

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
    app.logIn(credentials).then(user => {
    console.log(`Logged in with id: ${user.id}`);
    user.refreshCustomData().then(data => {
        console.log(data)
    })
    let profileImg = document.getElementById(`brainsatplay-profile-img`)
    document.getElementById(`brainsatplay-profile-img`).src = user._profile.data.pictureUrl
    document.getElementById(`brainsatplay-profile-label`).innerHTML = 'Your Profile' // user._profile.data.name
    profileImg.style.padding = "0"
    return true
    }).catch(e => {console.error(e)})
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
