export class Mouse{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            speed: {default: 1, min: 0, max: 10, step: 0.01}
        }

        this.props = {
            moveRight: false,
            moveLeft: false,
            moveUp: false,
            moveDown: false,
            looping: false,
            cursorSize: {
                width: 15,
                height: 20
            },
            globalStyles: []
        }
    }

    init = () => {

        this.props.x = window.innerWidth/2
        this.props.y = window.innerHeight/2
        this.props.py = 0
        this.props.px = 0
        
        // Image of cursor
        this.props.cursor = document.getElementById("brainsatplay-cursor"); 
        if (this.props.cursor == null){
            document.body.insertAdjacentHTML('beforeend', `<img id="brainsatplay-cursor" src="https://media.geeksforgeeks.org/wp-content/uploads/20200319212118/cursor2.png" width="${this.props.cursorSize.width}" height="${this.props.cursorSize.height}" />`)
            this.props.cursor = document.getElementById("brainsatplay-cursor"); 
        }
        this.props.cursor.style.zIndex = 10000000;
        this.props.cursor.style.pointerEvents = 'none'
        this.props.cursor.style.position = 'absolute'
        this.props.mutex = false;

        document.body.style.cursor = 'none'


        // Add hover repacement for styling
        let bcifiyCSS = (selector) => {
            var style = "";
            console.log('running in')

            console.log(document.styleSheets)
            for (var i in document.styleSheets) {
                var rules = document.styleSheets[i].cssRules;
                for (var r in rules) {
                    if(rules[r].cssText && rules[r].selectorText){
                        if(rules[r].selectorText.indexOf(selector) > -1){
                            var regex = new RegExp(selector,"g")
                            var text = rules[r].cssText.replace(regex,"");
                            style += text+"\n";
                        }
                    }
                }
            }

            let globalStyle = document.createElement('style');
            globalStyle.innerHTML = style
            document.getElementsByTagName('head')[0].appendChild(globalStyle);
            this.props.globalStyles.push(globalStyle)
        };

        console.log('running')

        bcifiyCSS(":hover")
        let globalStyle = document.createElement('style');
        globalStyle.innerHTML = `
        * {
            cursor: none
        }
        `;
        document.head.appendChild(globalStyle);
        this.props.globalStyles.push(globalStyle)
  
        window.addEventListener("mouseClick", this._mouseClick)
        window.addEventListener("mousemove", this._mouseMove);
  
        this.props.cursor.style.left = this.props.x + 'px'
        this.props.cursor.style.top = this.props.y + 'px'
        this.props.looping = true

        let animate = () => {

            if (this.props.looping){
                if (this.props.moveRight) this.right()
                if (this.props.moveLeft) this.left()
                if (this.props.moveUp) this.up()
                if (this.props.moveDown) this.down()

                this.props.cursor.style.left = `${this.props.x}px`
                this.props.cursor.style.top = `${this.props.y}px`

                setTimeout(() => {animate()}, 1000/60)
            }
        }
    
        animate()
    }

    deinit = () => {
        var cursor = document.getElementById("brainsatplay-cursor"); 
        if (cursor != null) cursor.remove()

        document.body.style.cursor = 'default'
        this.props.looping = false

        window.removeEventListener("mouseClick", this._mouseClick)
        window.removeEventListener("mousemove", this._mouseMove);
        this.props.globalStyles.forEach(style => {
            document.head.removeChild(style);
        })
    }

    default = (userData) => {
        return userData
    }

    right = (userData) => {
        if (userData) this._getDecision(userData, 'moveRight')
        let desiredPos = this.props.x + this.params.speed
        if (desiredPos < (window.innerWidth - this.props.cursorSize.width)) this.props.x = desiredPos
    }

    left = (userData) => {
        if (userData) this._getDecision(userData, 'moveLeft')
        let desiredPos = this.props.x - this.params.speed
        if (desiredPos > 0) this.props.x = desiredPos
    }

    up = (userData) => {
        if (userData) this._getDecision(userData, 'moveUp')
        let desiredPos = this.props.y - this.params.speed
        if (desiredPos > 0) this.props.y = desiredPos
    }

    down = (userData) => {
        if (userData) this._getDecision(userData, 'moveDown')
        let desiredPos = this.props.y + this.params.speed
        if (desiredPos < (window.innerHeight - this.props.cursorSize.height)) this.props.y = desiredPos
    }

    click = (userData) => {
        let decision = this._getDecision(userData)
        if (decision < 1) this._mouseClick()
    }

    _getDecision(userData, command){
        let choices = userData.map(u => Number(u.data))
        let mean = this.session.atlas.mean(choices)
        if (command) this.props[command] = mean
        return mean
    }

    _mouseClick = () => {          
        // gets the object on image cursor position
        var tmp = document.elementFromPoint(this.props.x + this.props.px, this.props.y + this.props.py); 
        this.props.mutex = true;
        tmp.click();
        this.props.cursor.style.left = (this.props.px + this.props.x) + "px";
        this.props.cursor.style.top = (this.props.py + this.props.y) + "px";
    }


    _mouseMove = (e) => {
            // Gets the x,y position of the mouse cursor
            this.props.x = e.clientX;
            this.props.y = e.clientY;
            
  
            // sets the image cursor to new relative position
            this.props.cursor.style.left = (this.props.px + this.props.x) + "px";
            this.props.cursor.style.top = (this.props.py + this.props.y) + "px";
    }
}