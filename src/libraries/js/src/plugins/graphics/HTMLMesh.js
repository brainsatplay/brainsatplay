import * as THREE from 'three'
import { StateManager } from '../../ui/StateManager'

export class HTMLMesh{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session, params={}) {
        this.label = label
        this.session = session
        this.params = params

        this.paramOptions = {
            scale: {default: 1},
            x: {default: 0},
            y: {default: 1},
            z: {default: -2},
            rotatex: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            rotatey: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            rotatez: {default: 0, min: -2*Math.PI, max: 2*Math.PI, step: 0.1},
            isHUD: {default: false}
        }

        this.props = {
            id: String(Math.floor(Math.random() * 1000000)),
            geometry: null,
            material: null,
            mesh: null,
            state: new StateManager(),
            lastRendered: Date.now(),
            tStart: Date.now(),
            looping: false
        }

        this.ports = {
            add: {
                types: {
                    in: null,
                    out: 'Mesh',
                }
            },
            element: {
                input: {type: Element},
                output: {type: null},
                onUpdate: (userData) => {
                    let u = userData[0]
            
                    const animate = () => {
                        if (this.props.looping){
                            this.props.mesh.material.map.update()
                            this.props.mesh.isHUD = this.params.lock
                            setTimeout(animate, 1000/10)
                        }
                    }
            
                    this.props.mesh = new ThreeHTMLMesh(u.data)
                    this.props.mesh.isHUD = this.params.isHUD
                    this.session.graph.runSafe(this,'add',[{data:true, force: true}])
                    animate()
                }
            },
            scale: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dx: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
            dy: {
                types: {
                    in: 'number',
                    out: null,
                }
            },
        }

    }

    init = () => {
        // Subscribe to Changes in Parameters
        this.props.state.addToState('params', this.params, () => {
            if (Date.now() - this.props.lastRendered > 500){
                this.session.graph.runSafe(this,'add',[{data:true, force: true}])
                this.props.lastRendered = Date.now()
            }
        })

        this.props.looping = true 
    }

    deinit = () => {
        if (this.props.mesh){
            if (this.props.mesh.type === 'Mesh') {
                this.props.mesh.geometry.dispose();
                this.props.mesh.material.dispose();
            }
        }
        this.props.looping = false
    }

    add = () => {
        if (this.props.mesh != null){
            this.props.mesh.scale.set(this.params.scale, this.params.scale,this.params.scale)
            this.props.mesh.position.set(this.params.x, this.params.y, this.params.z)
            this.props.mesh.rotateX(this.params.rotatex)
            this.props.mesh.rotateY(this.params.rotatey)
            this.props.mesh.rotateZ(this.params.rotatez)

            return [{data: this.props.mesh, meta: {label: this.label}}]
        }
    }

    scale = (userData) => {
        this.params.scale = Math.abs(Number.parseFloat(userData[0].data))
        this.session.graph.runSafe(this,'add',[{data:true, force: true}])
    }

    dx = (userData) => {
        let desiredX = Number.parseFloat(this.params.x) + Number.parseFloat(userData[0].data)
        if (desiredX > 0){
            this.params.x = desiredX
            this.session.graph.runSafe(this,'add',[{data:true, force: true}])
        }
    }

    dy = (userData) => {
        let desiredY =  Number.parseFloat(this.params.y) + Number.parseFloat(userData[0].data)
        if (desiredY > 0){
            this.params.y = desiredY
            this.session.graph.runSafe(this,'add',[{data:true, force: true}])
        }
    }
}



// Adapted from https://github.com/mrdoob/three.js/blob/d4aa9e00ea29808534a3e082f602c544e5f2419c/examples/js/interactive/HTMLMesh.js
class ThreeHTMLMesh extends THREE.Mesh {

    constructor( dom ) {

        let texture = new HTMLTexture( dom );
        const geometry = new THREE.PlaneGeometry( texture.image.width * 0.001, texture.image.height * 0.001 );
        const material = new THREE.MeshBasicMaterial( {
            map: texture,
            toneMapped: false,
            transparent: true
        } );
        super( geometry, material );

        function onEvent( event ) {

            material.map.dispatchEvent( event );

        }

        this.addEventListener( 'mousedown', onEvent );
        this.addEventListener( 'mousemove', onEvent );
        this.addEventListener( 'mouseup', onEvent );
        this.addEventListener( 'click', onEvent );

    }

}

class HTMLTexture extends THREE.CanvasTexture {

    constructor( dom ) {

        super( html2canvas( dom ) );
        this.dom = dom;
        this.anisotropy = 16;
        this.encoding = THREE.sRGBEncoding;
        this.minFilter = THREE.LinearFilter;
        this.magFilter = THREE.LinearFilter;

    }

    dispatchEvent( event ) {

        htmlevent( this.dom, event.type, event.data.x, event.data.y );
        this.update();

    }

    update() {
        this.image = html2canvas( this.dom );
        this.needsUpdate = true;
    }

} //


