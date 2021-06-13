
export class Edge{
  constructor(structure, nodes){
    this.id=String(Math.floor(Math.random()*1000000))

    this.structure = structure

    // Derive Port Elements
    let splitSource = this.structure.source.split(':') 
    let splitTarget = this.structure.target.split(':') 
    if (splitSource.length < 2) splitSource.push('default')
    if (splitTarget.length < 2) splitTarget.push('default')
    this.source = nodes[splitSource[0]]
    this.target = nodes[splitTarget[0]]
    this.sourceNode = this.source.element.querySelector(`.source-ports`).getElementsByClassName(`port-${splitSource[1]}`)[0]
    this.targetNode = this.target.element.querySelector(`.target-ports`).getElementsByClassName(`port-${splitTarget[1]}`)[0]
    
    // Miscellanious
    this.parentNode = null
    this.element = null

    this.svg = null
    this.box = null
    this.node = {}
    this.drag = null

    this.props = {
      id: String(Math.floor(Math.random()*1000000)),
      svgSize: 500,
      radius: 5
    }

            
    this.source.registerEdge(this)
    this.target.registerEdge(this)
  }


  insert(parentNode=document.body){

    this.parentNode = parentNode

    let parent = this.parentNode.getBoundingClientRect()
    let port1 = this.sourceNode.getBoundingClientRect()
    let port2 = this.targetNode.getBoundingClientRect()

    let p1x = this.props.svgSize *(((port1.left - parent.left)) / parent.width)
    let p1y = this.props.svgSize *(((port1.top -  - parent.top)) / parent.height)
    let p2x = this.props.svgSize *(((port2.left - parent.left)) / parent.width)
    let p2y = this.props.svgSize *(((port2.top - parent.top)) / parent.height)

      let edgeDiv = document.createElement('div')
      edgeDiv.classList.add('edge')

      edgeDiv.insertAdjacentHTML('beforeend',`
        <svg xmlns="http://www.w3.org/2000/svg" id="${this.props.id}svg" viewBox="0 0 ${this.props.svgSize} ${this.props.svgSize}">
          <circle cx="${p1x}" cy="${p1y}" r="${this.props.radius}" class="p1 control" />
          <circle cx="${p2x}" cy="${p2y}" r="${this.props.radius}" class="p2 control" />

          <circle cx="${p2x}" cy="${p1y}" r="${this.props.radius}" class="c1 control" />

          <line x1="100" y1="250" x2="250" y2="100" class="l1"/>
          <line x1="400" y1="250" x2="250" y2="100" class="l2"/>

          <path d="M100,250 Q250,100 400,250" class="curve"/>
        </svg>
      `)

      this.parentNode.insertAdjacentElement('beforeend',edgeDiv)


  this.svg = document.getElementById(`${this.props.id}svg`)
  const NS = this.svg.getAttribute('xmlns')
  const vb = this.svg.getAttribute('viewBox').split(' ').map(v => +v)
  this.box = {
      xMin: vb[0], xMax: vb[0] + vb[2] - 1,
      yMin: vb[1], yMax: vb[1] + vb[3] - 1
    }

  'p1,p2,c1,l1,l2,curve'.split(',').map(s => {
    this.node[s] = this.svg.getElementsByClassName(s)[0];
  });

  // events
  this.svg.addEventListener('pointerdown', this.dragHandler);
  this.parentNode.addEventListener('pointermove', this.dragHandler);
  this.parentNode.addEventListener('pointerup', this.dragHandler);

  this.drawCurve();
  
  this.source.updateEdge(this)
  this.target.updateEdge(this)
  this.element = edgeDiv

  return this.element
  }


// drag handler
dragHandler = (event) => {

  event.preventDefault();

const target = event.target
const type = event.type
const svgP = this.svgPoint(this.svg, event.clientX, event.clientY);

  // start drag
  if (!this.drag && type === 'pointerdown' && target.classList.contains('control')) {

    this.drag = {
      node: target,
      start: this.getControlPoint(target),
      cursor: svgP
    };

    this.drag.node.classList.add('drag');

  }

  // move element
  if (this.drag && type === 'pointermove') {

    this.updateElement(
      this.drag.node,
      {
        cx: Math.max(this.box.xMin, Math.min( this.drag.start.x + svgP.x - this.drag.cursor.x, this.box.xMax )),
        cy: Math.max(this.box.yMin, Math.min( this.drag.start.y + svgP.y - this.drag.cursor.y, this.box.yMax ))
      }
    );

    this.drawCurve();

  }

  // stop drag
  if (this.drag && type === 'pointerup') {

    this.drag.node.classList.remove('drag');
    this.drag = null;

  }

}


// translate page to SVG co-ordinate
svgPoint = (element, x, y) => {

  var pt = this.svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(element.getScreenCTM().inverse());

}


// update element
updateElement = (element, attr) => {

  for (let a in attr) {
    let v = attr[a];
    element.setAttribute(a, isNaN(v) ? v : Math.round(v));
  }

}


// get control point location
getControlPoint = (circle) => {

  return {
    x: Math.round( +circle.getAttribute('cx') ),
    y: Math.round( +circle.getAttribute('cy') )
  }

}


// update curve
drawCurve = () => {

  const
    p1 = this.getControlPoint(this.node.p1),
    p2 = this.getControlPoint(this.node.p2),
    c1 = this.getControlPoint(this.node.c1);

    // control line 1
    this.updateElement(
    this.node.l1,
    {
      x1: p1.x,
      y1: p1.y,
      x2: c1.x,
      y2: c1.y
    }
  );

  // control line 2
  this.updateElement(
    this.node.l2,
    {
      x1: p2.x,
      y1: p2.y,
      x2: c1.x,
      y2: c1.y
    }
  );

  // curve
  const d = `M${p1.x},${p1.y} Q${c1.x},${c1.y} ${p2.x},${p2.y}` +
    (this.node.curve.classList.contains('fill') ? ' Z' : '');

    this.updateElement( this.node.curve, { d } );
}
}
