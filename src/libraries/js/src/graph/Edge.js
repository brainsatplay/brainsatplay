export class Edge {
    constructor (source, target, parent) {

        this.uuid = String(Math.floor(Math.random()*1000000))
        this.parent = parent

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
            this.editing = false
            if (this.parent.app.editor){
                this._createUI()
            }
    }


    init = async () => {
        return new Promise(async (resolve, reject) => {


        let sP = this.source.port
        let tP = this.target.port

        if (sP && tP){

            // Activate Functionality
            this.parent.app.state.data[this.uuid] = this.value
            this.subscription = this.parent.app.state.subscribeTrigger(this.uuid, this.onchange)

            // Register Edge in Ports
            this.source.node.edges.set(this.uuid, this)
            this.target.node.edges.set(this.uuid, this)
            sP.edges.output.set(this.uuid,this)
            tP.edges.input.set(this.uuid, this)

            // Activate Dyhamic Analyses
        
            if (tP.analysis && (tP.edges.input.size > 0 || tP.type === null) && (tP.edges.output.size > 0 || tP.type === null)) this.parent.app.analysis.dynamic.push(...tP.analysis)
            if (sP.analysis && (sP.edges.input.size > 0 || sP.type === null) && (sP.edges.output.size > 0 || sP.type === null)) this.parent.app.analysis.dynamic.push(...sP.analysis)

            // Activate UI
            if (this.parent.app.editor) await this._activateUI()

            // Update Brainstorm ASAP
            let brainstormTarget = this.target.node.className === 'Brainstorm'

            if (brainstormTarget) {
                this.parent.app.streams.push(this.source.port.label) // Keep track of streams
            }

            await this.update() // Indiscriminately activate edge with initial value
            this.addReactivity() 

            resolve(this)
        } else {

            this.parent.editing = true

            let res = await this.parent.getEdge(this)
    
            if (res){
                this.addReactivity() 
                this.parent.editing = false
                resolve(this)
            } else {
                // // Grab Type of Incomplete Port
                // for (let key in res.edge.structure) for (let cls of res.edge[`${key}Node`].classList) if (cls.includes('type-')) this.search.value = cls.replace('type-','')
                // this.matchOptions()
                // this.selectorToggle.click()
                reject('EDGE CANNOT BE CREATED')
            }
        }
    })

    }

    deinit = () => {
        this.parent.app.session.removeStreaming(this.uuid, this.subscription , this.parent.app.state, 'trigger');
        if (this.source.node) this.source.node.edges.delete(this.uuid)
        if (this.target.node) this.target.node.edges.delete(this.uuid)
        if (this.source.port) this.source.port.edges.output.delete(this.uuid)
        if (this.target.port) this.target.port.edges.input.delete(this.uuid)
        this.element.remove()

    }

    // Pass Information from Source to Target
     update = async (port=this.source.port) => {
        let returned = await this.target.port.set(port)
        this.animate()

        return returned
    }

    animate = () => {
        if (this.node.curve){
            this.source.port.animate('output')
            this.target.port.animate('input')

            this.node.curve.classList.add('updated')
            this.node.curve.setAttribute('data-update', Date.now())
            setTimeout(()=>{
                if (this.node.curve.getAttribute('data-update') < Date.now() - 450){
                    this.node.curve.classList.remove('updated')
                }
            }, 500)
        }
    }


    // Interface Handler

    resizeElement = () => {

        // Grab Elements
        let arr = [
            {type: 'source', port: 'output', node: 'p1'}, 
            {type: 'target', port: 'input', node: 'p2'},
        ]

        let svgPorts = arr.map(o => {

            let portElement = this[o.type].port.ui[o.port]
            portElement.children[0].classList.add('active') // Label Active Node
            let portDim = portElement.getBoundingClientRect()
            let svgPort = this.svgPoint(this.svg.element, portDim.left + portDim.width / 2, portDim.top + portDim.height / 2)

            // Update Edge Anchor
            this.updateElement(
                this.node[o.node],
                {
                    cx: svgPort.x,
                    cy: svgPort.y
                }
            );

            return svgPort
        })

        if (svgPorts.length === 1) svgPorts.push(svgPorts[0])

        this.updateControlPoints(...svgPorts)
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
          this[type].node.resizeAllEdges(this)
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
    this.element.insertAdjacentHTML('beforeend',`<svg xmlns="http://www.w3.org/2000/svg" id="${this.uuid}svg" viewBox="0 0 ${this.svg.size} ${this.svg.size}">
          <circle cx="0" cy="0" r="${this.svg.radius}" class="p1 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="p2 control" />
  
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c1 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c2 control" />
          <circle cx="0" cy="0" r="${this.svg.radius}" class="c3 control" />
  
          <line x1="0" y1="0" x2="0" y2="0" class="l1"/>
          <line x1="0" y1="0" x2="0" y2="0" class="l2"/>
  
          <path d="M0,0 Q0,0 0,0" class="curve"/>
    </svg>`)
    this.svg.element = this.element.querySelector(`[id="${this.uuid}svg"]`)
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


  this.parent.app.editor.insertEdge(this)
  
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
  this[t].node.resizeAllEdges(this)
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
  this.updateElement( this.node.curve, { d } );
}


    addReactivity = () => {
        this.node['curve'].addEventListener('mouseover', () => {this._onMouseOverEdge()})
        this.node['curve'].addEventListener('mouseout', () => {this._onMouseOutEdge()})
        this.node['curve'].addEventListener('click', () => {this._onClickEdge()})
    }

    _onMouseOverEdge = () => {
        this.node['curve'].style.opacity = 0.3
    }

    _onMouseOutEdge = () => {
        this.node['curve'].style.opacity = 1
    }
    _onClickEdge = () => {
        this.deinit()
    }

}