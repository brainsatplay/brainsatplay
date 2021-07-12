export class Brainstorm {

    static id = String(Math.floor(Math.random() * 1000000))

    constructor(label, session, params = {}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {
            subscriptions: {}
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

                                    // Get Changed Session Data
                                    let subId2 = this.session.state.subscribe(sessionId, (sessionInfo) => {
                                        let returned = this._getBrainstormData(label, sessionId)
                                        console.log(returned)
                                        let copy = this.session.graph.runSafe(this, label, returned)
                                        _brainstormCallback(copy)
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

    init = () => { }

    deinit = () => { }

    _getBrainstormData(label, sessionId) {
        if (label && sessionId) {
            label = label.replace('brainstorm_', '')
            let brainstorm = this.session.getBrainstormData(sessionId, [label], 'app', 'plugin')
            return brainstorm
        }
    }
}