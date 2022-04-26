/* 

    This is an example plugin for the Brains@Play software library. 

*/

export class Blank {

    static id = String(Math.floor(Math.random()*1000000)) // ensures that duplicates of the same class are linked
    
    constructor(info, graph) {
        

        // LABEL (required)
         // name of the plugin

        // SESSION (required)
         // session that the plugin is used in 

        // ADded AFTER CONSTRUCTION
        // this.app: The application that this plugin is running in


        // EXTERNAL DEPENDENCIES (e.g. ['https://cdn.plot.ly/plotly-2.0.0.min.js'])
        this.dependencies = []

        // PROPS
        this.props = { id: String(Math.floor(Math.random() * 1000000)) } // properties of the plugin

        this.props.container = document.createElement('div') // create an element for the plugin (optional)

        // PORTS (required)
        this.ports = {} // declare the functionality of the plugin (specific ports are optional)


        /* THE DEFAULT PORT
            The default port is special. It is used whenever a specific port isn't specified in the graph 
            (i.e. {target: 'plugin:default'} === {target: 'plugin'}).

            This example toggles between true and false when anything is sent to the port.
        */

        this.ports.default = {

            // PORT DATA
            data: true, // the current state of the port (listened to by downstream plugins). If not undefined, this will be passed downstream on initialization.
            meta: {}, //  metadata associated with the port

            // PORT INFORMATION
            // Options: 'number', 'string', Object, Element, Function, null (i.e. nothing expected), undefined (i.e. any type)
            input: {type: undefined}, // determines which ports can send data to this port
            output: {type: undefined}, // denotes the output data format
            analysis: ['eegcoherence'], // required analysis functions to run on data streams (e.g. 'eegfft', 'eegcoherence', etc.)

            // OPTIONAL PORT PARAMETERS
            edit: false, // whether the plugin is visible from the Studio GUI

            // PORT FUNCTIONALITY
            // this function runs whenever data updates on an upstream port
            onUpdate: (user) => {

                // USER OBJECT FORMAT
                // user = the previous port + some additional information about the user
                // user.id = Unique identifier
                // user.username = Assigned username
                // user.data = Data from the previous port
                // user.meta = Metadata from the previous port

                user.data = !this.ports.default.data // example manipulation of the user object
                return user // update the port state 
            }
        }


        /* EXAMPLE CUSTOM PORT
            This is an example custom port that handles an Element assigned to this plugin. It functions in the same way as the default port, but is specifid as {target: 'plugin:element'}
        */
        this.ports.element = {
            edit: false,
            input: {type: null},
            output: {type: Element},
            data: this.props.container
            // since no onUpdate function is provided, this will always pass the this.props.container object whenever it is connected to a new plugin 
        }
    }

   /* THE INIT METHOD (required)
        Runs immediately when the plugin is added to the graph
    */
    init = () => {
        this.props.container.innerHTML = 'Hello World' // sets the content of the plugin element
    }

    /* THE DEINIT METHOD (required)
        Runs when the plugin is removed in the graph
    */
    deinit = () => {
        this.props.container.remove()
    }
}