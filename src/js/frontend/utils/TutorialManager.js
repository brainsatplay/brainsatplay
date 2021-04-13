export class TutorialManager {
    constructor() {

        this.tutorialComponents = [
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
            this.updateTutorialContent(0)
        }
        else {
            this.closeTutorial();
        }
    }

    closeTutorial = () => {
        this.tutorialContainer.style.opacity = 0;
        this.tutorialContainer.style.pointerEvents = 'none';
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

    updateTutorialContent = (dx,start=null) => {
        console.log(this.tutorialState)
        this.tutorialState = start != null ? start+dx : this.tutorialState+dx
        console.log(this.tutorialState)
        let html = this.tutorialComponents[this.tutorialState]
        html += `<div style="display:flex; justify-content:space-between;">`
        if (this.tutorialState != 0) html += `<button class="previous">Previous</button>`
        if (this.tutorialState != this.tutorialComponents.length-1) html += `<button class="next">Next</button>`
        if (this.tutorialState === this.tutorialComponents.length-1) html += `<button class="next">Continue to App</button>`
        html += `</div>`

        this.dynamicTutorialText.innerHTML = html
        let prevButton = this.dynamicTutorialText.querySelector('.previous')
        if (prevButton) prevButton.onclick = () => {this.updateTutorialContent(-1)}
        let nextButton = this.dynamicTutorialText.querySelector('.next') 
        if (nextButton) {

            // Continue to app
            if (this.tutorialState === this.tutorialComponents.length-1) nextButton.onclick = () => {
                this.closeTutorial() 
                this.setTutorialDefault(false)
            }

            // Default next button
            else nextButton.onclick = () => {this.updateTutorialContent(1)}
        }
    }
}