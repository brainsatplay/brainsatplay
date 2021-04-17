export class Ring {
    constructor(p) {
      this.p5Instance = p
      this.phase = 0
      this.history = []
      this.maxHistory = 60
      this.alpha = 10
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
    }
  
    drawShape() {
        this.p5Instance.translate(this.p5Instance.width / 2, this.p5Instance.height / 2);
        let theta = Array.from({length: this.controlPoints}, (e,i) => this.p5Instance.radians(-90 + i*360/this.controlPoints))
        let vertices = this.getVertices(theta)
        let c = this.getColor()
        c.setAlpha(this.alpha)
        this.p5Instance.stroke(c);
        this.drawVertices(vertices)

        // Set values for next iteration
        this.phase += 0.003;
    }
    
    getVertices(theta){
      let vertices = []
      let noiseMax = 5;
      let minRad = Math.min(this.p5Instance.width/100,this.p5Instance.height/100)
      let maxRad = Math.min(this.p5Instance.width/2,this.p5Instance.height/2)
      let minData = Math.min(...this.brainData) ?? 0
      let maxData = Math.max(...this.brainData) ?? 1
      if (minData == maxData == 1) minData = 0
      theta.forEach((a,i) => {
        let xoff = this.p5Instance.map(Math.cos(a + this.phase), -1, 1, 0, noiseMax);
        let yoff = this.p5Instance.map(Math.sin(a + this.phase), -1, 1, 0, noiseMax);
        let r = this.p5Instance.map(this.p5Instance.noise(xoff, yoff, Date.now()/1000), 0, 1, minRad,maxRad); // Noise 
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        vertices.push([x,y])
      })
      this.p5Instance.endShape(this.p5Instance.CLOSE);
      return vertices
    }
    
    drawVertices(vertices,i=0){
      this.p5Instance.strokeWeight(3);
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
        this.brainMetrics.forEach((dict,i) => {
            if (i != 0) {
                currentColor = this.p5Instance.lerpColor(currentColor,dict.color,distances[i]/maxDist)
            }
        })
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
}