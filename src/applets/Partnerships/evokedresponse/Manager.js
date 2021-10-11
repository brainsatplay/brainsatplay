export class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            state: null,
            userReadouts: {},
            songs: [{
                name: 'Lo-Fi Productivity',
                artist: 'Evoked Response',
                link: 'https://soundcloud.com/evoked-response-293309559/evoked-response-lofi-productivity'
            }]
        }
        

        this.props.container = document.createElement('div')
        this.props.container.id = this.props.id
        this.props.container.style = 'position: relative;'

        this.props.audio = document.createElement('audio')
        this.props.audio.autoplay = true

        this.props.source = document.createElement('source')
        this.props.source.type = 'audio/mp3'
        this.props.source.src = document.getElementById('audiosource').src

        this.props.audio.insertAdjacentElement('beforeend', this.props.source)

        this.props.img = document.createElement('img')
        this.props.img.style = 'height: min(50vh, 50vw); width: min(50vh, 50vw); opacity: 80%;'


        this.props.info = document.createElement('div')
        this.props.info.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-wrap: wrap; align-items: center; justify-content: center;'
        
        this.props.info.innerHTML = `
            <h3 style="margin: 0px; margin-bottom; 5px;">${this.props.songs[0].name}</h3>
            <a style="font-size: 80%;" href="${this.props.songs[0].link}" target="_blank" rel="noopener noreferrer">${this.props.songs[0].artist}</a>
        `

        this.props.container.insertAdjacentElement('beforeend', this.props.img)
        this.props.container.insertAdjacentElement('beforeend', this.props.info)

        // Port Definition
        this.ports = {
            data: {
                input: {type: Object},
                output: {type: null},
                onUpdate: (user) => {
                   console.log(user)
                },
            }, 
            image: {
                input: {type: 'string'},
                output: {type: null},
                onUpdate: (user) => {
                    this.props.img.src = user.data //document.getElementById('background').src
                },
            }, 
            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            }
        }
    }

    init = () =>  { }

    deinit = () => {}
}
