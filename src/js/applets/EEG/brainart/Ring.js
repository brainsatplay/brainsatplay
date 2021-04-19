export class Ring {
    constructor(p) {
      this.p5Instance = p
      this.phase = 0
      this.history = []
      this.maxHistory = 100
      this.alpha = 5
      this.controlPoints = 100
      this.drawInterval = 1000/30;
      this.lastDraw = null;
      this.brainMetrics = [
        {name:'delta',label: 'Delta', color: this.p5Instance.color('hsl(198, 100%, 50%)')},
        {name:'theta',label: 'Theta',color: this.p5Instance.color('hsl(284, 100%, 50%)')},
        {name:'alpha1',label: 'Low Alpha',color: this.p5Instance.color('hsl(124, 100%, 50%)')},
        {name:'alpha2',label: 'High Alpha',color: this.p5Instance.color('hsl(124, 100%, 50%)')},
        {name:'beta',label: 'Beta',color: this.p5Instance.color('hsl(59, 100%, 50%)')},
        {name:'lowgamma',label: 'Gamma',color: this.p5Instance.color('hsl(0, 100%, 50%)')}
      ]
      this.brainData = []

      this.lastColorSwitch = Date.now()
      this.currentColors = null;
    }
  
    drawShape() {
        this.p5Instance.translate(this.p5Instance.width / 2, this.p5Instance.height / 2);
        let theta = Array.from({length: this.controlPoints}, (e,i) => this.p5Instance.radians(-90 + i*360/this.controlPoints))
        let vertices = this.getVertices(theta)
        let c = this.getColor()
        c.setAlpha(this.alpha)

        // this.history.push({vertices:vertices,color:c})
        // // Draw Vertices (including History)
        // this.history.forEach((dict,i) => {
        //   // if (i % 5 === 0){
        //         c = dict.color
        //         // c.setAlpha(155*((i/this.history.length))+50)
        //         this.p5Instance.stroke(c);
        //       this.drawVertices(dict.vertices)
        //   // }
        // })
        this.p5Instance.stroke(c);
        this.drawVertices(vertices)

        // Set values for next iteration
        this.phase += 0.003;
        // if (this.history.length >= this.maxHistory){
        //   this.history.shift()
        // }
    }
    
    getVertices(theta){
      let vertices = []
      let noiseMax = 10;
      let minRad = Math.min(this.p5Instance.width/100,this.p5Instance.height/100)* (0.75 + 0.25*Math.sin(Date.now()/1000))
      let maxRad = Math.min(this.p5Instance.width/2,this.p5Instance.height/2)* (0.75 + 0.25*Math.sin(Date.now()/1000))
      let minData = Math.min(...this.brainData) ?? 0
      let maxData = Math.max(...this.brainData) ?? 1
      if (minData == maxData == 1) minData = 0
      theta.forEach((a,i) => {
        let xoff = this.p5Instance.map(Math.cos(a + this.phase), -1, 1, 0, noiseMax*(0.75 + 0.25*Math.sin(Date.now()/1000)));
        let yoff = this.p5Instance.map(Math.sin(a + this.phase), -1, 1, 0, noiseMax*(0.75 + 0.25*Math.sin(Date.now()/1000)));
        let r = this.p5Instance.map(this.p5Instance.noise(xoff, yoff, Date.now()/1000), 0, 1, minRad,maxRad); // Noise 
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        vertices.push([x,y])
      })
      this.p5Instance.endShape(this.p5Instance.CLOSE);
      return vertices
    }
    
    drawVertices(vertices,i=0){
      this.p5Instance.strokeWeight(Math.min(this.p5Instance.width,this.p5Instance.height)/300);
      this.p5Instance.noFill();
      this.p5Instance.beginShape();
      vertices.forEach(v => {
        this.p5Instance.curveVertex(v[0], v[1]);
      })
      this.p5Instance.endShape(this.p5Instance.CLOSE);
    }
    
    getColor(){
        let currentColor = this.brainMetrics[0].color
        let distances = this.brainData
        let maxDist = Math.max(...distances)
        if (distances.every(d => d == maxDist)) {
            distances = Array.from({length: distances.length}, (e,i) => {return this.p5Instance.noise(i,Date.now()/1000)})
        }
        let ind = this.indexOfMax(distances)
        if (this.currentColors == null) this.currentColors = [{ind: ind, color: this.brainMetrics[ind].color},{ind: ind, color: this.brainMetrics[ind].color}]
        if (ind != this.currentColors[1].ind) {this.currentColors.shift(); this.currentColors.push({ind: ind, color: this.brainMetrics[ind].color}); this.lastColorSwitch=Date.now()}
        // currentColor = this.brainMetrics[ind].color
        currentColor = this.p5Instance.lerpColor(this.currentColors[0].color,this.currentColors[1].color,Math.min(1,(Date.now() - this.lastColorSwitch)/1000))

        return currentColor
    }
    
    setBrainData(eeg_data){
        this.brainData = []
        this.brainMetrics.forEach((dict,i) => {
            this.brainData.push([])
            eeg_data.forEach((data) => {
                this.brainData[i] = data.means[dict.name].slice(data.means[dict.name].length-20)
            })
        })
        this.brainData = this.brainData.map(data => {
            if (data.length > 0) return data.reduce((tot,curr) => tot + curr)
            else return 1
        })  
  }

  indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
}