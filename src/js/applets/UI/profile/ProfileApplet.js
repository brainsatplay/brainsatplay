import {Session} from '../../../../library/src/Session'
import {DOMFragment} from '../../../../library/src/ui/DOMFragment'
import * as settingsFile from './settings'
import {deviceList} from '../../../../library/src/devices/deviceList'

export class ProfileApplet {
    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.info = settingsFile.settings;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
        };

    }

    //---------------------------------
    //---Required template functions---
    //---------------------------------

     //Initalize the app with the DOMFragment component for HTML rendering/logic to be used by the UI manager. Customize the app however otherwise.
    init() {

        //HTML render function, can also just be a plain template string, add the random ID to named divs so they don't cause conflicts with other UI elements
        let HTMLtemplate = (props=this.props) => { 
            return `
                <div id='${props.id}' style='height:100%; width:100%; position: relative;'>
                <section id="${props.id}-error-screen" style="position:absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 50px; background: black; opacity: 1; transition: opacity 1s;">
                </section>
                <section id='${props.id}-profile' style="padding: 50px; width: 100%; height: 100%; box-sizing: border-box; oveflow: scroll;">
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
                        <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
                            <img id="${props.id}-picture" style="height: 100%; aspect-ratio: 1 / 1;">
                            <div style="margin-left: 25px;">
                                <h1 id="${props.id}-name"></h1>
                                <div style='font-size: 80%;'>
                                    <p>ID: <span id="${props.id}-customData-userId"></span></p>
                                    <p>Email: <span id="${props.id}-customData-email"></span></p>
                                </div>
                            </div>
                        </div>
                        <div id="${props.id}-signout">Sign Out</div>
                    </div>
                    <br>
                    <h2>Username</h2>
                    <hr>
                    <p><span id="${props.id}-customData-username"></span></p>
                    <br>
                    <h2>Devices</h2>
                    <hr>
                    <div id="${props.id}-devicegrid" style="display: flex; flex-wrap: wrap;"></div>
                </section>
                </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.updateProfileInfo()

            document.getElementById(`${props.id}-signout`).onclick = async () => {
                let returned = await window.handleSignoutClick()
                console.log('returned',returned)
                this.responsive()
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

        if(this.settings.length > 0) { this.configure(this.settings); } //you can give the app initialization settings if you want via an array.
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        if (this.currentApplet != null) this.currentApplet.instance.deinit();
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        this.toggleErrorScreen()
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    toggleErrorScreen(msg='<h1>Please log in with Google to view your profile.</h1>') {
        let errorScreen = document.getElementById(`${this.props.id}-error-screen`)
        if (window.gapi.auth2?.getAuthInstance()?.isSignedIn?.get()) {
            errorScreen.style.opacity = 0;
            errorScreen.style.pointerEvents = 'none';
        }
        else {
            errorScreen.style.opacity = 1;
            errorScreen.style.pointerEvents = 'auto';
            errorScreen.innerHTML = msg;
        }
    }

    updateProfileInfo(){
        if (this.session.info.googleAuth != null){
            document.getElementById(`${this.props.id}-error-screen`).style.opacity = 0;
            document.getElementById(`${this.props.id}-picture`).src = this.session.info.googleAuth.profile.pictureUrl
            document.getElementById(`${this.props.id}-name`).innerHTML = this.session.info.googleAuth.profile.name
            let deviceGrid = document.getElementById(`${this.props.id}-devicegrid`)

            this.session.info.googleAuth.refreshCustomData().then((data) => {
                let usernameEntry = document.getElementById(`${this.props.id}-customData-username`)
                if (Object.keys(data).includes('username')){
                    usernameEntry.innerHTML = data['username'];  
                } else {
                    usernameEntry.innerHTML = `<div style="display: inline-block"><input placeholder="Enter your username"></input><button>Submit</button></div>`
                    usernameEntry.querySelector('button').onclick = async () => {
                        await this.updateUsernameEntry(usernameEntry)
                    }
                }

                for (const [key, value] of Object.entries(data)) {
                    if (!['picture', 'firstName', 'lastName', '_id', 'username','devices'].includes(key)){
                        document.getElementById(`${this.props.id}-customData-${key}`).innerHTML = value;  
                    }
                }

                deviceGrid.innerHTML = ''
                deviceList.forEach((config) => {
                    let div = document.createElement('div')
                    div.style = `min-width: 200px; flex-grow: 1;`
                    let input = document.createElement('input')
                    input.type = 'checkbox'
                    input.name = `${config.company}_${config.name}`
                    input.id = `${this.props.id}-${config.company}_${config.name}`
                    let label = document.createElement('label')
                    label.for = config.name
                    label.innerHTML = config.name
                    div.appendChild(input)
                    div.appendChild(label)


                    let companyDiv = deviceGrid.querySelector(`.${config.company.replace(/[^\w\s]/gi, '')}`)
                    if (companyDiv == null) {
                        deviceGrid.innerHTML += `<div><h3>${config.company[0].toUpperCase() + config.company.slice(1)}</h3><div class="${config.company.replace(/[^\w\s]/gi, '')}"></div></div>`
                        companyDiv = deviceGrid.querySelector(`.${config.company.replace(/[^\w\s]/gi, '')}`)
                    }
                    companyDiv.appendChild(div)
                })

                // Setup Dynamic Checkbox Behavior
                let checkboxes = deviceGrid.querySelectorAll(`input[type='checkbox']`)
                for (let box of checkboxes){
                    box.checked = data.devices.includes(box.name)
                    box.onchange = (e) => {
                        this.updateDevices(e.target.name,e.target.checked)
                    }
                }
            })

        } else {
            document.getElementById(`${this.props.id}-error-screen`).style.opacity = 1;
        }
    }

    updateUsernameEntry = async (usernameContainer) => {
        const newUsername = usernameContainer.querySelector('input').value
        usernameContainer.innerHTML = `<p>Updating...</p>`
        const mongo = this.session.info.googleAuth.mongoClient("mongodb-atlas");
        const collection = mongo.db("brainsatplay").collection("customUserData");
        const filter = {userID: this.session.info.googleAuth.profile.id};
        const updateDoc = {$set: {username: newUsername, },};
        await collection.updateOne(filter, updateDoc);
        this.updateProfileInfo()
    }
    updateDevices = async (device,has=false) => {
        const mongo = this.session.info.googleAuth.mongoClient("mongodb-atlas");
        const collection = mongo.db("brainsatplay").collection("customUserData");
        const filter = {userID: this.session.info.googleAuth.profile.id};
        const updateDoc = (has ? {$addToSet: { devices: device }} : {$pull: { devices: device }})
        await collection.updateOne(filter, updateDoc);
    }
} 