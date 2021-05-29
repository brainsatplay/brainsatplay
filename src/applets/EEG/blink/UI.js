class UI{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session, params={}) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session
        this.params = {}

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }
        

        // Port Definition
        this.ports = {
            default: {
                defaults: {
                    input: [{username: 'Username', data: [false,false], meta: {label: 'Waiting for Data'}}]
                }
            }
        }

        this.sub1 = undefined;
        
        this.leftred = 255;
        this.rightred = 255;
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div id='${this.props.id}' style='height:100%; width:100%; display: flex; align-items: center; justify-content: center;'>
                    <div id="${this.props.id}-left" style="margin: 25px; border-radius: 50%; background: rgb(255,255,255); transition: opacity 0.12s;">
                        <div id="${this.props.id}-leftiris" style="width: 50%; height: 50%; border-radius: 50%; background: cyan; transform: translate(50%,50%)">
                        <div id="${this.props.id}-leftpupil" style="width: 50%; height: 50%; border-radius: 50%; background: black; transform: translate(50%,50%)"></div>
                        </div>
                    </div>
                    <div id="${this.props.id}-right" style="margin: 25px; border-radius: 50%; background: rgb(255,255,255); transition: opacity 0.12s;">
                        <div id="${this.props.id}-rightiris" style="width: 50%; height: 50%; border-radius: 50%; background: cyan; transform: translate(50%,50%)">
                        <div id="${this.props.id}-rightpupil" style="width: 50%; height: 50%; border-radius: 50%; background: black; transform: translate(50%,50%)"></div>
                        </div>
                    </div> 
                </div>`
        }


        let setupHTML = (app) => {
         //Add whatever else you need to initialize
         this.responsive()

        }

        return {HTMLtemplate, setupHTML}
    }

    default = (userData) => {
        userData.forEach(u => {
            let leftEye = document.getElementById(this.props.id+"-left")
            let rightEye = document.getElementById(this.props.id+"-right")
            let blink = u.data
            let leftOpacity = 1-(blink[0]? 1 : 0)
            let rightOpacity = 1-(blink[1]? 1 : 0)
            let newcolor = 'rgb('+(100+Math.random()*155)+','+(100+Math.random()*155)+','+(100+Math.random()*155)+')';
            if(!blink[0]) { 
                this.leftred-=0.5;    
                leftEye.style.background = 'rgb(255,'+this.leftred+','+this.leftred+')';
            } else {
                this.leftred = 255;
                document.getElementById(this.props.id+"-leftiris").style.background = 'gold';
            }
            if(this.leftred <= 50) {
                this.leftred = 255;
                leftEye.style.background = 'rgb(255,'+this.leftred+','+this.leftred+')'; 
                document.getElementById(this.props.id+"-leftiris").style.background = newcolor;      
                leftOpacity = 0;
            }
            if(!blink[1]) {
                this.rightred-=0.5;
                rightEye.style.background = 'rgb(255,'+this.rightred+','+this.rightred+')';
            } else {
                this.rightred = 255;
                document.getElementById(this.props.id+"-rightiris").style.background = 'gold';
            } 
            if(this.rightred <= 50){
                this.rightred = 255;
                leftEye.style.background = 'rgb(255,'+this.leftred+','+this.leftred+')';
                document.getElementById(this.props.id+"-rightiris").style.background = newcolor;
                rightOpacity = 0;
            }
            leftEye.style.opacity = leftOpacity;
            rightEye.style.opacity = rightOpacity;
        })
        return userData
    }

    deinit = () => {
        cancelAnimationFrame(this.animate);
    }

    responsive = () => {
        let container = document.getElementById(this.props.id)
        let leftEye = document.getElementById(this.props.id+"-left")
        let rightEye = document.getElementById(this.props.id+"-right")
        leftEye.style.width = leftEye.style.height = rightEye.style.width = rightEye.style.height = `${Math.min(container.clientWidth,container.clientHeight)/4}px`
    }
}

export {UI}