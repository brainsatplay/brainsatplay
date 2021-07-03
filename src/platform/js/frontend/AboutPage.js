
import { DOMFragment } from '../../../libraries/js/src/ui/DOMFragment';


export class AboutPage{
    constructor(parentNode, toggle){
        this.parentNode = parentNode
        this.toggle = toggle


        this.html = `
        <div class="brainsatplay-about-page">
            <div class="browser-header">
                <h1>What is Brains@Play?</h1>
            </div>
            <div class="about-container">
                <p>Founded by <a href="https://www.linkedin.com/in/garrettmflynn/">Garrett Flynn</a> and <a href="https://www.linkedin.com/in/joshua-brewster93/">Joshua Brewster</a> in Spring 2021, Brains@Play is an international movement to make neurotechnology accessible to everyone via browser-based biosensing infrastructure.</p>

                <p>To this end, we've created Brains@Play Platform as an open-source tool for the collaborative development and distribution of next-generation biosensing applications built by and for our community.</p>

                <p>For more information about our organization, please visit <a href="https://brainsatplay.com">https://brainsatplay.com</a>. And, if you're interested in building applications with Brains@Play, make sure to check out our <a href="https://github.com/brainsatplay/brainsatplay">GitHub repository</a> and <a href="https://docs.brainsatplay.com">documentation</a> site.</p>

                <div style="font-size: 75%;">
                    <p><strong>Note:</strong> This version of The Brains@Play Platform is an alpha release. While there's much work ahead, we encourage you to try things out and get in touch with your suggestions for improvement. </p> <p>This will be a community effort—and we're grateful to have you on our team.</p>
                </div>
                </div>
        </div>
        `

        this.setupHTML = () => {
            this.toggle.onclick = () => {
                this.fragment.node.classList.toggle('shown')
            }
        }

        this.fragment = new DOMFragment(
            this.html,
            this.parentNode,
            undefined,
            this.setupHTML,
            undefined,
            undefined,
            undefined,
            this.responsive
        )

        this._init()
    }

    _init(){
        console.log('initing')
    }

    _toggle(){

    }

    responsive(){
        console.log('responding')
    }
}