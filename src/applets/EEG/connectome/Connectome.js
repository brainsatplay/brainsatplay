export class Connectome {
    constructor(p) {
      this.p5Instance = p
      this.phase = 0
      this.zoff = 0
      this.history = []
      this.maxHistory = 1
      this.maxRad = null;
      this.minRad = null;
      this.bendStrength = 3;
      this.brainNodes = new Map()
      this.defaultColors = [
        this.p5Instance.color('hsl(198, 100%, 50%)'),
        this.p5Instance.color('hsl(284, 100%, 50%)'),
        this.p5Instance.color('hsl(124, 100%, 50%)'),
        this.p5Instance.color('hsl(284, 100%, 50%)'),
        this.p5Instance.color('hsl(59, 100%, 50%)'),
        this.p5Instance.color('hsl(0, 100%, 50%)')
      ]
      this.brainData = []
    }

    draw(){
      this.p5Instance.strokeWeight(Math.min(this.p5Instance.width,this.p5Instance.height)/300);
      this.p5Instance.noFill();

      // Draw lines
      this.p5Instance.push();
      this.p5Instance.translate(this.p5Instance.width / 2, this.p5Instance.height / 2);
      this.brainEdges.forEach(e => {
        let n1 = this.brainNodes.get(e.names[0])
        let n2 = this.brainNodes.get(e.names[1])
        let ctrlPt1 = [n1.position.x*this.bendStrength, n1.position.y*this.bendStrength]
        let ctrlPt2 = [n2.position.x*this.bendStrength, n2.position.y*this.bendStrength]
        this.p5Instance.noFill()
        let color = n1.color ?? n2.color
        if (color) {
          color.setAlpha(55 + 200*e.value)
          this.p5Instance.stroke(color)
          this.p5Instance.curve(ctrlPt1[0], ctrlPt1[1], n1.position.x, n1.position.y,n2.position.x, n2.position.y,ctrlPt2[0], ctrlPt2[1]);
        }
      })
      this.p5Instance.pop();

      // Draw nodes
      this.brainNodes.forEach((dict,i) => {
        // Nodes
        this.p5Instance.push();
        this.p5Instance.translate(this.p5Instance.width / 2, this.p5Instance.height / 2);
        this.p5Instance.noFill();
        this.p5Instance.stroke('white')
        this.p5Instance.ellipse(dict.position.x,dict.position.y,Math.min(this.p5Instance.width,this.p5Instance.height)/100)
        this.p5Instance.pop();

        // Text
        this.p5Instance.push();
        this.p5Instance.noStroke()
        this.p5Instance.fill('white');
        this.p5Instance.textAlign(this.p5Instance.LEFT)
        this.p5Instance.textStyle(this.p5Instance.NORMAL)

        // if (Math.sign(angles[i]) == 1){
          this.p5Instance.translate(this.p5Instance.windowWidth / 2, this.p5Instance.windowHeight / 2);
          this.p5Instance.translate(dict.position.x*1.2 - 36,dict.position.y*1.2 - 5);
          this.p5Instance.rotate(dict.angle)
        // }

        let text = dict.label
        this.p5Instance.text(text,0,0)

        this.p5Instance.pop();

      })
    }

    setGraph(channels){
      let keyValNodes = []
      channels.forEach((c,i) => {
        let theta = this.p5Instance.radians(-90 + i*360/channels.length)
        let r = Math.min(this.p5Instance.width/2,this.p5Instance.height/2)/2
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        keyValNodes.push([c, {label: c, position: {x,y}, angle: theta, color: this.defaultColors[i]}])
      })

      this.brainNodes = new Map(keyValNodes)
      
      let edges = this.pairwise(channels)
      let keyValEdges = []
      edges.forEach((e,i) => {
        keyValEdges.push([e.join('_'),{names: e, value: 0}])
      })
      this.brainEdges = new Map(keyValEdges)
    }
    
    setConnectionStrength(coherence_data){
        let edges = Array.from(this.brainEdges.values())
        edges.forEach((e,i) => {
          let thisEdge = coherence_data.find((d) => {
            let channels = d.tag.split('_')
            if (channels.includes(e.names[0]) && channels.includes(e.names[1])){
              return true
            }
          })
          if (thisEdge != null){
            let meanData  = thisEdge.means['alpha1']
            meanData = meanData.slice(meanData.length - 20)
            if (meanData.length > 0) meanData = meanData.reduce((t,c) => t + c)
            else meanData = 0
            this.brainEdges.get(e.names.join('_')).value = meanData
          }
        })
  }

  pairwise(list) {
    if (list.length < 2) { return []; }
    var first = list[0],
        rest  = list.slice(1),
        pairs = rest.map(function (x) { return [first, x]; });
    return pairs.concat(this.pairwise(rest));
  }
}