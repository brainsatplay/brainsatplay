export class Ring {
    constructor(p) {
      this.p5Instance = p
      this.phase = 0
      this.zoff = 0
      this.history = []
      this.maxHistory = 60
      this.maxR;
      this.setMaxRadius()
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
    let theta = Array.from({length: this.brainMetrics.length}, (e,i) => this.p5Instance.radians(-90 + i*360/this.brainMetrics.length))
    let vertices = this.getVertices(theta)
    let c = this.getColor(vertices)
  
    this.history.push({vertices:vertices,color:c})
    // Draw Vertices (including History)
    this.history.forEach((dict,i) => {
      if (i % 5 === 0){
            c = dict.color
            c.setAlpha(155*((i/this.history.length))+50)
            this.p5Instance.stroke(c);
          this.drawVertices(dict.vertices)
      }
    })
      
    // Draw Text
    this.p5Instance.noStroke()
    this.p5Instance.fill('white');
    this.p5Instance.textAlign(this.p5Instance.CENTER)
    this.p5Instance.textStyle(this.p5Instance.BOLD)
    vertices.forEach((v,i) => { 
      let x = this.maxR * Math.cos(theta[i]);
      let y = this.maxR * Math.sin(theta[i]);
      this.p5Instance.text(this.brainMetrics[i].label,x,y)
    })
    this.p5Instance.noFill();
  
      
    // Set values for next iteration
    this.phase += 0.003;
    this.zoff += 0.01;
      if (this.history.length >= this.maxHistory){
        this.history.shift()
      }
    }
    
    getVertices(theta){
      let vertices = []
      let noiseMax = 5;
      let minRad = Math.min(this.p5Instance.width/25,this.p5Instance.height/25)
      let maxRad = Math.min(this.p5Instance.width/2,this.p5Instance.height/2)
      let minData = Math.min(...this.brainData) ?? 0
      let maxData = Math.max(...this.brainData) ?? 1
      if (minData == maxData == 1) minData = 0
      theta.forEach((a,i) => {
        let xoff = this.p5Instance.map(Math.cos(a + this.phase), -1, 1, 0, noiseMax);
        let yoff = this.p5Instance.map(Math.sin(a + this.phase), -1, 1, 0, noiseMax);
        let r = this.p5Instance.map(this.p5Instance.noise(xoff, yoff, this.zoff), 0, 1, minRad,maxRad); // Noise 
        // let r = this.p5Instance.map(this.brainData[i], minData, maxData, minRad,maxRad/2); // Brain
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
    
    getColor(vertices){
      let currentColor = this.brainMetrics[0].color
      let distances = vertices.map(v => Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)))
      let maxDist = Math.max(...distances)
    this.brainMetrics.forEach((dict,i) => {
        if (i != 0) currentColor = this.p5Instance.lerpColor(currentColor,dict.color,distances[i]/maxDist)
      })
        return currentColor
    }
    
    setMaxRadius() {
      this.maxR = Math.min(this.p5Instance.width/3,this.p5Instance.height/3)
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