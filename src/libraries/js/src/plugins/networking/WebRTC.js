export class WebRTC{

    static id = String(Math.floor(Math.random()*1000000))
    static hidden = true

    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            channel: null,
            connected: false
        }

        this.ports = {
            url: {
                default: this.session.info.auth.url.href,
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
                    let valid = this.validURL(u.data)
                    if (valid){
                        this.params.url = u.data
                        this.session.graph.runSafe(this,'connected', [{data: true, forceUpdate: true}])
                    }
                }
            }, 
            connected: {
                default: false,
                input: {type: 'boolean'},
                output: {type: 'boolean'},
                onUpdate: (userData) => {
                    return new Promise(resolve => {
                        let choice = userData[0].data
                        if (choice){
                            let url = new URL(this.params.url)
                            if (this.props.channel == null){
                                this._createWebRTCConnection(url, () => {
                                    resolve([{data: true}])
                                })                             
                            }
                
                        } else {
                            this._closeDataChannel()
                            resolve([{data: false}])
                        }
                    })
                }
            }, 
            message: {
                input: {type: null},
                output: {type: undefined},
                onUpdate: (userData) => {
                    return userData
                }
            },
            send: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (userData) => {
                    if (this.props.channel != null){
                        this.props.channel.send(JSON.stringify(userData[0].data))

                    }
                }
            },
        }
    }

    init = () => {
        this.session.graph.runSafe(this, 'connected', [{data: true, forceUpdate: true}])
    }

    deinit = () => {
        this._closeDataChannel()
    }

    _closeDataChannel = () => {
        if (this.props.channel) this.props.channel.close()
    }

    _createWebRTCConnection = (url, connectCallback=()=>{}) => {
        const peerConnection = new RTCPeerConnection();
        const dataChannel = peerConnection.createDataChannel();
        
        // Enable textarea and button when opened
        dataChannel.addEventListener('open', event => {
            console.log('WebRTC opened')
            this.props.channel = dataChannel
            this.params.connected = true
            connectCallback()
        });
        
        // Disable input when closed
        dataChannel.addEventListener('close', event => {
            console.log('WebRTC closed')
            this.props.channel = null
            this.params.connected = false
        });

        window.onkeypress = () => {
            const message = 'sent'
            dataChannel.send(message);
        }

        // Append new messages to the box of incoming messages
        dataChannel.addEventListener('message', event => {
            const msg = event.data;
            console.log(msg)
            this.session.graph.runSafe(this,'message', [{data: msg, forceUpdate: true}])
        });
    }

    validURL = (str) => {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str)
      }
}