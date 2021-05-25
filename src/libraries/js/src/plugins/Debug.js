export class Debug{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
    }

    init = () => {}

    deinit = () => {}

    update = (userData) => {
        userData.forEach(u => {
            console.log(u)
        })
        return userData
    }
}