import { DOMFragment } from './DOMFragment';


export class TutorialManager {
    constructor() {

        this.ui = new DOMFragment(
            `  <div class="brainsatplay-tutorial">
                    <div class="brainsatplay-tutorial-content">
                            <div id="tutorial-step0" class="brainsatplay-tutorial-dynamic-text"></div>
                    </div>
                    </div>`, 
                    document.body
        );

        this.standaloneTutorialWindows = [
        //     `
        //     <div>
        //         <h2>0.1</i>
        //         <h1>Welcome to Brains@Play.</h1>
        //         <p>We are creating an open-source platform for the future of neurotechnology.</p>
        //     </div>
        //     `,
        //     `
        //     <div>
        //         <h2>0.2</i>
        //         <h1>Connect. Train. Play.</h1>
        //         <p>Use your brain to play games.</p>
        //     </div>
        //     `,

        //     `
        //     <div>
        //         <h2>0.3</i>
        //         <h1>Let's Begin.</h1>
        //         <p>Click below to enter the platform.</p>
        //     </div>
        //     `,
        ]

        this.tooltipContent = []

        this.tutorialState = 0

        this.tutorialContainer = document.body.querySelector('.brainsatplay-tutorial')

        this.dynamicTutorialText = this.tutorialContainer.querySelector('.brainsatplay-tutorial-dynamic-text')

        this.getCookie = (name) => {
            var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : null;
        }
        
        this.setCookie = (name, value, days) => {
            var d = new Date;
            d.setTime(d.getTime() + 24*60*60*1000*days);
            document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
        }
    }

    reset(){
        this.setTutorialDefault(true)
    }

    start() {
        this.initializeTutorial()
        // this.openTutorial()
    }

    setTooltipContent(content){
        this.tooltipContent = content
    }

    initializeTutorial = (dx,start) => {

        let toShow = this.getTutorialDefault()
        if (toShow) { // || toShow == null) {
            this.setTutorialDefault(true)
            if (this.standaloneTutorialWindows.length > 0) this.updateStandaloneTutorialContent(0,0)
            else {
                this.tutorialState = 0
                this.initializeTooltips()
                this.closeTutorial(false)
                this.tutorialContainer.style.opacity = 0;
                this.tutorialContainer.style.pointerEvents = 'none';
            }
        }
        else {
            this.closeTutorial();
        }
    }

    closeTutorial = (tooltips=true) => {
        // this.tutorialContainer.innerHTML = ''
        this.tutorialContainer.style.opacity = 0;
        this.tutorialContainer.style.pointerEvents = 'none';
        if (tooltips) this.removeTooltip()
        this.setTutorialDefault(false)
    };

    setTutorialDefault = (value) => {
        this.setCookie('showTutorial',value)
    }

    getTutorialDefault = () => {
        return this.getCookie('showTutorial') === 'true'
    }

    openTutorial = () => {
        this.tutorialContainer.style.opacity = 1;
        this.tutorialContainer.style.pointerEvents = 'none';
    }

    updateStandaloneTutorialContent = (dx=0,start=null) => {
        this.tutorialState = start != null ? start+dx : this.tutorialState+dx
        let html = this.standaloneTutorialWindows[this.tutorialState]
        html += `<div style="display:flex; justify-content:space-between;">`
        if (this.tutorialState != 0) html += `<button class="previous">Previous</button>`
        if (this.tutorialState != this.standaloneTutorialWindows.length-1) html += `<button class="next">Next</button>`
        if (this.tutorialState === this.standaloneTutorialWindows.length-1) html += `<button class="next">Continue to App</button>`
        html += `</div>`

        this.dynamicTutorialText.innerHTML = html
        let prevButton = this.dynamicTutorialText.querySelector('.previous')
        if (prevButton) prevButton.onclick = () => {this.updateStandaloneTutorialContent(-1)}
        let nextButton = this.dynamicTutorialText.querySelector('.next') 
        if (nextButton) {

            if (this.tutorialState === this.standaloneTutorialWindows.length-1) nextButton.onclick = () => {
                this.tutorialState = 0;
                this.tutorialContainer.innerHTML = ''
                this.tutorialContainer.style.opacity = 0.0;
                this.tutorialContainer.style.pointerEvents = 'none';
                this.initializeTooltips()
            }

            // Default next button
            else nextButton.onclick = () => {this.updateStandaloneTutorialContent(1)}
        }

        // MAKE BUTTONS WORK
        let buttons = this.tutorialContainer.querySelectorAll('button')
        for (let button of buttons){
            button.style.pointerEvents = 'auto'
        }
    }

