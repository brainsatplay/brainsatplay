import * as brainsatplay from './../../../../library/brainsatplay'
import {DOMFragment} from './../../../../library/src/ui/DOMFragment'


//Example Applet for integrating with the UI Manager
export class MultiplayerAppletTemplate {

    
    

    constructor(
        parent=document.body,
        session=new brainsatplay.Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.name = this.constructor.name
        this.session = session; //Reference to the Session to access data and subscribe
        this.parentNode = parent;
        this.settings = settings;
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.uiStates = {
            dynamic: {},
            static: {}
        }
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
            <button id='${props.id}createGame'>Make Game session</button>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                <div id='${props.id}userList' style='pointer-events: auto; width: 50%; height: 50%; padding: 50px; border: 1px solid gray; justify-items: center; align-items: center; overflow-y: scroll;'>
                <h2>Players</h2>
                <hr>
                <div id='${props.id}userList-players'>

                </div>
                <h2>Spectators</h2>
                <hr>
                <div id='${props.id}userList-spectators'>

                </div>
                </div>
            </div>
            <div id='${props.id}gameInfo' style='position: absolute; top: 0; right: 0; width: 25%; height: 20%; padding: 5px; border: 1px solid gray; justify-items: center; align-items: center; overflow-y: scroll;'></div>

            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.session.makeGameBrowser(this.name,props.id,()=>{console.log('Joined game!', this.name)},()=>{console.log('Left game!', this.name)})

            document.getElementById(props.id+'createGame').onclick = () => {
                this.session.sendWSCommand(['createGame',this.name,['eeg','heg'],['eegfft_FP1_all','eegfft_FP2_all','eegfft_AF7_all','eegfft_AF8_all','hegdata']
                // ['eegcoherence_FP1_FP2_all','eegcoherence_AF7_AF8_all','hegdata']
            ]);
                //bcisession.sendWSCommand(['createGame','game',['muse'],['eegcoherence_AF7','eegcoherence_AF8']]);
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

        let applet = document.getElementById(this.props.id)
        let list = document.getElementById(`${this.props.id}userList`)
        let spectatorsList = document.getElementById(`${this.props.id}userList-spectators`)
        let playersList = document.getElementById(`${this.props.id}userList-players`)
        
        let info = document.getElementById(`${this.props.id}gameInfo`)

        let id = this.bci.streamAppData('Multiplayer',this.uiStates.dynamic,(newData) => {
            console.log("New data detected! Will be sent!");
        });

        //this.bci.state.unsubscribeAll(id);

        this.animate = () => {
            let data = this.session.state.data
            let result = this.session.state.data?.commandResult

            // this.session.streamAppData(this.props.id, {
            //     location: 1
            // })
            let streamInfo = data?.multiplayer?.[`${result.appname}`]
            if (streamInfo != null){
                let gameInfo = this.session.state.data?.commandResult?.gameInfo
                let usernames = (streamInfo.usernames.length > 0 ? streamInfo.usernames : gameInfo.usernames)
                let spectators = (streamInfo.spectators.length > 0 ? streamInfo.spectators : gameInfo.spectators)
                let t = streamInfo.t ?? gameInfo.lastTransmit

                if ( result.msg != null && this.uiStates.dynamic.msg !== result.msg ){
                    this.uiStates.dynamic.msg = result.msg
                }

                if ( usernames != null) {
                    if (this.uiStates.dynamic.usernames !== usernames ){
                    spectatorsList.innerHTML = ''
                    playersList.innerHTML = ''

                    usernames.forEach((name)=> {
                        if (spectators.includes(name)) {
                            spectatorsList.innerHTML += `
                            <div id="${this.props.id}-spectator-${name}" style="width: 100%; min-height: 25px; padding: 5px; display: grid; grid-template-columns: repeat(2,1fr);">
                                <h1>${name}</h1>
                                <div style="font-size: 60%;">
                                </div>
                            </div>`
                        }
                        else {
                            playersList.innerHTML += `<div id="${this.props.id}-player-${name}" style="width: 100%; min-height: 25px; padding: 5px; display: grid; grid-template-columns: repeat(2,1fr);">
                                <h1>${name}</h1>
                                <div style="font-size: 60%;">
                                </div>
                            </div>`
                        }
                    })
                    this.uiStates.dynamic.usernames = usernames
                    this.uiStates.dynamic.spectators = spectators
                }

                usernames.forEach((name) => {
                    let type = (spectators.includes(name) ? 'spectator' : 'player')
                    let userCard = document.getElementById(`${this.props.id}-${type}-${name}`).querySelector(`div`)
                    let userData = streamInfo.userData?.[name]
                    if (userData != null){
                        Object.keys(userData).forEach(k1 => {
                            let div = userCard.querySelector(`.${k1}`)
                            if (div == null ) {
                                if (userData[k1].constructor == Object){
                                    let innerHTML = ``
                                    innerHTML += `<h3>${k1}</h3>`
                                    Object.keys(userData[k1]).forEach(k2 => {
                                        innerHTML += `<p>${k2} : ${userData[k1][k2]}</p>`
                                    })
                                    userCard.innerHTML += `<div class="${k1}">${innerHTML}</div>`
                                } else {
                                    userCard.innerHTML += `<div class="${k1}"><h3>${k1}</h3><p>${userData[k1]}</p></div>`
                                }
                            }
                            else {
                                div.innerHTML = ''
                                if (userData[k1].constructor == Object){
                                    let innerHTML = ``
                                    innerHTML += `<h3>${k1}</h3>`
                                    Object.keys(userData[k1]).forEach(k2 => {
                                        innerHTML += `<p>${k2} : ${userData[k1][k2]}</p>`
                                    })
                                    div.innerHTML += innerHTML
                                } else {
                                    div.innerHTML += `<h3>${k1}</h3><p>${userData[k1]}</p>`
                                }
                            }
                        })
                    }
                })
            }


                if (gameInfo != null && this.uiStates.static !== gameInfo){
                    Object.keys(gameInfo).forEach((key) => {
                        if (!['usernames','spectators','updatedUsers','newUsers', 'lastTransmit'].includes(key)){
                            let val = gameInfo[key]
                            if ( val != null && this.uiStates.static[key] !== val ){

                                let el = document.getElementById(`${this.props.id}-gameInfo-${key}`)
                                if (el == null ) {
                                    info.innerHTML += `<div id="${this.props.id}-gameInfo-${key}" style=" font-size: 60%; width: 100%; padding: 5px;"></div>`
                                    el = document.getElementById(`${this.props.id}-gameInfo-${key}`)
                                }
                                el.innerHTML = `<h3>${key}</h3>`

                                if (Array.isArray(val)){
                                    val.forEach(v => {
                                        el.innerHTML += `<p>${v}</p>`
                                    })
                                } else {
                                    el.innerHTML += `<p>${val}</p>`
                                }
                                this.uiStates.static[key] = val
                            }
                        }
                    })
            }

            if ( t != null && this.uiStates.dynamic.t !== t ){
                let el = document.getElementById(`${this.props.id}-gameInfo-t`)
                if (el == null ) {
                    info.innerHTML += `<div id="${this.props.id}-gameInfo-t" style=" font-size: 60%; width: 100%; padding: 5px;"></div>`
                    el = document.getElementById(`${this.props.id}-gameInfo-t`)
                }
                el.innerHTML = `<h3>Transmission Received</h3><p>${t}</p>`
                this.uiStates.dynamic.t = t
            }
        }

            this.animation = window.requestAnimationFrame(this.animate)
        }

        this.animate()
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.AppletHTML.deleteNode();
        window.cancelAnimationFrame(this.animation)
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