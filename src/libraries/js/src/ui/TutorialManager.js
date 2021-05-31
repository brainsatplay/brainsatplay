export class TutorialManager {
    constructor(id, content=[], parentNode=document.body, toggleNode=null) {

        this.id = id
        this.props = {
            id: String(Math.floor(Math.random()*1000000))
        }

        this.tooltipContent = content

        this.open = false

        this.tutorialState = 0

        this.tutorialContainer = parentNode

        this.clickListeners = []
        this.resizeListeners = []

        if (toggleNode != null) {
            this.clickToOpen(toggleNode)
        }

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

    clickToOpen(target) {
        target.addEventListener('click', this.start)
        this.clickListeners.push({target, listener: this.start})
    }

    updateParent = (parentNode) => {
        let mask = document.getElementById(`${this.props.id}brainsatplay-tutorial-mask-container`)
        if (mask != null) parentNode.appendChild(mask);
        this.tutorialContainer = parentNode
    }

    start = () => {
        this.reset()
        this.init()
    }

    reset(){
        this.setTutorialDefault(true)
    }

    setTooltipContent(content){
        this.tooltipContent = content
    }

    init = () => {

        let toShow = this.getTutorialDefault()
        if (toShow && !this.open) {
            this.open = true
            this.setTutorialDefault(true)
            this.tutorialState = 0
            this.updateTooltips()            
        }
    }

    closeTutorial = () => {
        if (open){
            this.removeTooltip()
            this.removeMask()
            this.setTutorialDefault(false)

            this.resizeListeners.forEach(d => {
                d.target.removeEventListener('resize', d.listener)
            })
            this.resizeListeners = []
            this.responsive = () => {}

            this.open = false
        }
    };

    setTutorialDefault = (value) => {
        this.setCookie(`showTutorial-${this.id}`,value)
    }

    getTutorialDefault = () => {
        return this.getCookie(`showTutorial-${this.id}`) === 'true'
    }


    responsive = () => {} // Set in updateTooltips()

    deinit = () => {
        this.clickListeners.forEach(d => {
            d.target.removeEventListener('click', d.listener)
        })

        this.clickListeners = []
        this,closeTutorial()
    }

    updateTooltips = (dx=0,start=null) => {

        if (this.tooltipContent.length > 0){

        let lastState = (this.tutorialState === this.tooltipContent.length-1) && !(dx===0)
        if (lastState) this.closeTutorial()
        else {
            this.removeTooltip()
            this.removeMask()

            // Remove Listeners
            this.resizeListeners.forEach(d => {
                d.target.removeEventListener('resize', d.listener)
            })
            this.resizeListeners = []

            this.tutorialState = start != null ? start+dx : this.tutorialState+dx

            let targetQuery = this.tooltipContent[this.tutorialState].target;
            let target = document.getElementById(targetQuery);

            if (window.getComputedStyle(target).display !== "none"){

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
                
                target.style.position = 'relative'
                let tooltipCont = target.querySelector(".brainsatplay-tutorial-tooltip-container")
                let tooltip = target.querySelector(".brainsatplay-tutorial-tooltip")
                tooltip.style.opacity = '1'
                tooltip.style.display = target.style.display;
                tooltip.classList.add('left')
                tooltipCont.classList.add('left')


                // Set Mask
                let rect = tooltipCont.getBoundingClientRect();
                let parentRect = this.tutorialContainer.getBoundingClientRect();
                let targetRect = target.getBoundingClientRect();


                let rectX = Math.max(0,rect.x-parentRect.x)
                let rectY = Math.max(0,rect.y-parentRect.y)
                let targetRectX = Math.max(0,targetRect.x-parentRect.x)
                let targetRectY = Math.max(0,targetRect.y-parentRect.y)

                this.tutorialContainer.insertAdjacentHTML('beforeend', `
                <div id="${this.props.id}brainsatplay-tutorial-mask-container" class="brainsatplay-tutorial-mask-container">
                    <svg viewBox="0 0 ${this.tutorialContainer.offsetWidth} ${this.tutorialContainer.offsetHeight}" id="${this.props.id}brainsatplay-tutorial-mask" class="brainsatplay-tutorial-mask" preserveAspectRatio="none">
                        <defs>
                        <mask id="hole">
                            <rect width="100%" height="100%" fill="white"/>
                            <!-- the hole defined a polygon -->
                            <rect id="${this.props.id}brainsatplay-tutorial-mask-${tooltipCont.id}" class="mask-holes" x="${rectX}" y="${rectY}" width="${Math.min(rect.width, parentRect.width-rectX)}" height="${Math.min(rect.height, parentRect.height-rectY)}" fill="black"/>
                            <rect id="${this.props.id}brainsatplay-tutorial-mask-${target.id}" class="mask-holes" x="${targetRectX}" y="${targetRectY}" width="${Math.min(targetRect.width, parentRect.width-targetRectX)}" height="${Math.min(targetRect.height, parentRect.height-targetRectY)}" fill="black"/>                        
                            </mask>
                        </defs>
                        <!-- create a rect, fill it with the color and apply the above mask -->
                        <rect class="mask-fill" fill="rgba(0,0,0,0.7)" width="100%" height="100%" mask="url(#hole)" />
                    </svg>
                </div>
                `)

                this.responsive = () => {
                    let mask = document.getElementById(`${this.props.id}brainsatplay-tutorial-mask-container`)
                    let svg = mask.querySelector('svg')
                    svg.setAttribute('viewBox', `0 0 ${this.tutorialContainer.offsetWidth} ${this.tutorialContainer.offsetHeight}`)
                    this.updateTooltipPosition(tooltipCont)
                    this.updateMaskPosition([tooltipCont,target])
                }

                this.updateTooltipPosition(tooltipCont)
                this.updateMaskPosition([tooltipCont,target])

                // Resize Events
                target.addEventListener('resize', this.responsive)
                this.resizeListeners.push({target:target, listener: this.responsive})
                tooltipCont.addEventListener('resize', this.responsive)
                this.resizeListeners.push({target: tooltipCont, listener: this.responsive})

                if (this.tutorialContainer == document.body){
                    window.addEventListener('resize', this.responsive)
                    this.resizeListeners.push({target: window, listener: this.responsive})
                }

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
        let prevToolTip = document.getElementById(prevSettings.target).querySelector(".brainsatplay-tutorial-tooltip-container")
        if(prevToolTip != null){
            prevToolTip.style.opacity = '0'
            setTimeout(()=>{prevToolTip.remove()}, 1000);
        }  
    }

    removeMask = () => {
        let mask = document.getElementById(`${this.props.id}brainsatplay-tutorial-mask-container`)
        if (mask != null) mask.remove()
    }

    updateMaskPosition = (elements) => {

        let parentRect = this.tutorialContainer.getBoundingClientRect();
        elements.forEach(e => {
            let dimensions = e.getBoundingClientRect();
            let rect = document.getElementById(`${this.props.id}brainsatplay-tutorial-mask-${e.id}`)
            let x = Math.max(0,dimensions.x - parentRect.x)
            let y = Math.max(0,dimensions.y - parentRect.y)
            rect.setAttribute('x',x)
            rect.setAttribute('y',y)
            rect.setAttribute('width',Math.min(dimensions.width, parentRect.width - x))
            rect.setAttribute('height',Math.min(dimensions.height, parentRect.height - y))
        })

    }

    findPreferredPosition = (tooltipCont, position) => {
        let tooltip = tooltipCont.querySelector(".brainsatplay-tutorial-tooltip")
        this.removeDirectionalClasses(tooltip,position)
        tooltip.classList.add(position)
        this.removeDirectionalClasses(tooltipCont,position)
        tooltipCont.classList.add(position)

        let overflow = false
        let rect = tooltipCont.getBoundingClientRect();
        if (position === 'left') overflow = rect.x + rect.width > this.tutorialContainer.offsetWidth
        if (position === 'right') overflow =  rect.x < 0
        if (position === 'up') overflow = rect.y + rect.height > this.tutorialContainer.offsetHeight
        if (position === 'down') overflow = rect.y < 0

        return !overflow
    }

    updateTooltipPosition(tooltipCont){
        // Find Preferred Position
        let returned  = ['left', 'right', 'up', 'down', 'left'].find(str => this.findPreferredPosition(tooltipCont, str))
    }

    removeDirectionalClasses(e,keep){
        ['right','left','down','up'].forEach(str => {
            if (str !== keep){
                e.classList.remove(str)
            }
        })
    }
}