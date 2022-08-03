//from UI thread

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
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
export function initProxyElement(element, worker) {

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

    const id = 'proxy'+Math.floor(Math.random()*10000);

    const sendEvent = (data) => {
      worker.postMessage({route:'proxyHandler',args:[data,id]}); //for use with our service syntax
    };

    // register an id
    worker.postMessage({route:'makeProxy', args:id})

    let entries = Object.entries(eventHandlers);
    
    for (const [eventName, handler] of entries) {
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
    globalThis.addEventListener('resize', sendSize);
  
    return id;

}


//From Worker Thread

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
export class EventDispatcher {

  _listeners:any;


	addEventListener( type, listener ) {
		if ( this._listeners === undefined ) this._listeners = {};
		const listeners = this._listeners;
		if ( listeners[ type ] === undefined ) {
			listeners[ type ] = [];
		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {
			listeners[ type ].push( listener );
		}

	}

	hasEventListener( type, listener ) {
		if ( this._listeners === undefined ) return false;
		const listeners = this._listeners;
		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;
	}

	removeEventListener( type, listener ) {
		if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ type ];
		if ( listenerArray !== undefined ) {
			const index = listenerArray.indexOf( listener );
			if ( index !== - 1 ) {
				listenerArray.splice( index, 1 );
			}
		}
	}

	dispatchEvent( event ) {
		if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];
		if ( listenerArray !== undefined ) {
			event.target = this;
			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {
				array[ i ].call( this, event );
			}
			event.target = null;
		}
	}
}

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
export class ElementProxyReceiver extends EventDispatcher {

  style:any;
  width:any;
  left:any;
  right:any;
  top:any;
  height:any;

    constructor() {
        super();
        // because OrbitControls try to set style.touchAction;
        this.style = {};
    }
    get clientWidth() {
        return this.width;
    }
    get clientHeight() {
        return this.height;
    }
    // OrbitControls call these as of r132. Maybe we should implement them
    setPointerCapture() {}

    releasePointerCapture() {}

    getBoundingClientRect() {
        return {
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            right: this.left + this.width,
            bottom: this.top + this.height,
        };
    }

    handleEvent(data) {
        if (data.type === 'size') {
            this.left = data.left;
            this.top = data.top;
            this.width = data.width;
            this.height = data.height;
            return;
        }
        data.preventDefault = function noop() {
        };
        data.stopPropagation = function noop() {
        };
        this.dispatchEvent(data);
    }

    focus() {}
}

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
export class ProxyManager {

    id:any;
    targets:any;

    constructor() {
      this.id = 'proxy'+Math.floor(Math.random()*10000);
      this.targets = {};
      this.handleEvent = this.handleEvent.bind(this);
    }

    makeProxy(id) {        
        if(!id) id = `proxyReceiver${Math.floor(Math.random()*1000000000000)}`
        const proxy = new ElementProxyReceiver();
        this.targets[id] = proxy;
    }

    getProxy(id) {
      return this.targets[id];
    }

    handleEvent(data,id) {
      this.targets[id].handleEvent(data);
    }
}


//just load these into the worker service front and back
export const proxyWorkerRoutes = {
    initProxyElement:initProxyElement,
    makeProxy:(self,origin,id) => {
        if(!self.graph.PROXYELEMENTS) self.graph.PROXYELEMENTS = new ProxyManager();

        self.graph.PROXYELEMENTS.makeProxy(id);

        return id;
    },
    handleProxyEvent:(self,origin,data,id)=>{
        self.graph.PROXYELEMENTS.handleEvent(data,id);
        return id;
    }
} 