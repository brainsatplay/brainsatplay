//from UI thread

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
import { WorkerManager } from "../../WorkerManager";
  

function noop() {
}

export class ProxyElement {
  constructor(element, origin, workerId, eventHandlers, manager) {
    this.id = 'proxy'+Math.floor(Math.random()*10000);
    this.eventHandlers = eventHandlers;
    this.origin = origin;
    this.workerId = workerId;
    this.manager = (manager instanceof WorkerManager) ? manager : new WorkerManager();

    const sendEvent = (data) => {
        this.manager.runWorkerFunction(
            'proxyHandler',
            {type:'event',id:this.id,data:data},
            this.workerId,
            this.origin
        );
    };

    // register an id
    this.manager.runWorkerFunction(
        'proxyHandler',
        {type:'makeProxy',id:this.id},
        this.workerId,
        this.origin
    );


    for (const [eventName, handler] of Object.entries(this.eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }

    const sendSize = () => {
      
        const rect = element.getBoundingClientRect();
        sendEvent({
          type: 'size',
          left: rect.left,
          top: rect.top,
          width: element.clientWidth,
          height: element.clientHeight,
        });
    }

    sendSize();
    // really need to use ResizeObserver
    window.addEventListener('resize', sendSize);
  }
}

const mouseEventHandler = makeSendPropertiesHandler([
    'ctrlKey',
    'metaKey',
    'shiftKey',
    'button',
    'pointerType',
    'clientX',
    'clientY',
    'pageX',
    'pageY',
  ]);
  const wheelEventHandlerImpl = makeSendPropertiesHandler([
    'deltaX',
    'deltaY',
  ]);
  const keydownEventHandler = makeSendPropertiesHandler([
    'ctrlKey',
    'metaKey',
    'shiftKey',
    'keyCode',
  ]);
  
  function wheelEventHandler(event, sendFn) {
    event.preventDefault();
    wheelEventHandlerImpl(event, sendFn);
  }
  
  function preventDefaultHandler(event) {
    event.preventDefault();
  }
  
  function copyProperties(src, properties, dst) {
    for (const name of properties) {
        dst[name] = src[name];
    }
  }
  
  function makeSendPropertiesHandler(properties) {
    return function sendProperties(event, sendFn) {
      const data = {type: event.type};
      copyProperties(event, properties, data);
      sendFn(data);
    };
  }
  
  function touchEventHandler(event, sendFn) {
    const touches = [];
    const data = {type: event.type, touches};
    for (let i = 0; i < event.touches.length; ++i) {
      const touch = event.touches[i];
      touches.push({
        pageX: touch.pageX,
        pageY: touch.pageY,
      });
    }
    sendFn(data);
  }
  
  // The four arrow keys
  const orbitKeys = {
    '37': true,  // left
    '38': true,  // up
    '39': true,  // right
    '40': true,  // down
  };

  function filteredKeydownEventHandler(event, sendFn) {
    const {keyCode} = event;
    if (orbitKeys[keyCode]) {
      event.preventDefault();
      keydownEventHandler(event, sendFn);
    }
  }

  //do this on main thread
  export function initProxyElement(element, workerId, origin) {

    const eventHandlers = {
        contextmenu: preventDefaultHandler,
        mousedown: mouseEventHandler,
        mousemove: mouseEventHandler,
        mouseup: mouseEventHandler,
        pointerdown: mouseEventHandler,
        pointermove: mouseEventHandler,
        pointerup: mouseEventHandler,
        touchstart: touchEventHandler,
        touchmove: touchEventHandler,
        touchend: touchEventHandler,
        wheel: wheelEventHandler,
        keydown: filteredKeydownEventHandler,
    };
    
    const proxy = new ProxyElement(
      element, origin, workerId, eventHandlers, this
    );

    return proxy;

  }



