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
        this.props.sub = this.session.state.subscribeTrigger('commandResult', (o)=> {
            console.log('MSG', o)
            if (o.msg === 'currentUsers'){
                o.users.forEach(this._addUser)
            } else if (o.msg === 'userAdded'){
                this._addUser(o.user)
            } else if (o.msg === 'userRemoved'){
                let user = this.props.users.get(o.user.id)
                user.element.remove()
                this.props.users.remove(o.user.id)
            }
        })
    }

    deinit = () => {
        this.state.unsubscribeTrigger('commandResult', this.props.sub);
    }

    _addUser = (user) => {
        user.element = document.createElement('div')
        console.log(user.id , this.session.info.auth.id)
        user.element.innerHTML = (user.id != this.session.info.auth.id) ? user.username : 'Me'
        this.props.container.insertAdjacentElement('beforeend', user.element)
        console.log(user)
        this.props.users.set(user.id,user)
    }
}