//Example Applet for integrating with the UI manager
export class AppletExample {
    constructor(
        appendTo=document.body,
        settings=[]
    ) {

    }

    //Required template functions

    init() {
        this.AppletHTML = 
            new DOMFragment(
                this.HTMLtemplate,
                this.parentNode,
                this.renderProps,
                ()=>{this.setupHTML();},
                undefined,
                "NEVER"
                ); //Changes to this.props will automatically update the html template if "NEVER" is changed to "FRAMERATE" or another value
    }

    deinit() {

    }

    onresize() {

    }

    configure(settings) {
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //Add anything else for internal use below


} 