export class Dropdown {
    constructor(parentNode, headers = [], options=[]){
        this.parentNode = parentNode

        headers.forEach(o => {
            this.addSection(o)
        })

        options.forEach(o => {
            this.addOption(o)
        })
    }

    addSection = (o) => {
        // Add Header
        let header = document.createElement('div');
        header.innerHTML = o.label[0].toUpperCase() + o.label.slice(1)
        header.classList.add(`brainsatplay-option-type`)
        header.classList.add(`option-type-collapsible`)
        header.classList.add(`header-${o.id}`)

        let count = document.createElement('div')
        count.classList.add('count')
        count.classList.add(`${o.id}-count`)
        count.innerHTML = 0

        header.insertAdjacentElement('beforeend',count)
        this.addDropdownFunctionality(header)
        this.parentNode.insertAdjacentElement('beforeend',header)

        // Add Content
        let content = document.createElement('div');
        content.classList.add('option-type-content')
        content.classList.add(`content-${o.id}`)
        this.parentNode.insertAdjacentElement('beforeend', content)

        return {content, header}
    }

    addOption = (o) => {
        // let label = o.label
        // let cls = o.class

        // Find Header
        let content = this.parentNode.querySelector(`.content-${o.header}`)
        let header = this.parentNode.querySelector(`.header-${o.header}`)

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
                header.click()
            }
        }

        content.insertAdjacentElement('beforeend', option)
        if (o.onload instanceof Function) o.onload(option)
    }

    addDropdownFunctionality = (el) => {
        el.onclick = () => {
            el.classList.toggle("active");
            var content = el.nextElementSibling;
            if (content.style.maxHeight) content.style.maxHeight = null; 
            else content.style.maxHeight = content.scrollHeight + "px";
        }
    }
}