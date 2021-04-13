export class TutorialManager {
    constructor() {

        this.standaloneTutorialWindows = [
            `
            <div>
                <h2>0.1</i>
                <h1>Welcome to Brains@Play.</h1>
                <p>We are creating an open-source platform for the future of neurotechnology.</p>
            </div>
            `,
            `
            <div>
                <h2>0.2</i>
                <h1>Connect. Train. Play.</h1>
                <p>Use your brain to play games.</p>
            </div>
            `,

            `
            <div>
                <h2>0.3</i>
                <h1>Let's Begin.</h1>
                <p>Click below to enter the platform.</p>
            </div>
            `,
        ]

        this.overlayTutorialSettings = [
            {
                target: '#device-menu',
                content: `
                <p>This is where you connect your brain-sensing device.</p>
                `
            }
        ]

        this.tutorialState = 0

        this.tutorialContainer = document.body.querySelector('.tutorial')
        this.dynamicTutorialText = this.tutorialContainer.querySelector('.tutorial-dynamic-text')

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

    initializeTutorial = () => {
        this.setTutorialDefault(false) // remove when ready for deployment
        let toShow = this.getTutorialDefault()
        if (toShow) { // || toShow == null) {
            this.setTutorialDefault(true)
            this.updateStandaloneTutorialContent(0)
        }
        else {
            this.closeTutorial();
        }
    }

    closeTutorial = () => {
        // this.tutorialContainer.innerHTML = ''
        this.tutorialContainer.style.opacity = 0;
        this.tutorialContainer.style.pointerEvents = 'none';
        this.removeOverlayTooltip()
    };

    setTutorialDefault = (value) => {
        this.setCookie('showTutorial',value)
    }

    getTutorialDefault = () => {
        return this.getCookie('showTutorial') === 'true'
    }

    openTutorial = () => {
        this.tutorialContainer.style.opacity = 1;
        this.tutorialContainer.style.pointerEvents = 'auto';
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

            // Continue to overlay tutorial
            if (this.tutorialState === this.standaloneTutorialWindows.length-1) nextButton.onclick = () => {
                this.tutorialState = 0;
                this.tutorialContainer.innerHTML = ''
                this.tutorialContainer.style.opacity = 0.5;
                this.tutorialContainer.style.pointerEvents = 'none';
                this.initializeOverlayTutorial()
            }

            // Default next button
            else nextButton.onclick = () => {this.updateStandaloneTutorialContent(1)}
        }
    }

    initializeOverlayTutorial = () => {
        this.updateOverlayTutorial()
    }

    updateOverlayTutorial = (dx=0,start=null) => {
        this.removeOverlayTooltip()
        this.tutorialState = start != null ? start+dx : this.tutorialState+dx
        let target = document.body.querySelector(this.overlayTutorialSettings[this.tutorialState].target)
        let lastState = this.tutorialState === this.overlayTutorialSettings.length - 1
        let advanceLabel = (!lastState) ? "Next" : "End Tutorial"
        let buttonInlineStyle = "display:block; background: black; margin: 5px; min-height: 25px; text-align: center; padding: 5px;"
        target.innerHTML += `
        <div class='tutorial-tooltip'>
            ${this.overlayTutorialSettings[this.tutorialState].content}
            <div style="display:flex; justify-content:space-between;">
                <button class="skip-tutorial" style="${buttonInlineStyle}" onclick="${this.closeTutorial}">Skip Tutorial</button>
                <button class="advance-tutorial" style="${buttonInlineStyle}" onclick="${this.advance}">${advanceLabel}</button>
            </div>
        </div>
        `
        target.querySelector(".skip-tutorial").onclick = () => {this.closeTutorial()}
        target.querySelector(".advance-tutorial").onclick = () => {
            if (!lastState) this.updateOverlayTutorial(1)
            else this.closeTutorial()
        }
        this.overlayTutorialSettings[this.tutorialState].zIndex = target.style.zIndex
        this.overlayTutorialSettings[this.tutorialState].position = target.style.position
        target.style.zIndex = '10000'
        target.style.position = 'relative'
        target.querySelector(".tutorial-tooltip").style.opacity = '1'
    }

    removeOverlayTooltip = () => {
        document.body.querySelector('.tutorial-tooltip')?.remove()
        let currentSettings = this.overlayTutorialSettings[this.tutorialState]
        let prevTarget = document.body.querySelector(currentSettings.target)
        if(prevTarget != null) {
            prevTarget.style.zIndex = currentSettings.zIndex
            prevTarget.style.position = currentSettings.position
        }
    }
}