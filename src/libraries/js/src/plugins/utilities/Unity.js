export class Unity{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(info, graph) {

        // Unity instance window callbacks that we call from .jslib in Unity.
        // Modify these signatures to respond to whatever you want to send from Unity.
        window.PassUnityEvent = (param) => {
            this.update('unityEvent', {value: param})
        }

        this.props = {
            instance: null,
            canvas: document.createElement('canvas')
        }

        this.props.canvas.style = `width: 100%; height: 100%;`


        this.ports = {
            element: {
                data: this.props.canvas,
                input: {type: undefined},
                output: {type: Element},
            },
            config: {
                input: {type: null},
                output: {type: null},
            },
            unityEvent: {
                input: {type: null},
                output: {type: 'string'},
                onUpdate: (user) => { 
                    this.ports.onUnityEvent.data(user.value)
                }
            },

            // Declare functions that will be called by Unity instance window callbacks here.
            onUnityEvent: {
                data: (param) => {
                    console.log("OnUnityEvent with parameters call" + param)
                },
                input: {type: Function},
                output: {type: undefined}
            },

            // Declare commands that can be sent to Unity
            commands: {
                data: [],
                input: {type: Array},
                output: {type: null},
            },
        }
    }

    init = () => {
        
            import(this.ports.config.value?.loaderUrl).then(module => {
                //Add whatever else you need to initialize
                module.createUnityInstance(this.props.canvas, this.ports.config.value, (progress) => {}).then((unityInstance) => {
                    this.props.instance = unityInstance;
                }).catch((message) => {alert(message)});
            })


            this.ports.commands.data.forEach(o => {
                this.addPort(o.function, {
                    input: {type: o.type},
                    output: {type: null},
                    onUpdate: (user) => {
                        // let data = JSON.stringify(user.data)
                        // let data = user.data.toString()
                        let data = user.value
                        if (typeof data === 'boolean') data = (data) ? 1 : 0
                        if (this.props.instance) this.props.instance.SendMessage(o.object, o.function, data);
                    }
                })
            })
    }

    deinit = () => {
       if (this.props.instance.Quit instanceof Function) this.props.instance.Quit()
    }
}

// export class Unity{

//     static id = String(Math.floor(Math.random()*1000000))
    
//     constructor(info, graph) {

//         // Unity instance window callbacks that we call from .jslib in Unity.
//         // Modify these signatures to respond to whatever you want to send from Unity.
//         window.PassUnityEvent = (param) => {
//             this.update('unityEvent', {value: param})
//         }

//         this.props = {
//             instance: null
//         }
//         this.props.canvas = document.createElement('canvas')
//         this.props.canvas.style = `width: 100%; height: 100%;`

//         this.ports = {
//             element: {
//                 data: this.props.canvas,
//                 input: {type: undefined},
//                 output: {type: Element},
//             },
//             webbuild: {
//                 input: {type: null},
//                 output: {type: null},
//             },
//             webconfig: {
//                 input: {type: null},
//                 output: {type: null},
//             },
//             unityEvent: {
//                 input: {type: null},
//                 output: {type: 'string'},
//                 onUpdate: (user) => { 
//                     this.ports.onUnityEvent.data(user.value)
//                 }
//             },

//             // Declare functions that will be called by Unity instance window callbacks here.
//             onUnityEvent: {
//                 data: (param) => {
//                     console.log("OnUnityEvent with parameters call" + param)
//                 },
//                 input: {type: Function},
//                 output: {type: 'string'}
//             },

//             // Declare commands that can be sent to Unity
//             commands: {
//                 data: [],
//                 input: {type: Array},
//                 output: {type: null},
//             },
//         }
//     }

//     init = () => {

//         let onError = () => { };
        
//         //Add whatever else you need to initialize
//         if (this.ports.webbuild.data){
//             console.log(this.ports.webbuild.data)
//             this.ports.webbuild.data.createUnityInstance(this.props.canvas, this.ports.webconfig.data.config, () =>
//             { }).then((unityInstance) => {
//                 console.log('created', unityInstance, this.props.canvas)
//                 this.props.instance = unityInstance;
//             }).catch(onError);
//         }

//         this.ports.commands.data.forEach(o => {
//             this.addPort(o.function, {
//                 input: {type: o.type},
//                 output: {type: null},
//                 onUpdate: (user) => {
//                     // let data = JSON.stringify(user.data)
//                     // let data = user.data.toString()
//                     let data = user.data
//                     if (typeof data === 'boolean') data = (data) ? 1 : 0
//                     if (this.props.instance) this.props.instance.SendMessage(o.object, o.function, data);
//                 }
//             })
//         })
        
//     }

//     deinit = () => {
//        if (this.props.instance.Quit instanceof Function) this.props.instance.Quit()
//     }
// }