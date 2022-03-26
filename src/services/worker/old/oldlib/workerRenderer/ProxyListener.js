//From Worker Thread


function noop() {
}

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html

export class EventDispatcher {
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
        data.preventDefault = noop;
        data.stopPropagation = noop;
        this.dispatchEvent(data);
    }

    focus() {}
}

/////////////https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
export class ProxyManager {
    constructor() {
      this.id = 'proxy'+Math.floor(Math.random()*10000);
      this.targets = {};
      this.handleEvent = this.handleEvent.bind(this);
    }

    makeProxy(data) {        
      const {id} = data;
      const proxy = new ElementProxyReceiver();
      this.targets[id] = proxy;
    }

    getProxy(id) {
      return this.targets[id];
    }

    handleEvent(data) {
      this.targets[data.id].handleEvent(data.data);
    }
}

