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
            if (this.parent.app.editor){
                this._createUI()
            }

            this.onstart = []
    }


    init = async () => {

        let res = await this._activateUI()
        if (res === true){
          await this._activate()
        }
        return res
    }

    _activate = async () => {

      let sP = this.source.port
      let tP = this.target.port

      // Activate Functionality
      this.parent.app.state.data[this.uuid] = this.value

      // this.subscription = this.parent.app.state.subscribeTrigger(this.uuid, this.onchange)

      // Register Edge in Ports
      this.source.node.edges.set(this.uuid, this)
      this.target.node.edges.set(this.uuid, this)
      sP.addEdge('output', this)
      tP.addEdge('input', this)

      // Activate Dyhamic Analyses
  
      if (tP.analysis && (tP.edges.input.size > 0 || tP.type === null) && (tP.edges.output.size > 0 || tP.type === null)) this.parent.app.analysis.dynamic.push(...tP.analysis)
      if (sP.analysis && (sP.edges.input.size > 0 || sP.type === null) && (sP.edges.output.size > 0 || sP.type === null)) this.parent.app.analysis.dynamic.push(...sP.analysis)


      // Update Brainstorm ASAP
      let brainstormTarget = this.target.node.className === 'Brainstorm'

      if (brainstormTarget) {
          this.parent.app.streams.push(this.source.port.label) // Keep track of streams
          await this.update() // Pass to Brainstorm
      }

      // Setup Onstart Callbacks (send to Brainstorm OR Elements, Functions, or Objects)
      let isElement = sP.value instanceof Element || sP.value instanceof HTMLDocument
      let isFunction = sP.value instanceof Function
      let isObject = sP.value instanceof Object
      let isGLSL = sP.output?.type === 'GLSL'
      let isHTML = sP.output?.type === 'HTML'
      let isCSS = sP.output?.type === 'CSS'

      if (brainstormTarget || isElement || isFunction  || isObject || isGLSL || isHTML || isCSS) {
        this.onstart.push(this.update) // Pass on applicadtion start
      }

      if (this.parent.app.props.ready) await this.update() // Indiscriminately activate edge with initial value (when drawing edge)

      this.addReactivity() 
    }

    deinit = () => {

        // this.parent.app.state.unsubscribeTrigger(this.uuid, this.subscription); //unsub state
        if (this.source.node) this.source.node.edges.delete(this.uuid)
        if (this.target.node) this.target.node.edges.delete(this.uuid)
        if (this.source.port) this.source.port.removeEdge('output',this.uuid)
        if (this.target.port) this.target.port.removeEdge('input',this.uuid)

        if (this.parent.edges.get(this.uuid)) this.parent.edges.delete(this.uuid)


        this.element.remove()

    }

    // Pass Information from Source to Target
     update = async (port=this.source.port) => {
         if (port.value !== undefined){
            let returned = await this.target.port.set(port)

            let visible = document.body.contains(this.node.curve) // in DOM
            // && (this.node.curve?.offsetParent != null) // not hidden

            if (visible) this.animate()

            return returned
         }
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

            let port = this[o.type].port
            if (port){
                let portElement = port.ui[o.port]
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
            }
        })

        svgPorts = svgPorts.filter(s => s != undefined)
        if (svgPorts.length > 1) this.updateControlPoints(...svgPorts)

        this.drawCurve();

    }

  mouseAsTarget = (type, upCallback) => {

    let label = (type === 'source') ? 'p1' : 'p2'
    let otherType = (type === 'source') ? 'target' : 'source'
    let inorout = (otherType === 'source') ? 'output' : 'input'

    
      let onMouseMove = (e) => {

        let visible = document.body.contains(this.svg.element) // in DOM
        // && (this.svg.element?.offsetParent != null) // not hidden
        
        if (visible) this.resizeElement()

        let dims = this[otherType].port.ui[inorout].getBoundingClientRect()
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
      if (e.target != this[otherType].port.ui[inorout] && e.target.classList.contains('node-port')){
        if (Array.from(e.target.parentNode.parentNode.classList).find(str => str.includes(type))){
          let node = this.parent.getNode(e.target.getAttribute('data-node'))
          let port = node.getPort(e.target.getAttribute('data-port'))
          this[type]  = {node, port}
          upCallback(true)
        } else {
          upCallback('Cannot connect two ports of the same type.')
        }
      } else {
        this.deinit()
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
    return new Promise(async (resolve, reject)=> {

    let res = await this.insert(this.parentNode) // insert into UI        
    let match,compatible, sourceType, targetType;

    if (res){

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
      
      if (res === true && match == null && compatible) resolve(true)
      else {
          this.deinit()

          // Continue Execution
          if (res != true) {
            if (this.parent.app.props.ready) resolve({msg: 'edge is incomplete', edge: this})
            else resolve({msg: `edge from ${this.source.node?.name} (${this.source.port?.name}) to ${this.target.node?.name} (${this.target.port?.name}) does not exist on initialization`, edge: this})
          } 
          
          // Stop Execution
          else if (match == null) reject(`edge from ${this.source.node?.name} (${this.source.port?.name}) to ${this.target.node?.name} (${this.target.port?.name}) already exists`) // not currently checking
          else reject(res)

      }
    })
}


insert = () => {
  return new Promise(async (resolve)=> {

      this.parent.ui.graph.insertAdjacentElement('beforeend', this.element)

      this.parent.ui.editing = true

      this.types.forEach(t => {
        if (this[t].port == null){
          if (this.parent.app.props.ready){
            this.mouseAsTarget(t,async (res) => {
              if (res === true) {
                this.parent.ui.editing = false
                resolve(true) 
              }
              else resolve(res)
            })
          } else resolve(false)
        }
      })
      
      this.drawCurve();

      this.types.forEach(t => {
        if (this[t].node) this[t].node.resizeAllEdges(this)
      })

      if (this.source.port && this.target.port) resolve(true)
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

    // ---------------- EXPORT HELPER ----------------
    export = () => {
      let edge = {
        source: {node: this.source.node.name, port: this.source.port.name},
        target: {node: this.target.node.name, port: this.target.port.name}
      }
      return edge
    }

}