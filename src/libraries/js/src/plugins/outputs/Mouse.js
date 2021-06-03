export class Mouse{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.props = {

        }
    }

    init = () => {

        this.props.x = null
        this.props.y = null
        this.props.py = 0
        this.props.px = 0
        
        // Image of cursor
        this.props.cursor = document.getElementById("brainsatplay-cursor"); 
        if (this.props.cursor == null){
            document.body.insertAdjacentHTML('beforeend', `<img id="brainsatplay-cursor" src="https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png" width="15" height="20" />`)
            this.props.cursor = document.getElementById("brainsatplay-cursor"); 
        }
        this.props.cursor.style.zIndex = 10000000;
        this.props.cursor.style.pointerEvents = 'none'
        this.props.cursor.style.position = 'absolute'
             
        this.props.mutex = false;

        // document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
        // document.body.requestPointerLock()
  
        // window.addEventListener("mouseup", this.mouseUp)
        // window.addEventListener("mousemove", this.mouseMove);
  
        /* The following function re-calculates px,py 
           with respect to new position
           Clicking on b1 moves the pointer to b2
           Clicking on b2 moves the pointer to b1 */
  
        // b1.onclick = function() {
        //     if (mutex) {
        //         mutex = false;
        //         px = b2.offsetLeft - x;
        //         py = b2.offsetTop - y;
        //     }
        // }
  
        // b2.onclick = function() {
        //     if (mutex) {
        //         mutex = false;
        //         px = b1.offsetLeft - x;
        //         py = b1.offsetTop - y;
        //     }
        // }

        let animate = () => {
            let middleX = window.innerWidth/2
            let middleY = window.innerHeight/2
            this.props.cursor.style.left = middleX + ((middleX) * (0.5*Math.sin(Date.now()/1000))) + 'px'
            this.props.cursor.style.top = middleY + ((middleY) * (0.5*Math.cos(Date.now()/1000))) + 'px'

            console.log(this.props.cursor.style.left, this.props.cursor.style.top)
            setTimeout(() => {animate()}, 1000/60)
        }

        animate()

    }

    deinit = () => {
        var cursor = document.getElementById("brainsatplay-cursor"); 
        if (cursor != null) cursor.remove()

        window.removeEventListener("mouseup", this.mouseUp)
        window.removeEventListener("mousemove", this.mouseMove);
    }

    default = (userData) => {
        userData.forEach(u => {
            console.log(u)
        })
        return userData
    }

    mouseUp = (e) => {          
        // gets the object on image cursor position
        var tmp = document.elementFromPoint(this.props.x + this.props.px, this.props.y + this.props.py); 
        this.props.mutex = true;
        tmp.click();
        this.props.cursor.style.left = (this.props.px + this.props.x) + "px";
        this.props.cursor.style.top = (this.props.py + this.props.y) + "px";
    }


    mouseMove = (e) => {
            // Gets the x,y position of the mouse cursor
            this.props.x = e.clientX;
            this.props.y = e.clientY;
            
  
            // sets the image cursor to new relative position
            this.props.cursor.style.left = (this.props.px + this.props.x) + "px";
            this.props.cursor.style.top = (this.props.py + this.props.y) + "px";
    }
}