
export let createConnection = (container, el1,el2) => {

    let id=String(Math.floor(Math.random()*1000000))
    
    container.insertAdjacentHTML('beforeend',`
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}svg" class="edge" viewBox="0 0 500 500", preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="250" r="30" class="p1 control" />
      <circle cx="400" cy="250" r="30" class="p2 control" />

      <circle cx="250" cy="100" r="20" class="c1 control" />

      <line x1="100" y1="250" x2="250" y2="100" class="l1"/>
      <line x1="400" y1="250" x2="250" y2="100" class="l2"/>

      <path d="M100,250 Q250,100 400,250" class="curve"/>
    </svg>
    `)


let svg = document.getElementById(`${id}svg`)
const NS = svg.getAttribute('xmlns')
const vb = svg.getAttribute('viewBox').split(' ').map(v => +v)
const box = {
    xMin: vb[0], xMax: vb[0] + vb[2] - 1,
    yMin: vb[1], yMax: vb[1] + vb[3] - 1
  }
const node = {};

'p1,p2,c1,l1,l2,curve'.split(',').map(s => {
  node[s] = container.getElementsByClassName(s)[0];
});
let drag;

// events
svg.addEventListener('pointerdown', dragHandler);
container.addEventListener('pointermove', dragHandler);
container.addEventListener('pointerup', dragHandler);

drawCurve();


// drag handler
function dragHandler(event) {

  event.preventDefault();

const target = event.target
const type = event.type
const svgP = svgPoint(svg, event.clientX, event.clientY);


  // start drag
  console.log(target.classList.contains('control'))
  if (!drag && type === 'pointerdown' && target.classList.contains('control')) {

    drag = {
      node: target,
      start: getControlPoint(target),
      cursor: svgP
    };

    drag.node.classList.add('drag');

  }

  // move element
  if (drag && type === 'pointermove') {

    updateElement(
      drag.node,
      {
        cx: Math.max(box.xMin, Math.min( drag.start.x + svgP.x - drag.cursor.x, box.xMax )),
        cy: Math.max(box.yMin, Math.min( drag.start.y + svgP.y - drag.cursor.y, box.yMax ))
      }
    );

    drawCurve();

  }

  // stop drag
  if (drag && type === 'pointerup') {

    drag.node.classList.remove('drag');
    drag = null;

  }

}


// translate page to SVG co-ordinate
function svgPoint(element, x, y) {

  var pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(element.getScreenCTM().inverse());

}


// update element
function updateElement(element, attr) {

  for (let a in attr) {
    let v = attr[a];
    element.setAttribute(a, isNaN(v) ? v : Math.round(v));
  }

}


// get control point location
function getControlPoint(circle) {

  return {
    x: Math.round( +circle.getAttribute('cx') ),
    y: Math.round( +circle.getAttribute('cy') )
  }

}


// update curve
function drawCurve() {

  const
    p1 = getControlPoint(node.p1),
    p2 = getControlPoint(node.p2),
    c1 = getControlPoint(node.c1);

  // control line 1
  updateElement(
    node.l1,
    {
      x1: p1.x,
      y1: p1.y,
      x2: c1.x,
      y2: c1.y
    }
  );

  // control line 2
  updateElement(
    node.l2,
    {
      x1: p2.x,
      y1: p2.y,
      x2: c1.x,
      y2: c1.y
    }
  );

  // curve
  const d = `M${p1.x},${p1.y} Q${c1.x},${c1.y} ${p2.x},${p2.y}` +
    (node.curve.classList.contains('fill') ? ' Z' : '');

  updateElement( node.curve, { d } );
}

}