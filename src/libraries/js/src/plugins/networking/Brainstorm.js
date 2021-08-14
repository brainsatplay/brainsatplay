export class Brainstorm {

    static id = String(Math.floor(Math.random() * 1000000))

    constructor(label, session, params = {}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            subscriptions: {},
            users: {}
        }

        this.ports = {
            default: {
                input: { type: undefined },
                output: { type: null },
                onUpdate: (userData) => {
                    // Register as New Port
                    let u = userData[0]
                    let port = u.meta.source
                    let sessionId = u.meta.session

                    // Register New Port
                    if (port != null) {
                        let label = port
                        let splitId = label.split('_')
                        let sourceName = splitId[0]
                        let sourcePort = splitId[1] ?? 'default'

                        // Register New Port
                        this.session.graph.addPort(
                            this,
                            port,
                            {
                                input: { type: null },
                                output: { type: undefined },
                                onUpdate: (userData) => {
                                    return userData // Pass through to update state data and trigger downstream nodes
                                }
                            }
                        )

                        // Subscribe in Session
                        if (sessionId != null) {
                            if (this.props.subscriptions[label] == null) {
                                if (this.props.subscriptions[label] == null) this.props.subscriptions[label] = []

                                let found = this.session.graph.findStreamFunction(label)

                                if (found == null) {

                                    let _brainstormCallback = (userData) => {
                                        this.session.graph.registry.local[sourceName].registry[sourcePort].callbacks.forEach((f, i) => {
                                            if (f instanceof Function) f(userData)
                                        })
                                    }

                                    // Create Brainstorm Stream
                                    let subId1 = this.session.streamAppData(label, this.session.graph.registry.local[sourceName].registry[sourcePort].state, sessionId, () => { })
                                    this.props.subscriptions[label].push({ id: subId1, target: null })

                                    this._addUserSubscription(this.session.info.auth.id, label, sessionId, _brainstormCallback, this.session.info.auth.username) // Subscribe to yourself

                                    console.log(this.session.state.data, this.session.state.data[sessionId])

                                    // console.log(this.session.state)

                                    // Subscribe to each user as they are added to the session
                                    if (this.session.state.data[sessionId]){
                                        let subId2 = this.session.state.subscribe(sessionId, (sessionInfo) => {
                                            
                                            if (sessionInfo.userLeft) {
                                                let key = (sessionInfo.userLeft === this.session.info.auth.id) ? `${label}` : `${sessionId}_${sessionInfo.userLeft}_${label}`
                                                // Unsubscribe from all keys
                                                Object.keys(this.props.users[sessionInfo.userLeft]).forEach(label => {
                                                    this.session.state.unsubscribe(key, this.props.users[sessionInfo.userLeft][label])
                                                })

                                                if (this.params.onUserDisconnected instanceof Function) this.params.onUserDisconnected([{id: sessionInfo.userLeft}])
                                            }

                                            // Add Subscription to Each User in the Game
                                            if (sessionInfo.users){
                                                Object.keys(sessionInfo.users).forEach(userId => {
                                                    this._addUserSubscription(userId, label, sessionId, _brainstormCallback, sessionInfo.users[userId])
                                                })
                                            }
                                        })

                                        this.props.subscriptions[label].push({ id: subId2, target: null })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    init = () => { }

    deinit = () => { }

    _addUserSubscription = (userId, label, sessionId, callback, username) => {

        let _sendData = (userData) => {
            let copy = this.session.graph.runSafe(this, label, userData)
            callback(copy)
        }

        if (!(userId in this.props.users)) this.props.users[userId] = {}
        if (!(label in this.props.users[userId])){

            let key = (userId === this.session.info.auth.id) ? `${label}` : `${sessionId}_${userId}_${label}`
            let toPass = (Array.isArray(this.session.state.data[key])) ? this.session.state.data[key] : [{id: userId, username, meta: {}}]
            if (this.params.onUserConnected instanceof Function) this.params.onUserConnected(toPass)
            if ('data' in toPass[0]) _sendData(toPass) // NOTE: Might send twice
            this.props.users[userId][label] = this.session.state.subscribe(key, _sendData)
        }
    }

    _getBrainstormData(label, sessionId) {
        if (label && sessionId) {
            label = label.replace('brainstorm_', '')
            let brainstorm = this.session.getBrainstormData(sessionId, [label], 'app', 'plugin')
            return brainstorm
        }
    }
}