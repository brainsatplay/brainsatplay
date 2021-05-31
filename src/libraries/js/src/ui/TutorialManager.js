export class TutorialManager {
    constructor(id, content=[], parentNode=document.body) {

        this.id = id
        this.tooltipContent = content

        this.tutorialState = 0

        this.tutorialContainer = parentNode


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

    setTooltipContent(content){
        this.tooltipContent = content
    }

    start = () => {

        let toShow = this.getTutorialDefault()
        if (toShow) { // || toShow == null) {
            this.setTutorialDefault(true)
            this.tutorialState = 0
            this.initializeTooltips()
        }
        else {
            this.closeTutorial();
        }
    }

    closeTutorial = () => {
        this.removeTooltip()
        this.removeMask()
        this.setTutorialDefault(false)
    };

    setTutorialDefault = (value) => {
        this.setCookie(`showTutorial-${this.id}`,value)
    }

    getTutorialDefault = () => {
        return this.getCookie(`showTutorial-${this.id}`) === 'true'
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
            this.removeMask()
            this.tutorialState = start != null ? start+dx : this.tutorialState+dx

            let targetQuery = this.tooltipContent[this.tutorialState].target;
            let target = document.getElementById(targetQuery);

            console.log()
            if (window.getComputedStyle(target).display !== "none"){

                lastState = this.tutorialState === this.tooltipContent.length - 1
                let advanceLabel = (!lastState) ? "Next" : "Start Playing"

                target.insertAdjacentHTML('beforeend', 
                `
                <div id="tooltip-container" class='brainsatplay-tutorial-tooltip-container'>
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
                
                target.style.position = 'relative'
                let tooltipCont = target.querySelector(".brainsatplay-tutorial-tooltip-container")
                let tooltip = target.querySelector(".brainsatplay-tutorial-tooltip")
                tooltip.style.opacity = '1'
                tooltip.style.display = target.style.display;
                tooltip.classList.add('left')
                tooltipCont.classList.add('left')

                // ADD MASK
                let rect = tooltipCont.getBoundingClientRect();
                let parentRect = this.tutorialContainer.getBoundingClientRect();
                let targetRect = target.getBoundingClientRect();
                this.tutorialContainer.insertAdjacentHTML('beforeend', `
                <div id="brainsatplay-tutorial-mask-container">
                    <svg viewBox="0 0 ${this.tutorialContainer.offsetWidth} ${this.tutorialContainer.offsetHeight}" id="brainsatplay-tutorial-mask" preserveAspectRatio="none">
                        <defs>
                        <mask id="hole">
                            <rect width="100%" height="100%" fill="white"/>
                            <!-- the hole defined a polygon -->
                            <rect id="brainsatplay-tutorial-mask-${tooltipCont.id}" class="mask-holes" x="${rect.x-parentRect.x}" y="${rect.y-parentRect.y}" width="${rect.width}" height="${rect.height}" fill="black"/>
                            <rect id="brainsatplay-tutorial-mask-${target.id}" class="mask-holes" x="${targetRect.x-parentRect.x}" y="${targetRect.y-parentRect.y}" width="${targetRect.width}" height="${targetRect.height}" fill="black"/>                        
                            </mask>
                        </defs>
                        <!-- create a rect, fill it with the color and apply the above mask -->
                        <rect class="mask-fill" fill="rgba(0,0,0,0.7)" width="100%" height="100%" mask="url(#hole)" />
                    </svg>
                </div>
                `)


                // Window Resize
                window.onresize = () => {
                    let svg = document.getElementById(`brainsatplay-tutorial-mask-container`).querySelector('svg')
                    svg.setAttribute('viewBox', `0 0 ${this.tutorialContainer.offsetWidth} ${this.tutorialContainer.offsetHeight}`)
                    this.updateTooltipPosition(tooltipCont)
                    this.updateMaskPosition([tooltipCont,target])
                }

                this.updateTooltipPosition(tooltipCont)
                this.updateMaskPosition([tooltipCont,target])

                // // Hover Events
                // target.onmousemove = () => {
                //     this.updateMaskPosition([tooltipCont,target])
                // }

                // target.onmouseleave = () => {
                //     this.updateMaskPosition([tooltipCont,target])
                // }

                // tooltipCont.onmousemove = () => {
                //     this.updateMaskPosition([tooltipCont,target])
                // }

                // tooltipCont.onmouseleave = () => {
                //     this.updateMaskPosition([tooltipCont,target])
                // }
                } else {
                    this.updateTooltips(1)
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

    removeMask = () => {
        let mask = document.getElementById(`brainsatplay-tutorial-mask-container`)
        if (mask != null) mask.remove()
    }

    updateMaskPosition = (elements) => {

        let parentRect = this.tutorialContainer.getBoundingClientRect();
        elements.forEach(e => {
            let dimensions = e.getBoundingClientRect();
            let rect = document.getElementById(`brainsatplay-tutorial-mask-${e.id}`)
            rect.setAttribute('x',dimensions.x-parentRect.x)
            rect.setAttribute('y',dimensions.y-parentRect.y)
            rect.setAttribute('width',dimensions.width)
            rect.setAttribute('height',dimensions.height)
        })

    }

    updateTooltipPosition(tooltipCont){
        let tooltip = tooltipCont.querySelector(".brainsatplay-tutorial-tooltip")
        let rect = tooltipCont.getBoundingClientRect();

        let overflowRight = rect.x + rect.width > this.tutorialContainer.offsetWidth
        let overflowLeft = rect.x < 0
        let overflowBottom = rect.y + rect.height > this.tutorialContainer.offsetHeight
        let overflowTop = rect.y < 0

        if (overflowRight || overflowLeft || overflowBottom || overflowTop){
            
            // Check Rightmost Position Has No Overflow
            if (overflowRight && !tooltip.classList.contains('right')){
                this.removeDirectionalClasses(tooltip,'right')
                tooltip.classList.add('right')
                this.removeDirectionalClasses(tooltipCont,'right')
                tooltipCont.classList.add('right')
                rect = tooltipCont.getBoundingClientRect();
            } else if (!tooltip.classList.contains('left')) {
                this.removeDirectionalClasses(tooltip,'left')
                tooltip.classList.add('left')
                this.removeDirectionalClasses(tooltipCont,'left')
                tooltipCont.classList.add('left')
            }

            overflowLeft = rect.x < 0

            if (overflowLeft && overflowRight && !tooltip.classList.contains('up')) {
                this.removeDirectionalClasses(tooltip,'up')
                tooltip.classList.add('up')
                this.removeDirectionalClasses(tooltipCont,'up')
                tooltipCont.classList.add('up')
                rect = tooltipCont.getBoundingClientRect();
            }

            overflowBottom = rect.y + rect.height > this.tutorialContainer.offsetHeight
            console.log('overflowBottom', overflowBottom)

            // Check Bottommost Position Has No Overflow
            if (overflowLeft && overflowRight && overflowBottom && !tooltip.classList.contains('down')){
                this.removeDirectionalClasses(tooltip,'down')
                tooltip.classList.add('down')
                this.removeDirectionalClasses(tooltipCont,'down')
                tooltipCont.classList.add('down')
            }

            let overflowTop = rect.y < 0

            if (overflowLeft && overflowRight && overflowBottom && overflowTop){
                console.log('no good view. Reverting to default...')
                this.removeDirectionalClasses(tooltip,'left')
                tooltip.classList.add('left')
                this.removeDirectionalClasses(tooltipCont,'left')
                tooltipCont.classList.add('left')
            }
        }
    }

    removeDirectionalClasses(e,keep){
        ['right','left','down','up'].forEach(str => {
            if (str !== keep){
                e.classList.remove(str)
            }
        })
    }
}