function html2canvas( element ) {

    var range = document.createRange();

    function Clipper( context ) {

        var clips = [];
        var isClipping = false;

        function doClip() {

            if ( isClipping ) {

                isClipping = false;
                context.restore();

            }

            if ( clips.length === 0 ) return;
            var minX = - Infinity,
                minY = - Infinity;
            var maxX = Infinity,
                maxY = Infinity;

            for ( var i = 0; i < clips.length; i ++ ) {

                var clip = clips[ i ];
                minX = Math.max( minX, clip.x );
                minY = Math.max( minY, clip.y );
                maxX = Math.min( maxX, clip.x + clip.width );
                maxY = Math.min( maxY, clip.y + clip.height );

            }

            context.save();
            context.beginPath();
            context.rect( minX, minY, maxX - minX, maxY - minY );
            context.clip();
            isClipping = true;

        }

        return {
            add: function ( clip ) {

                clips.push( clip );
                doClip();

            },
            remove: function () {

                clips.pop();
                doClip();

            }
        };

    }

    function drawText( style, x, y, string ) {

        if ( string !== '' ) {

            if ( style.textTransform === 'uppercase' ) {

                string = string.toUpperCase();

            }

            context.font = style.fontSize + ' ' + style.fontFamily;
            context.textBaseline = 'top';
            context.fillStyle = style.color;
            context.fillText( string, x, y );

        }

    }

    function drawBorder( style, which, x, y, width, height ) {

        var borderWidth = style[ which + 'Width' ];
        var borderStyle = style[ which + 'Style' ];
        var borderColor = style[ which + 'Color' ];

        if ( borderWidth !== '0px' && borderStyle !== 'none' && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)' ) {

            context.strokeStyle = borderColor;
            context.beginPath();
            context.moveTo( x, y );
            context.lineTo( x + width, y + height );
            context.stroke();

        }

    }

    function drawElement( element, style ) {

        var x = 0,
            y = 0,
            width = 0,
            height = 0;

        if ( element.nodeType === 3 ) {

            // text
            range.selectNode( element );
            var rect = range.getBoundingClientRect();
            x = rect.left - offset.left - 0.5;
            y = rect.top - offset.top - 0.5;
            width = rect.width;
            height = rect.height;
            drawText( style, x, y, element.nodeValue.trim() );

        } else {

            if ( element.style.display === 'none' ) return;
            var rect = element.getBoundingClientRect();
            x = rect.left - offset.left - 0.5;
            y = rect.top - offset.top - 0.5;
            width = rect.width;
            height = rect.height;
            style = window.getComputedStyle( element );
            var backgroundColor = style.backgroundColor;

            if ( backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)' ) {
                context.fillStyle = backgroundColor;
                context.fillRect( x, y, width, height );
            }

            drawBorder( style, 'borderTop', x, y, width, 0 );
            drawBorder( style, 'borderLeft', x, y, 0, height );
            drawBorder( style, 'borderBottom', x, y + height, width, 0 );
            drawBorder( style, 'borderRight', x + width, y, 0, height );

            if ( element.type === 'color' || element.type === 'text' ) {

                clipper.add( {
                    x: x,
                    y: y,
                    width: width,
                    height: height
                } );
                drawText( style, x + parseInt( style.paddingLeft ), y + parseInt( style.paddingTop ), element.value );
                clipper.remove();

            }

        }
        /*
// debug
context.strokeStyle = '#' + Math.random().toString( 16 ).slice( - 3 );
context.strokeRect( x - 0.5, y - 0.5, width + 1, height + 1 );
*/


        var isClipping = style.overflow === 'auto' || style.overflow === 'hidden';
        if ( isClipping ) clipper.add( {
            x: x,
            y: y,
            width: width,
            height: height
        } );

        for ( var i = 0; i < element.childNodes.length; i ++ ) {

            drawElement( element.childNodes[ i ], style );

        }

        if ( isClipping ) clipper.remove();

    }

    var offset = element.getBoundingClientRect();
    var canvas = document.createElement( 'canvas' );
    canvas.width = offset.width;
    canvas.height = offset.height;
    var context = canvas.getContext( '2d'
        /*, { alpha: false }*/
    );
    var clipper = new Clipper( context ); // console.time( 'drawElement' );

    drawElement( element ); // console.timeEnd( 'drawElement' );

    return canvas;

}

function htmlevent( element, event, x, y ) {

    const mouseEventInit = {
        clientX: x * element.offsetWidth + element.offsetLeft,
        clientY: y * element.offsetHeight + element.offsetTop,
        view: element.ownerDocument.defaultView
    };
    window.dispatchEvent( new MouseEvent( event, mouseEventInit ) );
    const rect = element.getBoundingClientRect();
    x = x * rect.width + rect.left;
    y = y * rect.height + rect.top;

    function traverse( element ) {

        if ( element.nodeType !== 3 ) {

            const rect = element.getBoundingClientRect();

            if ( x > rect.left && x < rect.right && y > rect.top && y < rect.bottom ) {

                element.dispatchEvent( new MouseEvent( event, mouseEventInit ) );

            }

            for ( var i = 0; i < element.childNodes.length; i ++ ) {

                traverse( element.childNodes[ i ] );

            }

        }

    }

    traverse( element );

}