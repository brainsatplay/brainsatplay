
import './old/Build/webbuild.wasm'
import './old/Build/webbuild.data'

import * as webconfig from './old/Build/buildconfig'
import * as webbuild from './old/Build/webbuild.loader'

export class Unity{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph) {

            // Declare functions that will be called by Unity instance window callbacks here.
            function OnUnityEvent() {
                console.log("OnUnityEvent call")
            }
    
            function OnUnityEvent(param) {
                console.log("OnUnityEvent with parameters call" + param)
            }
    
            // Unity instance window callbacks that we call from .jslib in Unity.
            // Modify these signatures to respond to whatever you want to send from Unity.
            window.PassUnityEvent = () => {
                OnUnityEvent()
            }
            window.PassUnityEvent = (param) => {
                OnUnityEvent(param)
            }

        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            instance: null
        }
        this.props.canvas = document.createElement('canvas')
        this.props.canvas.style = `width: 100%; height: 100%;`

        this.ports = {
            element: {
                data: this.props.canvas,
                input: {type: undefined},
                output: {type: Element},
            },
            webbuild: {
                data: webbuild,
                input: {type: null},
                output: {type: null},
            },
            commands: {
                data: [],
                input: {type: Array},
                output: {type: null},
            },
        }
    }

    init = () => {

        let onError = () => { };
        
        //Add whatever else you need to initialize
        if (this.ports.webbuild.data){
            this.ports.webbuild.data.createUnityInstance(this.props.canvas, webconfig.config, () =>
            { }).then((unityInstance) => {
                this.props.instance = unityInstance;
            }).catch(onError);
        }

        this.ports.commands.data.forEach(o => {
            this.addPort(o.function, {
                input: {type: o.type},
                output: {type: null},
                onUpdate: (user) => {
                    // let data = JSON.stringify(user.data)
                    let data = user.data
                    if (this.props.instance) this.props.instance.SendMessage(o.object, o.function, data);
                }
            })
        })
        
    }

    deinit = () => {
       if (this.props.instance.Quit instanceof Function) this.props.instance.Quit()
    }
}