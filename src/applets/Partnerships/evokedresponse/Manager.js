import {Plugin} from '../../../libraries/js/src/plugins/Plugin'

export class Manager extends Plugin {

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        super(label, session)

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            state: null,
            songs: [{
                name: 'Lo-Fi Productivity',
                artist: 'Evoked Response',
                link: 'https://soundcloud.com/evoked-response-293309559/evoked-response-lofi-productivity'
            }]
        }
        

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = 'position: relative;'

        // this.props.audio = document.createElement('audio')
        // this.props.audio.autoplay = true

        // this.props.source = document.createElement('source')
        // this.props.source.type = 'audio/mp3'
        // this.props.source.src = document.getElementById('audiosource').src

        // this.props.audio.insertAdjacentElement('beforeend', this.props.source)

        this.props.img = document.createElement('img')
        this.props.img.style = 'height: min(50vh, 50vw); width: min(50vh, 50vw); opacity: 30%; transition: 2.0s;'

        this.props.button = document.createElement('button')
        this.props.button.innerHTML = 'Loading...'
        this.props.button.classList.add('brainsatplay-default-button')
        this.props.button.classList.add('disabled')
        this.props.button.onclick = () => {
            this.update('button', {data: true})
        }

        // this.props.msg = document.createElement('div')
        // this.props.msg.style = 'font-size: 80%;'
        // this.props.msg.innerHTML = 'Loading...'

        this.props.msg = document.createElement('div')
        this.props.msg.style = `
        position: absolute; z-index: 0; top: 50%; left: 50%; transform: translate(-50%, -50%); 
        display: flex;
        flex-direction: column;
        align-content: center;
        align-items: center;`

        let loadingAnimation = document.createElement('div')
        loadingAnimation.classList.add('loading-animation')
        let loadingMessage = document.createElement('p')
        // loadingMessage.innerHTML = `Loading file. Please wait...`

        this.props.msg.insertAdjacentElement('beforeend', loadingAnimation)
        this.props.msg.insertAdjacentElement('beforeend', loadingMessage)

        this.props.info = document.createElement('div')
        this.props.info.style = 'position: absolute; z-index: 1; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-wrap: wrap; align-items: center; justify-content: center;'
        
        this.props.info.innerHTML = `
            <h3 style="margin: 0px; margin-bottom; 5px;">${this.props.songs[0].name}</h3>
            <a style="font-size: 80%;" href="${this.props.songs[0].link}" target="_blank" rel="noopener noreferrer">${this.props.songs[0].artist}</a>
        ` 

        this.props.container.insertAdjacentElement('beforeend', this.props.msg)

        this.props.container.insertAdjacentElement('beforeend', this.props.img)
        this.props.container.insertAdjacentElement('beforeend', this.props.info)

        // Port Definition
        this.ports = {
            data: {
                input: {type: Object},
                output: {type: null},
                onUpdate: (user) => {
                //    console.log(user)
                },
            }, 
            image: {
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (user) => {
                    if (typeof user.data  === 'string') this.props.img.src = user.data //document.getElementById('background').src
                },
            },
            ready: {
                input: {type: 'boolean'},
                output: {type: null},
                onUpdate: (user) => {
                    if (user.data === true) {
                        this.props.img.style.opacity = '80%'
                        this.props.msg.style.display = 'none'
                    } else {
                        this.props.img.style.opacity = '30%'
                        this.props.msg.style.display = 'block'
                    }
                }
            },
            button: {
                input: {type: null},
                output: {type: 'boolean'}
            }, 
            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            }
        }
    }

    init = () =>  { 
        this.props.img.src = this.ports.image.data 
    }

    deinit = () => {}
}
