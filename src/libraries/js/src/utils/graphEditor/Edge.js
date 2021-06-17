
export class Edge{
  constructor(structure, nodes){
    this.id=String(Math.floor(Math.random()*1000000))

    this.structure = structure
    this.nodes = nodes

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
      radius: 5,
      types: ['source', 'target']
    }

    // Derive Port Elements
    Object.keys(structure).forEach(t => {
      let split = this.structure[t].split(':') 
      if (split.length < 2) split.push('default')
      this[t] = this.nodes[split[0]]
      this[`${t}Node`] = this[t].element.querySelector(`.${t}-ports`).getElementsByClassName(`port-${split[1]}`)[0]
      this[t].registerEdge(this)
    })
  }


  mouseAsTarget = (type, upCallback) => {

      let label = (type === 'source') ? 'p1' : 'p2'
      let otherType = (type === 'source') ? 'target' : 'source'
      
        let onMouseMove = (e) => {

          let dims = this[`${otherType}Node`].getBoundingClientRect()
          let svgO = this.svgPoint(this.svg, dims.left + dims.width/2, dims.top + dims.height/2)
          let svgP = this.svgPoint(this.svg, e.clientX, e.clientY)
          
          if (isNaN(svgP.x)) svgP.x = svgO.x
          if (isNaN(svgP.y)) svgP.y = svgO.y
          this.updateElement(
            this.node[label],
            {
                cx: svgP.x,
                cy: svgP.y
            }
        );
        let points = (type === 'source') ? [svgP, svgO] : [svgO, svgP]

        this.updateControlPoints(...points)
        this.drawCurve();
      }

      window.addEventListener('mousemove', onMouseMove)
      window.dispatchEvent(new Event('mousemove'));


      let onMouseUp = (e) => {
        if (e.target != this[`${otherType}Node`] && e.target.classList.contains('node-port')){
          if (Array.from(e.target.parentNode.classList).find(str => str.includes(type))){
            this.structure[type]  = `${e.target.getAttribute('data-node')}:${e.target.getAttribute('data-port')}`
            let split =  this.structure[type].split(':') 
            if (split.length < 2) split.push('default')
            this[type] = this.nodes[split[0]]
            this[`${type}Node`] = this[type].element.querySelector(`.${type}-ports`).getElementsByClassName(`port-${split[1]}`)[0]
            this[type].registerEdge(this)
            this[type].updateAllEdges(this)
            upCallback(true)
          } else {
            upCallback('Cannot connect two ports of the same type.')
          }
        } else {
          this.element.remove()
          upCallback('Edge not completed.')
        }
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousemove', onMouseMove)
    }

      window.addEventListener('mouseup', onMouseUp)
  }


  insert = async (parentNode=document.body) => {

    return new Promise((resolve)=> {

    this.parentNode = parentNode
    this.element = document.createElement('div')
    this.element.classList.add('edge')
    this.parentNode.insertAdjacentElement('beforeend',this.element)
    this.element.insertAdjacentHTML('beforeend',`<svg xmlns="http://www.w3.org/2000/svg" id="${this.props.id}svg" viewBox="0 0 ${this.props.svgSize} ${this.props.svgSize}">
          <circle cx="0" cy="0" r="${this.props.radius}" class="p1 control" />
          <circle cx="0" cy="0" r="${this.props.radius}" class="p2 control" />

          <circle cx="0" cy="0" r="${this.props.radius}" class="c1 control" />
          <circle cx="0" cy="0" r="${this.props.radius}" class="c2 control" />
          <circle cx="0" cy="0" r="${this.props.radius}" class="c3 control" />

          <line x1="0" y1="0" x2="0" y2="0" class="l1"/>
          <line x1="0" y1="0" x2="0" y2="0" class="l2"/>

          <path d="M0,0 Q0,0 0,0" class="curve"/>
    </svg>`)
    this.svg = document.getElementById(`${this.props.id}svg`)
    const vb = this.svg.getAttribute('viewBox').split(' ').map(v => +v)
    this.box = {
        xMin: vb[0], xMax: vb[0] + vb[2] - 1,
        yMin: vb[1], yMax: vb[1] + vb[3] - 1
      }

    'p1,p2,c1,c2,c3,l1,l2,curve'.split(',').map(s => {
      this.node[s] = this.svg.getElementsByClassName(s)[0];
      
    });


    this.props.types.forEach(t => {
      if (this[`${t}Node`] == null) {
        this.mouseAsTarget(t,(res) => {
          if (res === true) resolve(true) 
          else resolve(res)
        })
      }
    })

  this.drawCurve();
  
  Object.keys(this.structure).forEach(t => {
    this[t].updateAllEdges(this)
  })

  // Resolve if both source and target are selected
  if (Object.keys(this.structure).length === 2) resolve(true)

})
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

updateControlPoints = (p1,p2) => {
  
  let curveMag = 0.5*Math.abs((p2.y - p1.y))
  this.updateElement(
    this.node['c1'],
      {
          cx: p1.x,
          cy: p1.y + curveMag
      }
  );

  this.updateElement(
      this.node['c2'],
      {
          cx: p2.x,
          cy: p2.y - curveMag
      }
  );

  this.updateElement(
  this.node['c3'],
  {
    cx: (p1.x + p2.x)/2,
    cy: (p1.y + p2.y)/2,
  })
}


// update curve
drawCurve = () => {

  const
    p1 = this.getControlPoint(this.node.p1),
    p2 = this.getControlPoint(this.node.p2),
    c1 = this.getControlPoint(this.node.c1),
    c2 = this.getControlPoint(this.node.c2),
    c3 = this.getControlPoint(this.node.c3)

  // curve
  const d = `M${p1.x},${p1.y} Q${c1.x},${c1.y} ${c3.x},${c3.y} T${p2.x},${p2.y}` +
    (this.node.curve.classList.contains('fill') ? ' Z' : '');

    this.updateElement( this.node.curve, { d } );
}
}
