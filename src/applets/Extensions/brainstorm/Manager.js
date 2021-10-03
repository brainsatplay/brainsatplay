export class Manager{
    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session){
        this.label = label;
        this.session = session;

        this.props = {
            container: document.createElement('div'),
            users: new Map(),
            sub: null
        }

        this.props.container.style = 'width: 100%; height: 100%;'

        this.ports = {
            // default: {
            //     input: {type: undefined},
            //     output: {type: undefined},
            //     onUpdate: (user) => {
            //         console.log(user)
            //     }
            // },
            element: {
                data: this.props.container
            }
        }
    }

    init = () => {
        this.session.info.auth.username = 'user' + Math.floor(10000*Math.random())
        this.session.info.auth.url = new URL(`${location.protocol}//localhost:443`)

        console.log('SuBSCRIBED')
        this.props.sub = this.session.state.subscribeTrigger('commandResult', (o)=> {
            console.log(o)
            if (o.msg === 'currentUsers'){
                o.users.forEach(this._addUser)
            } else if (o.msg === 'userAdded'){
                this._addUser(o.user)
            } else if (o.msg === 'userRemoved'){
                this._removeUser(this.props.users.get(o.user.id))
            }
        })

        setTimeout(() => {
            // this.session.login(true, this.session.info.auth, () => {
            //     console.log('connected', this.session.info.auth)
            // })
        }, 1000)
    }

    deinit = () => {
        this.session.state.unsubscribeTrigger('commandResult', this.props.sub);
    }

    _addUser = (user) => {
        user.element = document.createElement('div')
        this.session.notifications.throw(`${user.username} joined the Brainstorm!`)
        user.element.innerHTML = (user.id != this.session.info.auth.id) ? user.username : 'Me'
        this.props.container.insertAdjacentElement('beforeend', user.element)
        this.props.users.set(user.id,user)
    }

    _removeUser = (user) => {
        user.element.remove()
        this.props.users.remove(user.id)
        this.session.notifications.throw(`${user.username} left the Brainstorm`)
    }
}