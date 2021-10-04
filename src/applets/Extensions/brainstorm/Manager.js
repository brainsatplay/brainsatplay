export class Manager{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session){
        this.label = label;
        this.session = session;

        this.props = {
            container: document.createElement('div'),
            canvas: document.createElement('canvas'),
            users: new Map(),
            sub: null,
            buffer: [],
            active: false,
            looping: false,
        }

        this.props.container.style = 'width: 100%; height: 100%; padding: 50px;'
        this.props.canvas.style = 'width: 100%; height: 100%;'

        this.ports = {
            // default: {
            //     input: {type: undefined},
            //     output: {type: undefined},
            //     onUpdate: (user) => {
            //         console.log(user)
            //     }
            // },
            element: {
                input: {type: null},
                output: {type: Element},
            }
        }
    }

    init = () => {

        this.session.graph.runSafe(this, 'element', {data: this.props.container})

        this.session.info.auth.username = 'user' + Math.floor(10000*Math.random())
        this.session.info.auth.url = new URL(`${location.protocol}//localhost:443`)

        this.props.sub = this.session.state.subscribeTrigger('commandResult', (o)=> {
            if (o.msg === 'resetUsername'){
                this.session.resetAuth(o)
                this.props.buffer.forEach(this._addUser)
                this.props.active = true
            } else if (o.msg === 'currentUsers'){
                if (this.props.active) o.users.forEach(this._addUser)
                else o.users.forEach((user) => {this.props.buffer.push(user)})
            } else if (o.msg === 'userAdded'){
                if (this.props.active) this._addUser(o.user)
                else this.props.buffer.push(o.user)
            } else if (o.msg === 'userRemoved'){
                this._removeUser(this.props.users.get(o.user.id))
            }
        })

        this.props.looping = true
        this._animate()
    }

    deinit = () => {
        this.props.looping = false
        this.session.state.unsubscribeTrigger('commandResult', this.props.sub);
    }

    _animate = () => {

        if (this.props.looping){


            setTimeout(this._animate, 1000/60)
        }
    }

    _addUser = (user) => {
        user.element = document.createElement('div')

        if (user.id === this.session.info.auth.id){
            user.element.innerHTML = 'Me'
            this.session.notifications.throw(`<p>You joined the <strong>Brainstorm</strong>!</p>`)
        } else {
            user.element.innerHTML = user.username
            this.session.notifications.throw(`<p>${user.username} joined the <strong>Brainstorm</strong>!</p>`)
        }

        this.props.container.insertAdjacentElement('beforeend', user.element)
        this.props.users.set(user.id,user)
    }

    _removeUser = (user) => {
        user.element.remove()
        this.props.users.remove(user.id)
        this.session.notifications.throw(`<p>${user.username} left the <strong>Brainstorm</strong></p>`)
    }
}