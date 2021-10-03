/* 

    This is an example plugin for the Brains@Play software library. 

*/

export class Plugin{

    static id = String(Math.floor(Math.random()*1000000)) // ensures that duplicates of the same class are linked
    
    constructor(label, session) {
        this.label = label // name of the plugin (required)
        this.session = session // session that the plugin is used in (required)
        

        this.props = { id: String(Math.floor(Math.random() * 1000000)) } // properties of the plugin

        this.props.container = document.createElement('div') // create an element for the plugin (optional)
        this.props.container.id = this.props.id
        this.props.container.innerHTML = 'Hello World'

        
        this.ports = {} // declare the functionality of the plugin (required)

        this.ports.default = {
            edit: false, // hide plugin from studio gui
            input: {type: undefined}, // declare type (e.g. 'number', 'string', Object, Element, Function, null (i.e. nothing expected), undefined (i.e. any type))
            output: {type: undefined}, 
            meta: {}, // pass metadata associated with the port
            onUpdate: (user) => {

                // user = the previous port + some additional information about the user
                // user.id = Unique identifier
                // user.username = Assigned username
                // user.data = Data from the previous port
                // user.meta = Metadata from the previous port

                // do something here
                console.log(user)
                return user
            }
        }

        this.ports.element = {
            edit: false,
            input: {type: null},
            output: {type: Element},
            data: this.props.container // this is passed to connected plugins
        }
    }

    init = () => {}

    deinit = () => {}
}