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

        this.states = {
            dynamic: {},
            static: {}
        }

        this.stateIds = []
        this.dynamicProps = {}
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
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; pointer-events: none; display: flex; align-items: center; justify-content: center;">
            <div id='${props.id}userList' style='pointer-events: auto; width: 50%; height: 50%; padding: 50px; border: 1px solid gray; justify-items: center; align-items: center; overflow-y: scroll;'>
                <div id='${props.id}streamInfo' style='padding: 5px;'></div>
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
            </div>`;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {
            this.session.makeGameBrowser(this.name,props.id,()=>{console.log('Joined game!', this.name)},()=>{console.log('Left game!', this.name)})

            document.getElementById(props.id+'createGame').onclick = () => {
                this.session.sendWSCommand(['createGame',this.name,['eeg','heg'],['eegfftbands_FP1_all','eegfftbands_FP2_all','eegfftbands_AF7_all','eegfftbands_AF8_all','hegdata','dynamicProps']
                // this.session.sendWSCommand(['createGame',this.name,['eeg','heg'],['dynamicProps']
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
        
        let info = document.getElementById(`${this.props.id}streamInfo`)

        document.addEventListener('keydown',(k => {
            this.dynamicProps.spacebar = (k.keyCode === 32 ? 1 : 0)
        }))

        document.addEventListener('keyup',(k => {
            this.dynamicProps.spacebar = (k.keyCode === 32 ? 0 : 0)
        }))

        // Set a dynamic property for your location
        this.dynamicProps.spacebar = 0
        this.stateIds.push(this.session.streamAppData('dynamicProps', this.dynamicProps,(newData) => {
            console.log("New data detected! Will be sent!");
        }))

        // Animate
        this.animate = () => {
            let streamInfo = this.session.state.data?.commandResult
                // Update UI if results are different
                if ((!streamInfo != null) && Object.keys(streamInfo).length !== 0 && streamInfo.constructor === Object){

                    let usernames = streamInfo.usernames
                    let spectators = streamInfo.spectators

                    console.log(streamInfo)

                    // Update user cards
                    if ( usernames != null) {
                        usernames.forEach((name)=> {
                            if (spectators.includes(name)) {
                                if (document.getElementById(`${this.props.id}-spectator-${name}`) == null){
                                    spectatorsList.innerHTML += `
                                    <div id="${this.props.id}-spectator-${name}" style="width: 100%; min-height: 25px; padding: 5px;">
                                        <h1>${name}</h1>
                                        <div style="font-size: 60%;">
                                        </div>
                                    </div>`
                                }
                            }
                            else {
                                if (document.getElementById(`${this.props.id}-player-${name}`) == null){
                                playersList.innerHTML += `<div id="${this.props.id}-player-${name}" style="width: 100%; min-height: 25px; padding: 5px;">
                                        <h1>${name}</h1>
                                        <div style="font-size: 60%;">
                                        </div>
                                    </div>`
                                }
                            }
                        })

                    // Update user data
                    streamInfo.userData.forEach((userData) => {
                        if (userData != null){
                        let name = userData.username
                        let type = (spectators.includes(name) ? 'spectator' : 'player')
                        let userCard = document.getElementById(`${this.props.id}-${type}-${name}`).querySelector(`div`)
                        Object.keys(userData).forEach(k1 => {
                                if (!['username'].includes(k1)){
                                    let div = userCard.querySelector(`.${k1}`)
                                    if (div == null ) {
                                        if (userData[k1].constructor == Object){
                                            let innerHTML = ``
                                            innerHTML += `<h3>${k1}</h3>`
                                            let a = this.unpackObject(userData[k1])
                                            innerHTML += this.nestHTMLElements(a)
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
                                            let a = this.unpackObject(userData[k1])
                                            innerHTML += this.nestHTMLElements(a)
                                            div.innerHTML += innerHTML
                                        } else {
                                            div.innerHTML += `<h3>${k1}</h3><p>${userData[k1]}</p>`
                                        }
                                    }
                                }
                            })
                        }
                    })
                }

                let appInfo = streamInfo.gameInfo
                if (appInfo != null && streamInfo.msg === "getGameInfoResult"){

                    info.innerHTML += `
                    <h3 style="font-size: 80%;">${appInfo.id}</h3>
                    `

                    Object.keys(appInfo).forEach((key) => {
                        if (!['usernames','appname','spectators','updatedUsers','newUsers', 'lastTransmit','id'].includes(key)){
                            let val = appInfo[key]
                                let el = document.getElementById(`${this.props.id}-appInfo-${key}`)
                                if (el == null ) {
                                    info.innerHTML += `<div id="${this.props.id}-appInfo-${key}" style=" font-size: 60%; width: 100%; padding: 5px;"></div>`
                                    el = document.getElementById(`${this.props.id}-appInfo-${key}`)
                                }
                                el.innerHTML = `<h3>${key}</h3>`

                                if (Array.isArray(val)){
                                    val.forEach(v => {
                                                    el.innerHTML += `<p>${v}</p>`
                                    })
                                } else {
                                    el.innerHTML += `<p>${val}</p>`
                                }
                                this.states.static[key] = val
                        }
                    })
                }
            }

            setTimeout(() => this.animation = window.requestAnimationFrame(this.animate), 1000/60)
        }

        this.animate()
    
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.stateIds.forEach(id => {
            this.session.state.unsubscribeAll(id);
        })
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

    unpackObject(o) {
        let a = []
        Object.keys(o).forEach(k => {
            if (o[k].constructor != Object) a.push([k,o[k]])
            else a.push([k,this.unpackObject(o[k])])
        })
        return a
    }

    nestHTMLElements(a){
        let innerHTML = ``
        a.forEach(v => {
            if (!Array.isArray(v[1])) innerHTML += `<p>${v[0]} : ${v[1]}</p>`
           else innerHTML += `<p>${v[0]} : ${this.nestHTMLElements(v[1])}</p>`
        })
        return innerHTML
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}

   
} 