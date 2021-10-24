import { updateStatement } from "typescript"


export class Brainstorm {

    static id = String(Math.floor(Math.random() * 1000000))

    constructor(info, graph) {
        

        this.props = {
            subscriptions: {},
            users: {},
            states: {},
            sessionId: null
        }

        this.ports = {
            default: {
                input: { type: undefined },
                output: { type: null },
                onUpdate: async (user) => {
                    // Register as New Port
                    let port = user.meta.source
                    this.props.sessionId = this.app.props.sessionId

                    // Register New Port
                    if (port != null) {

                        let label = port.label

                        // Create Port
                        if (!(label in this.ports)){
                            await this.addPort(
                                label,
                                {
                                    value: user.value,
                                    input: { type: null },
                                    output: { type: undefined },
                                    onUpdate: (user) => {
                                        return user // Pass through to update state data and trigger downstream nodes
                                    }
                                }
                            )
                        }

                        // Subscribe in Session      
                        console.error(this.props.sessionId)                  
                        if (this.props.sessionId != null) {

                            if (!(port.label in this.props.states)) this.props.states[port.label] = {} // ensure state exists

                            // Create Subscription to New State
                            if (this.props.subscriptions[label] == null) {
                                if (this.props.subscriptions[label] == null) this.props.subscriptions[label] = []

                                let found = this.session.streamObj.streamTable.find((d => {
                                    if (d.prop === label) {
                                        return d
                                    }             
                                }))

                                if (found == null) {

                                    // Create Brainstorm Stream
                                    let subId1 = this.session.streamAppData(label, this.props.states[label], this.props.sessionId)
                                    this.props.subscriptions[label].push({ id: subId1, target: null })

                                    this._addUserSubscription(this.session.info.auth.id, port, this.props.sessionId, ()=>{}, this.session.info.auth.username) // Subscribe to yourself
                                    this._updateState(port) // init yourself

                                    // Subscribe to each user as they are added to the session
                                    if (this.session.state.data[this.props.sessionId]){

                                        let subId2 = this.session.state.subscribe(this.props.sessionId, (sessionInfo) => {
                                            
                                            if (sessionInfo.userLeft) {                                                
                                                if (this.ports.onUserDisconnected.data instanceof Function) this.ports.onUserDisconnected.data({id: sessionInfo.userLeft, username:this.props.users[sessionInfo.userLeft].username})

                                                // Unsubscribe from all keys
                                               this._unsubscribeUser(this.props.users[sessionInfo.userLeft])
                                            }

                                            // Add Subscription to Each User in the Game
                                            if (sessionInfo.users){
                                                Object.keys(sessionInfo.users).forEach(userId => {
                                                    let u = sessionInfo.userData.find(o => {
                                                        if (o.id === userId) return o
                                                    })

                                                    if (u) {
                                                        let p = u[port.label]
                                                        if (p instanceof Object){
                                                            if (!('label' in p)) p.label = port.label
                                                            this._addUserSubscription(userId, p, this.props.sessionId, ()=>{}, sessionInfo.users[userId])
                                                        }
                                                    }
                                                })
                                            }
                                        })

                                        this.props.subscriptions[label].push({ id: subId2, target: null })
                                    }
                                }
                            } 
                            
                            // Or Update State
                            else this._updateState(port)
                        }
                    }
                }
            },
            onUserConnected: {},
            onUserDisconnected: {}
        }
    }

    init = () => { }

    deinit = () => { 

        // Leave Session
        this.session.unsubscribeFromSession(this.props.sessionId);

        // Unsubscribe All Keys
        for (const user in this.props.users){
            this._unsubscribeUser(this.props.users[user])
        }

    }

    _unsubscribeUser = (user, label) => {

            // Unsubscribe from all keys
            Object.keys(user).forEach(label => {
                let key = (user.username === this.session.info.auth.id) ? `${label}` : `${this.props.sessionId}_${user.username}_${label}`
                if (label != 'username') this.session.state.unsubscribe(key, user[label]) // sometimes removed earlier
            })
    }

    _updateState = (port) => {
        // Update State (with limited information)
        let abstractedPort = {
            id: port.id,
            username: port.username,
            data: port.data,
            value: port.value,
            meta: port.meta,
        }
        delete abstractedPort.meta.source
        Object.assign(this.props.states[port.label], abstractedPort)
    }

    _addUserSubscription = (userId, port, id, callback, username) => {

        let label = port.label
        let _sendData = async (user) => {
            let port = this.getPort(label)
            port.edges.output.forEach(e => {e.update(user)})
        }

        if (!(userId in this.props.users)) this.props.users[userId] = {}
        if (!(label in this.props.users[userId])){

            let key = (userId === this.session.info.auth.id) ? `${label}` : `${id}_${userId}_${label}`

            let toPass = port

            // Default Info
            if (!('label' in toPass)) toPass.label = label
            if (!('id' in toPass)) toPass.id = userId
            if (!('username' in toPass)) toPass.username = username
            if (!('meta' in toPass)) toPass.meta = {}

            if (this.ports.onUserConnected.data instanceof Function) this.ports.onUserConnected.data(toPass)
            this.props.users[userId].username = username

            this.props.users[userId][label] = this.session.state.subscribe(key, _sendData)

            // this._updateState(toPass)
        }
    }
}