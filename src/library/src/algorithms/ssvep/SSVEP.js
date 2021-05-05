export class SSVEP {
    constructor(objects,session) {
        this.objects = objects
        this.session = session;
        this.animation = null
        this.selected = []
    }

    animate = () => {
        this.selected = this.getSelected()
        this.objects.forEach((o,i) => {
            o.element.style.background = (this.selected.includes(i) ? 'lime' : 'white')
            if (Date.now() - o.lastToggle > ((0.5*(1/o.f))*1000)){
                console.log((o.element.style.opacity == 0 ? 1 : 0))
                o.element.style.opacity = (o.element.style.opacity == 0 ? 1 : 0)
                o.lastToggle = Date.now()
            }
        })

        this.animation = requestAnimationFrame(this.animate)
    }

    start = () => {

        this.objects.forEach(o => {
            o.lastToggle = Date.now()
            o.element.style.transition = `opacity ${0.5*(1/o.f)}s`
        })

        this.animation = requestAnimationFrame(this.animate)
    }


    stop = () => {
        cancelAnimationFrame(this.animation)
    }

    getSelected = () => {
        let selected = [Math.floor(this.objects.length*Math.random())]
        return selected
    }
}