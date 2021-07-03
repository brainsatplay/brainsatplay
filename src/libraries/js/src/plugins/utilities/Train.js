import bci from 'bcijs/browser.js'
import {eegmath} from '../../utils/eegmath';

export class Train{

    static id = String(Math.floor(Math.random()*1000000))
    // static hidden = true
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.ports = {
            mode: {
                input: {type: 'string'},
                output: {type: null},
                default: 'Motor Imagery',
                options: ['Motor Imagery', 'Other'],
                onUpdate: (userData) => {
                    this.params.mode = userData[0].data
                }
            }
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),            
            bci: bci,
            models: {
                csp: null,
                lda: null
            }
        }
    }

    init = () => {

        let HTMLtemplate = () => {
            return `
            <div class="training-prompt-container">
                <div id='${this.props.id}prompt' class="training-prompt">
                    <div>
                        <h2>${this.params.mode}</h2>
                        <p>Latest Performance: <span id="${this.props.id}performance"></spam></p>
                    </div>
                    <div>
                        <button class="brainsatplay-default-button disabled">Train Now</button>
                    </div>
                </div>
            </div>
            `
        }

        let setupHTML = (app) => {
            this.props.performance = document.getElementById(`${this.props.id}performance`);
            this.props.performance.innerHTML = '-'
        }
        return {HTMLtemplate, setupHTML}
    }

    deinit = () => {}
}