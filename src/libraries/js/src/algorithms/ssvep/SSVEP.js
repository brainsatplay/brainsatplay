export class SSVEP {
    constructor(session,objects=null) {
        this.objects = objects
        this.session = session;
        this.animation = null
        this.selected = []

        this.refreshRate = null // default
    }

    init = async () => {
        this.refreshRate = await this.getScreenRefreshRate();
        return this.refreshRate
    }

    addObjects = (objects) => {
        this.objects = objects
    }

    animate = () => {
        this.selected = this.getSelected()
        this.objects.forEach((o,i) => {
            o.element.style.background = (this.selected.includes(i) ? 'lime' : 'white')
            if (Date.now() - o.lastToggle > ((0.5*(1/o.f))*1000)){
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
        let selected = this.PSDA(this.session.atlas.data, this.objects)
        return selected
    }

    PSDA(data,objects) {
        let selected = []
        let eeg_data = data.eeg
        let frequencies = data.eegshared.frequencies

        let votes = Array(objects.length).fill(0)
        let numFFTs = 5
        eeg_data.forEach((d) => {
            if (d.fftCount > 0){
                let slice = d.ffts.slice(d.ffts.length - Math.min(numFFTs,d.fftCount))
                let set = Array(slice[0].length).fill(0)
                // let subset = Array(slice[0].length).fill(0)

                // Average FFTS
                // let sizeSubset = slice.length/2
                slice.forEach(fft => {
                    fft.forEach((v,i) => {
                        // if (i < sizeSubset){
                        //     subset[i] += v
                        // }
                        set[i] += v
                    })
                })
                // let threshold = 2*set.reduce((a,b) => a+b,0) / set.length
                let thresholds = set.map(v => 2*v / slice.length)
                // let values = subset.map(v => v / sizeSubset)

                let latest = d.ffts[d.fftCount-1]
                objects.forEach((o,i) => {
                    let base = this.closestIndex(o.f,frequencies)
                    let harmonic = this.closestIndex(2*o.f,frequencies)
                    let sum = latest[base] + latest[harmonic]
                    let threshold = thresholds[base]
                    console.log(sum, threshold)
                    // let sum = set[base] + set[harmonic]
                    // if (sum > threshold) selected.push(i)
                    if (sum > thresholds[base]) votes[i]++
                })
            }
        })
        votes.forEach((v,i) => {
            if (v > eeg_data.length/2) selected.push(i)
        })
        return selected
    }

    CCA(eeg_data){

    }


    getScreenRefreshRate = async () => {
        let requestId = null;

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
        }
        
        let DOMHighResTimeStampCollection = [];

        let triggerAnimation = function(DOMHighResTimeStamp){
            DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp);
            
            if (DOMHighResTimeStampCollection.length > 10) {
                let t0 = DOMHighResTimeStampCollection.pop();
                return Math.floor(1000 * 10 / (DOMHighResTimeStamp - t0));
            }
        
            requestId = window.requestAnimationFrame(triggerAnimation);
        };
        
        window.requestAnimationFrame(triggerAnimation);

        return setTimeout(() => {
            window.cancelAnimationFrame(requestId);
            requestId = null;
        }, 500);
    }

    closestIndex = (num, arr) => {
        let curr = arr[0], diff = Math.abs(num - curr);
        let index = 0;
        for (let val = 0; val < arr.length; val++) {
           let newdiff = Math.abs(num - arr[val]);
           if (newdiff < diff) {
              diff = newdiff;
              curr = arr[val];
              index = val;
           };
        };
        return index;
     };
}