    initializeTooltips = () => {
        this.updateTooltips()
    }

    updateTooltips = (dx=0,start=null) => {

        if (this.tooltipContent.length > 0){

        let lastState = (this.tutorialState === this.tooltipContent.length-1) && !(dx===0)
        if (lastState) this.closeTutorial()
        else {
            this.removeTooltip()
            this.tutorialState = start != null ? start+dx : this.tutorialState+dx

            let targetQuery = this.tooltipContent[this.tutorialState].target;
            let target = document.getElementById(targetQuery);
                lastState = this.tutorialState === this.tooltipContent.length - 1
                let advanceLabel = (!lastState) ? "Next" : "Start Playing"
            

                target.insertAdjacentHTML('beforeend', 
                `
                <div class='brainsatplay-tutorial-tooltip-container'>
                    <div class='brainsatplay-tutorial-tooltip'>
                        ${this.tooltipContent[this.tutorialState].content}
                        <div style="display:flex; justify-content:space-between; pointer-events: auto;">
                            <button class="rewind-tutorial" style="display: block;" class="brainsatplay-default-button" onclick="${this.closeTutorial}">Previous</button>
                            <button class="advance-tutorial" style="display: block;" class="brainsatplay-default-button" onclick="${() => {this.updateTooltips(1)}}">${advanceLabel}</button>
                        </div>
                    </div>
                </div>
                `
                )

                // Toggle Rewind Button
                let rewind = target.querySelector(".rewind-tutorial")
                rewind.style.display = (this.tutorialState === 0) ? "none" : "block"
                
                rewind.onclick = () => {
                    this.updateTooltips(-1)            
                }

                let advance = target.querySelector(".advance-tutorial")
                advance.onclick = () => {
                    this.updateTooltips(1)
                }
                
                this.tooltipContent[this.tutorialState].zIndex = target.style.zIndex
                this.tooltipContent[this.tutorialState].position = target.style.position
                target.style.position = 'relative'

                let tooltipCont = target.querySelector(".brainsatplay-tutorial-tooltip-container")
                let tooltip = target.querySelector(".brainsatplay-tutorial-tooltip")
                tooltip.style.opacity = '1'
                
                tooltip.style.display = target.style.display;

                let rect = tooltipCont.getBoundingClientRect();
                tooltip.classList.add('left')
                if (rect.x + rect.width > window.innerWidth){
                    tooltip.classList.remove('right')
                    tooltip.classList.add('right')
                    tooltipCont.style.transform = 'translate(-100%,-50%)'
                    tooltipCont.style.right = 'auto'
                    tooltipCont.style.left = '0'
                    tooltip.style.left = '0'
                    tooltip.style.right = '25px'
                }
            }
        }
    }

    formatQuery(str){
        if (str.includes('#')){
            return`[id='${str.replace('#','')}']`
        }
    }

    removeTooltip = () => {
        let prevSettings = this.tooltipContent[this.tutorialState];
        let prevToolTip = document.getElementById(prevSettings.target).querySelector('.brainsatplay-tutorial-tooltip')
        if(prevToolTip != null){
            prevToolTip.style.opacity = '0'
            setTimeout(()=>{prevToolTip.remove()}, 1000);
        }  
    }
}