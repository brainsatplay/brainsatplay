export class Dropdown {
    constructor(parentNode, headers = [], options=[], settings={}){
        this.parentNode = parentNode
        this.container = document.createElement('div')
        this.parentNode.insertAdjacentElement('beforeend',this.container)
        this.settings = settings
        
        headers.forEach(o => {
            this.addSection(o)
        })

        options.forEach(o => {
            this.addOption(o)
        })

        if (settings.hidden) { 
            this.container.style.position = 'relative'
            this.container.style.transform = `translateY(-100%)`

            this.hideToggle  = document.createElement('div')
            let arrow  = document.createElement('div')
            this.hideToggle.style = `
                position: absolute;
                bottom: 0;
                right: 0;
                transform: translateY(100%);
                padding: 20px 20px 20px 50px;
                text-align: right;
            `
            this.hideToggle.insertAdjacentElement('afterbegin', arrow)
            this.container.insertAdjacentElement('afterbegin', this.hideToggle)
            arrow.classList.add('arrow-down')

            this.hideToggle.onclick = () => {
                if (this.container.style.transform != '') {
                    this.container.style.transform = ``
                    arrow.classList.remove('arrow-down')
                    arrow.classList.add('arrow-up')
                    this.container.style.transition = ''
                } else {
                    this.container.style.transform = `translateY(-100%)`
                    arrow.classList.remove('arrow-up')
                    arrow.classList.add('arrow-down')
                    this.container.style.transition = '0.5s'
                }
                
                let collapsibles = this.container.querySelectorAll(`.option-type-collapsible`)

                for (let el of collapsibles){
                    el.style.display = 'none'
                    el.click()
                }
            }
        }
    }

    addSection = (o) => {
        // Add Header
        let header = document.createElement('div');
        header.innerHTML = o.label[0].toUpperCase() + o.label.slice(1)
        header.classList.add(`brainsatplay-option-type`)
        header.classList.add(`option-type-collapsible`)
        header.classList.add(`header-${o.id}`)

        // let count = document.createElement('div')
        // count.classList.add('count')
        // count.classList.add(`${o.id}-count`)
        // count.innerHTML = 0
        // header.insertAdjacentElement('beforeend',count)

        this.addDropdownFunctionality(header)
        this.container.insertAdjacentElement('beforeend',header)

        // Add Content
        let content = document.createElement('div');
        content.classList.add('option-type-content')
        content.classList.add(`content-${o.id}`)
        this.container.insertAdjacentElement('beforeend', content)

        return {content, header}
    }

    addOption = (o) => {
        // let label = o.label
        // let cls = o.class

        // Find Header
        let content = this.container.querySelector(`.content-${o.header}`)
        let header = this.container.querySelector(`.header-${o.header}`)

        if (content == null){
            let o2 = {label: o.header, id: o.header}
            let res = this.addSection(o2)
            content = res.content
            header = res.header
        }

        let option = document.createElement('div')
        option.classList.add('brainsatplay-option-node')
        option.innerHTML = o.content
        if (o.id) option.classList.add(`option-${o.id}`)

        if (o.onclick instanceof Function){
            option.onclick = () => {
                o.onclick()
                if (this.settings.hidden) this.hideToggle.click()
                else header.click()
            }
        }

        content.insertAdjacentElement('beforeend', option)
        if (o.onload instanceof Function) o.onload(option)
    }

    addDropdownFunctionality = (el) => {
        el.onclick = () => {
            el.classList.toggle("active");
            var content = el.nextElementSibling;
            if (el.classList.contains('active')) content.style.maxHeight = content.scrollHeight + "px"
            else content.style.maxHeight = null
        }
    }
}