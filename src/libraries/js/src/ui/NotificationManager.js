export class NotificationManager{

    constructor(){

        this.active = false

        this.buffer = []
        this.displayTime = 4000
        this.hiddenPosition = `translateX(calc(100% + 50px))`

        this.notification = document.createElement('div')
        this.notification.style = `
            position: absolute;
            top: 0;
            right: 0;
            display: flex; 
            align-itens: center;
            background: black;
            border: 1px solid gray;
            border-right: none;
            border-radius: 25px 0px 0px 25px;
            margin: 25px 0px;
            padding: 25px;
            width: 350px;
            height: 100px;
            transform: ${this.hiddenPosition};
            transition: .75s;
            z-index: 1000;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        `

        document.body.insertAdjacentElement('beforeend', this.notification)

    }

    throw = (msg) => {
        if (!this.active) this._show(msg)
        else this.buffer.push(msg)
    }

    _hide = () => {
        this.notification.style.transform = this.hiddenPosition

        setTimeout(() => {
            if (this.buffer.length > 0) this._show(this.buffer.shift())
            else this.active = false
        }, this.displayTime)
    }

    _show = (msg) => {
        this.active = true
        this.notification.innerHTML = msg
        this.notification.style.transform = ''
        setTimeout(this._hide, this.displayTime)
    }
}