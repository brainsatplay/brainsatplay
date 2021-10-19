export class Edge {
    constructor (source, target, graph) {

        this.id = String(Math.floor(Math.random()*1000000))
        this.graph = graph

        // Information
        this.source = source;
        this.target = target;

        // Interface
        this.parentNode = null
        this.element = null
        this.svg = {
            element: null,
            size: 500,
            radius: 5
        }
        this.box = null
        this.node = {}
        this.drag = null
        this.types = ['source', 'target']

        // Functionality
        this.value;
        this.subscription
        
        // Create UI
        this._createUI()
    }


    init = async () => {

        // Activate Functionality
        this.graph.app.state.data[this.id] = this.value
        this.subscription = this.graph.app.state.subscribeTrigger(this.id, this.onchange)

        // Activate UI
        await this._activateUI()

        // Always activate edge with initial value
        this.update()
        

    }

    deinit = () => {
        this.graph.app.session.removeStreaming(this.id, this.subscription , this.graph.app.state, 'trigger');
    }

    // Pass Information from Source to Target
    update = () => {
        let returned = this.target.port.set(this.source.port)
        return returned
    }



    // Interface Handler

    resizeElement = () => {

        // Derive Queries
        let types = Object.keys(this.structure)
        let k1 = types.shift()
        let type = (o.structure[k1].node.includes(this.nodeInfo.id)) ? k1 : null
        if (type == null) type = (k1 === 'source') ? 'target' : 'source'
        let className = (type === 'source') ? 'p1' : 'p2'

        // Grab Elements
        let portElement = this[type].port.element
        portElement.classList.add('active') // Label Active Node

        let portDim = portElement.getBoundingClientRect()
        let svgP = this.svgPoint(o.svg, portDim.left + portDim.width / 2, portDim.top + portDim.height / 2)

        // Update Edge Anchor
        this.updateElement(
            this.node[className],
            {
                cx: svgP.x,
                cy: svgP.y
            }
        );

        // Grab Other Side of Edge
        let otherType = (type == 'source') ? 'target' : 'source'
        let otherElement = this[otherType].port.element
        let svgO
        if (otherElement) {
            let otherDim = otherElement.getBoundingClientRect()
            svgO = this.svgPoint(this.svg, otherDim.left + otherDim.width / 2, otherDim.top + otherDim.height / 2)
        } else {
            svgO = svgP
        }
        // Update Control Points
        let sP = (type == 'source') ? svgP : svgO
        let tP = (type == 'source') ? svgO : svgP

        this.updateControlPoints(sP, tP)
        this.drawCurve();
    }

  mouseAsTarget = (type, upCallback) => {

    let label = (type === 'source') ? 'p1' : 'p2'
    let otherType = (type === 'source') ? 'target' : 'source'
    
      let onMouseMove = (e) => {

        let dims = this[otherType].port.element.getBoundingClientRect()
        let svgO = this.svgPoint(this.svg.element, dims.left + dims.width/2, dims.top + dims.height/2)
        let svgP = this.svgPoint(this.svg.element, e.clientX, e.clientY)
        
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
      if (e.target != this[otherType].port.element && e.target.classList.contains('node-port')){
        if (Array.from(e.target.parentNode.parentNode.classList).find(str => str.includes(type))){
          this.structure[type]  = {node: e.target.getAttribute('data-node'), port: e.target.getAttribute('data-port')}
          this[type] = this.nodes[this.structure[type].node]

          // NOTE: Fix and check
        //   this[`${type}Node`] = this[type].element.querySelector(`.${type}-ports`).getElementsByClassName(`port-${this.structure[type].port}`)[0]
          this[type].node.registerEdge(this)
          this[type].node.updateAllEdges(this)
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


_createUI = () => {
    this.element = document.createElement('div')
    this.element.classList.add('edge')
    this.element.insertAdjacentHTML('beforeend',`<svg xmlns="http://www.w3.org/2000/svg" id="${this.id}svg" viewBox="0 0 ${this.svg.size} ${this.svg.size}">
          <circle cx="0" cy="0" r="${this.svg.radius}" class="p1 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="p2 control" />
  
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c1 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c2 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c3 control" />
  
          <line x1="0" y1="0" x2="0" y2="0" class="l1"/>
          <line x1="0" y1="0" x2="0" y2="0" class="l2"/>
  
          <path d="M0,0 Q0,0 0,0" class="curve"/>
    </svg>`)
    this.svg.element = this.element.querySelector(`[id="${this.id}svg"]`)
    const vb = this.svg.element.getAttribute('viewBox').split(' ').map(v => +v)
    this.box = {
        xMin: vb[0], xMax: vb[0] + vb[2] - 1,
        yMin: vb[1], yMax: vb[1] + vb[3] - 1
      }
  
    'p1,p2,c1,c2,c3,l1,l2,curve'.split(',').map(s => {
      this.node[s] = this.svg.element.getElementsByClassName(s)[0];
      
    });
}

_activateUI = async () => {
    return new Promise(async (resolve)=> {

    let res = await this.insert(this.parentNode) // insert into UI
        
    let found,compatible, sourceType, targetType

    let complete = this.target.node != null && this.target.port != null && this.source.node != null && this.source.port != null
    
    if (complete){

        // Check Edge Compatibility
        let coerceType = (t) => {
            if (t === 'float') return 'number'
            else if (t === 'int') return'number'
            else return t
        }
        sourceType = coerceType(this.source.port?.output?.type)
        targetType = coerceType(this.target.port?.input?.type)

        let checkCompatibility = (source,target) => {
            return source == target || (source === undefined || target === undefined) || (target instanceof Object && source instanceof target)
        }

        compatible = checkCompatibility(sourceType, targetType)
    }

if (res === true && complete && compatible){
        // this.edges.push(edge)
        resolve({msg: 'OK', edge: this})
} else {
    this.removeEdge(edge)
    if (res != true) resolve({msg: 'edge is incomplete', edge: edge})
    else if (compatible == false) reject(`Source (${sourceType}) and Target (${targetType}) ports are not of compatible types`)
    else if (found == null) reject('edge already exists')
    else reject(res)
}
    })
}


insert = async () => {

  return new Promise((resolve)=> {

  this.graph.app.editor.viewer.insertAdjacentElement('beforeend', this.element)

  this.types.forEach(t => {
    if (this[t].port == null) { // TODO: Fix and check
      this.mouseAsTarget(t,(res) => {
        if (res === true) resolve(true) 
        else resolve(res)
      })
    }
  })

this.drawCurve();

this.types.forEach(t => {
    console.log(t, this[t])
  this[t].node.updateAllEdges(this)
})

// Resolve if both source and target are selected
if (this.types.length === 2) resolve(true) // TODO: What is this supposed to check?

})
}


// drag handler
dragHandler = (event) => {

event.preventDefault();

const target = event.target
const type = event.type
const svgP = this.svgPoint(this.svg.element, event.clientX, event.clientY);

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

var pt = this.svg.element.createSVGPoint();
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
        cx: p1.x + curveMag,
        cy: p1.y
    }
);

this.updateElement(
    this.node['c2'],
    {
        cx: p2.x - curveMag,
        cy: p2.y
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

  console.log('DRAW', d)
  this.updateElement( this.node.curve, { d } );
}

}