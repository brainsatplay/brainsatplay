import {Session} from '../../../../../library/src/Session'
import {DOMFragment} from '../../../../../library/src/ui/DOMFragment'
 
import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import mapVertexShader from './shaders/map/vertex.glsl'
import mapFragmentShader from './shaders/map/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GlitchPass } from './postprocessing/CustomGlitchPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { gsap } from 'gsap'
import mapTexture from "./img/mapTexture.jpeg"
import mapDisp from "./img/mapDisplacement.jpeg"
import * as settingsFile from './settings'

//Example Applet for integrating with the UI Manager
export class NexusApplet {

    constructor(
        parent=document.body,
        session=new Session(),
        settings=[]
    ) {
    
        //-------Keep these------- 
        this.parentNode = parent;
        this.settings = settings;
        this.info = settingsFile.settings
        this.session = session; //Reference to the Session to access data and subscribe
        this.AppletHTML = null;
        //------------------------

        this.props = { //Changes to this can be used to auto-update the HTML and track important UI values 
            id: String(Math.floor(Math.random()*1000000)), //Keep random ID
            //Add whatever else
        };

        this.three = {}

        this.neurofeedbackColors = {
            'scp': [0,0,1],
            'delta' : [0,0.5,1],
            'theta' : [1,0,1],
            'alpha1' : [0,1,0],
            'alpha2' : [0,1,0],
            'beta' : [1,1,0],
            'lowgamma' : [1,0,0],
            'highgamma' : [1,0,0],
        }

        this.stateIds = []
        this.dynamicProps = {}
        this.pointInfo = {}

        this.edges = []
    }

    init() {

        let HTMLtemplate = (props=this.props) => { 
            return `
            <div id='${props.id}' class="wrapper" style='height:100%; width:100%; position: relative; overflow: none;'>
                <div class="nexus-loading-bar" style="z-index: 6;"></div>
                <div id='${props.id}gameHero' class="nexus-container" style="z-index: 5"><div>
                <h1>Nexus</h1>
                <p>Neurofeedback + Group Meditation</p>
                </div></div>

                <div id='${props.id}login-screen' class="nexus-container" style="z-index: 4"><div>
                    <h2>Choose your Username</h2>
                    <div id="${props.id}login-container" class="form-container">
                        <div id="${props.id}login" class="form-context">
                            <p id="${props.id}login-message" class="small"></p>
                            <div class='flex'>
                                <form id="${props.id}login-form" action="">
                                    <div class="login-element" style="margin-left: 0px; margin-right: 0px">
                                        <input type="text" name="username" autocomplete="off" placeholder="Username or email"/>
                                    </div>
                                </form>
                            </div>
                            <div class="login-buttons" style="justify-content: flex-start;">
                                <div id="${props.id}login-button" class="nexus-button">Sign In</div>
                            </div>
                        </div>
                    </div>
                </div></div>

                <div id='${props.id}gameSelection' class="nexus-container" style="z-index: 3"><div>
                    <div id='${props.id}multiplayerDiv'">
                    <div style="
                    display: flex;
                    align-items: center;
                    column-gap: 15px;
                    grid-template-columns: repeat(2,1fr)">
                        <h2>Choose a Game</h2>
                        <button id='${props.id}createGame' class="nexus-button" style="flex-grow:0; padding: 10px; width: auto; min-height: auto; font-size: 70%;">Make Game session</button>
                    </div>
                    </div>
                </div></div>

                <div class="nexus-point-container"></div>
                <div class="nexus-renderer-container"><canvas class="nexus-webgl"></canvas></div>
                <div id='${props.id}exitGame' class="nexus-button" style="position: absolute; bottom: 25px; right: 25px;">Exit Game</div>
            </div>
            `;
        }

        //HTML UI logic setup. e.g. buttons, animations, xhr, etc.
        let setupHTML = (props=this.props) => {

            // Setup HTML References
            let loginScreen = document.getElementById(`${props.id}login-screen`)
            let gameSelection = document.getElementById(`${props.id}gameSelection`)
            let exitGame = document.getElementById(`${props.id}exitGame`)

            // Create Game Brower
            let baseBrowserId = `${props.id}${this.info.name}`
            document.getElementById(`${props.id}multiplayerDiv`).innerHTML += `<button id='${baseBrowserId}search' class="nexus-button">Search</button>`
            document.getElementById(`${props.id}multiplayerDiv`).innerHTML += `<div id='${baseBrowserId}browserContainer' style="overflow-x: scroll; box-sizing: border-box; padding: 10px 0; overflow-y: hidden; height: 100%; width: 100%;"><div id='${baseBrowserId}browser' style='display: flex; align-items: center; width: 100%; font-size: 80%; overflow-x: scroll; box-sizing: border-box; padding: 0px 5%;'></div></div>`;
    
            let waitForReturnedMsg = (msgs, callback = () => {}) => {
                if (msgs.includes(this.session.state.data.commandResult.msg)){
                    callback(this.session.state.data.commandResult.msg)
                } else {
                    setTimeout(()=> waitForReturnedMsg(msgs,callback), 250)
                }
            }

            let onjoined = () => {
                console.log('Joined game!', this.info.name); 
                gameSelection.style.opacity = 0;
                gameSelection.style.pointerEvents = 'none'
            }
            let onleave = () => {
                console.log('Left game!', this.info.name)
                gameSelection.style.opacity = 1;
                gameSelection.style.pointerEvents = 'auto'
            }

            let gameSearch = document.getElementById(`${baseBrowserId}search`)

            gameSearch.onclick = () => {
    
                this.session.getGames(this.info.name, (result) => {
                    let gridhtml = '';
                    
                    result.gameInfo.forEach((g,i) => {
                        if (g.usernames.length < 10){ // Limit connections to the same game server
                            gridhtml += `<div><h3>`+g.id+`</h3><p>Streamers: `+g.usernames.length+`</p><div><button id='`+g.id+`connect' style="margin-top: 5px;" class="nexus-button">Connect</button><input id='`+baseBrowserId+`spectate' type='checkbox' style="display: none"></div></div>`
                        } else {
                            result.gameInfo.splice(i,1)
                        }
                    });
    
                    document.getElementById(baseBrowserId+'browser').innerHTML = gridhtml
    
                    result.gameInfo.forEach((g) => { 
                        let connectButton = document.getElementById(`${g.id}connect`)
                        connectButton.onclick = () => {
                            let spectate = true
                            if (this.session.deviceConnected) spectate = false
                            this.session.subscribeToGame(g.id,spectate,undefined,(subresult) => {
                                onjoined(g);

                                exitGame.onclick = () => {
                                    this.session.unsubscribeFromGame(g.id,()=>{
                                        onleave(g);
                                        exitGame.onclick=null
                                    });
                                }
                            });
                        }
                    });
                });
            }

            // Set Up Screen Two (Login)
            document.getElementById(`${props.id}login-button`).onclick = () => {
                let form = document.getElementById(`${props.id}login-form`)
                let formDict = {}
                let formData = new FormData(form);
                for (var pair of formData.entries()) {
                    formDict[pair[0]] = pair[1];
                } 

                let onsocketopen = () => {
                    if (this.session.socket.readyState === 1){
                        gameSearch.click()
                        waitForReturnedMsg(['getGamesResult','gameNotFound'], (msg) => {
                            console.log(msg)
                            if (msg === 'gameNotFound'){
                                createGame.click()
                                waitForReturnedMsg('gameCreated', () => {
                                    gameSearch.click()
                                    loginScreen.style.opacity = 0;
                                    loginScreen.style.pointerEvents = 'none'
                                })
                            } else {
                                loginScreen.style.opacity = 0;
                                loginScreen.style.pointerEvents = 'none'
                            }
                        })
                    } else {
                        setTimeout(()=> onsocketopen(), 500)
                    }
                }

                this.session.setLoginInfo(formDict.username)
                this.session.login(true).then(() => {
                    onsocketopen(this.session.socket)
                })
            }

            exitGame.onclick = () => {
                gameSelection.style.opacity = 1;
                gameSelection.style.pointerEvents = 'auto'
            }

            let createGame = document.getElementById(`${props.id}createGame`)

            createGame.onclick = () => {
                this.session.sendWSCommand(['createGame',this.info.name,['eeg'],['eegfftbands_FP1_all','eegfftbands_FP2_all','eegfftbands_AF7_all','eegfftbands_AF8_all','frontalcoherencesc','dynamicProps']]);

                waitForReturnedMsg(['gameCreated'],() => {gameSearch.click()})
            }
            // createGame.style.display = 'none'
            gameSearch.style.display = 'none'
    }

        this.AppletHTML = new DOMFragment( // Fast HTML rendering container object
            HTMLtemplate,       //Define the html template string or function with properties
            this.parentNode,    //Define where to append to (use the parentNode)
            this.props,         //Reference to the HTML render properties (optional)
            setupHTML,          //The setup functions for buttons and other onclick/onchange/etc functions which won't work inline in the template string
            undefined,          //Can have an onchange function fire when properties change
            "NEVER"             //Changes to props or the template string will automatically rerender the html template if "NEVER" is changed to "FRAMERATE" or another value, otherwise the UI manager handles resizing and reinits when new apps are added/destroyed
        );  

        if(this.settings.length > 0) { this.configure(this.settings); } //You can give the app initialization settings if you want via an array.


        // Set a dynamic property for your location
        this.dynamicProps.location = {latitude: NaN, longitude: NaN}
        this.stateIds.push(this.session.streamAppData('dynamicProps', this.dynamicProps,(newData) => {
            console.log("New data detected! Will be sent!");
        }))

        this.session.addStreamFunc(
            'frontalcoherencescore', 
            (band='alpha1') => {
                let score = null;
                if(this.session.atlas.settings.coherence) {
                    let coherenceBuffer = this.session.atlas.getFrontalCoherenceData().means[band]
                    if(coherenceBuffer.length > 0) {
                        let samplesToSmooth = Math.min(20,coherenceBuffer.length);
                        let slice = coherenceBuffer.slice(coherenceBuffer.length-samplesToSmooth)
                        let mean = slice.reduce((tot,val) => tot + val)/samplesToSmooth
                        score = slice[slice.length-1] - mean
                    }
                }
            return score;
            }
        )
/**
 * Nexus: Neurofeedback + Group Meditation
 */

// Raycaster
const raycaster = new THREE.Raycaster()

// Loading Manager
const loadingBarElement = document.querySelector('.nexus-loading-bar')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(3.0,() => 
        {
        if (this.three.canvas != null){
            this.resizeNexus()
            this.three.canvas.style.display = 'block'
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
            let hero = document.getElementById(`${this.props.id}gameHero`)
            hero.style.opacity = 0;
            hero.style.pointerEvents = 'none'
            this.three.getGeolocation()
            gsap.delayedCall(0.5,() => 
            {
                this.points.forEach(p => {
                    p.active = true;
                })
                this.glitchPass.enabled = true
                this.glitchPass.lastGlitchTime = Date.now();
                this.controls.enabled = true;
            })
        }
    })
    },

    // Progress
    (itemURL, itemsLoaded, itemsTotal) => {
        loadingBarElement.style.transform = `scaleX(${itemsLoaded/itemsTotal})`
    }
)

// Textures
const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load(mapTexture)
const displacementMap = textureLoader.load(mapDisp)

/**
 * Canvas
 */
this.appletContainer = document.getElementById(this.props.id)
this.three.canvas = this.appletContainer.querySelector('canvas.nexus-webgl')

/**
 * Scene
 */
this.three.scene = new THREE.Scene()

/**
 * Camera
 */
this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
this.camera.position.z = 3

this.three.renderer = new THREE.WebGLRenderer({
    canvas: this.three.canvas,
    alpha: true
})

/**
 * Texture Params
 */
 let imageWidth = 1200
 let imageHeight = 600
 const segmentsX = 400
 const imageAspect = imageWidth/imageHeight
 let fov_y = this.camera.position.z * this.camera.getFilmHeight() / this.camera.getFocalLength();
 this.pointInfo.meshWidth = (fov_y  - 1.0)* this.camera.aspect;
 this.pointInfo.meshHeight = this.pointInfo.meshWidth / imageAspect;

// Renderer
this.three.renderer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight);
this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
this.appletContainer.querySelector('.nexus-renderer-container').appendChild(this.three.renderer.domElement)
this.three.canvas.style.display = 'none'
// GUI
// const gui = new dat.GUI({width: 400});

/** 
 * Postprocessing 
 **/

 // Render Target

 let RenderTargetClass = null

 if(this.three.renderer.getPixelRatio() === 1 && this.three.renderer.capabilities.isWebGL2)
 {
     RenderTargetClass = THREE.WebGLMultisampleRenderTarget
 }
 else
 {
     RenderTargetClass = THREE.WebGLRenderTarget
 }

 const renderTarget = new RenderTargetClass(
    window.innerWidth , window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        maxFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        type: THREE.HalfFloatType // For Safari (doesn't work)
    }
 )

 // Composer
const effectComposer = new EffectComposer(this.three.renderer,renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight)

 // Passes
const renderPass = new RenderPass(this.three.scene, this.camera)
effectComposer.addPass(renderPass)

this.glitchPass = new GlitchPass()
this.glitchPass.goWild = false
this.glitchPass.enabled = false
effectComposer.addPass(this.glitchPass)

const shaderPass = new ShaderPass(RGBShiftShader)
shaderPass.enabled = true
effectComposer.addPass(shaderPass)

const bloomPass = new UnrealBloomPass()
bloomPass.enabled = true
// bloomPass.strength = 0.5
// bloomPass.radius = 1
// bloomPass.threshold = 0.6
effectComposer.addPass(bloomPass)

// // Custom Shader Pass
// const customPass = new ShaderPass({
//     uniforms: {
//         tDiffuse: { value: null },
//         uInterfaceMap: { value: null }
//     },
//     vertexShader: interfaceVertexShader,
//     fragmentShader: interfaceFragmentShader
// })
// customPass.material.uniforms.uInterfaceMap.value = futuristicInterface
// effectComposer.addPass(customPass)

// Antialiasing
if(this.three.renderer.getPixelRatio() === 1 && !this.three.renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
    console.log('Using SMAA')
}


// Controls
this.controls = new OrbitControls(this.camera, this.three.renderer.domElement)
this.controls.screenSpacePanning = true
this.controls.enableDamping = true
this.controls.enabled = false;

// Mouse
const mouse = new THREE.Vector2()
this.appletContainer.addEventListener('mousemove', (e) => {
    mouse.x = (e.layerX/this.appletContainer.clientWidth) * 2 - 1
    mouse.y = -(e.layerY/this.appletContainer.clientHeight) * 2 + 1
})


this.appletContainer.addEventListener('click', () => {
    if (currentIntersect){
        currentIntersect.object.material.opacity = 1.0 
    }
})

// Set Default Users
this.MAXPOINTS = 10
this.points = new Map()
this.pointInfo.diameter = 1e-2/4;


// Plane
const planeGeometry = new THREE.PlaneGeometry(this.pointInfo.meshWidth, this.pointInfo.meshHeight, segmentsX, segmentsX/imageAspect)
let tStart = Date.now()
this.colorReachBase = 0.030;
this.material = new THREE.ShaderMaterial({
    vertexShader: mapVertexShader,
    fragmentShader: mapFragmentShader,
    transparent: true,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    uniforms:
    {
        points: { value: Array.from({length: this.MAXPOINTS}, e => new THREE.Vector2(null,null))},
        count: {value: 1 },
        uTime: { value: 0 },
        uTexture: { value: texture },
        displacementMap: { value: displacementMap },
        displacementHeight: { value: 0.025 },
        colorThresholds: { value: Array.from({length: this.MAXPOINTS}, e => this.colorReachBase)},
        aspectRatio: {value: window.innerWidth / window.innerHeight}
    }
})



// Mesh
const plane = new THREE.Mesh(planeGeometry, this.material)
this.three.scene.add(plane)

// Resize
this.resizeNexus = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.pointInfo.meshWidth = (fov_y  - 1.0)* this.camera.aspect;
    this.pointInfo.meshHeight = this.pointInfo.meshWidth / imageAspect
    regeneratePlaneGeometry()
    let pointsUniform = Array.from({length: this.MAXPOINTS}, e => new THREE.Vector2(null,null))
    let pointIter = 0
    this.points.forEach((point,key) => {
        if (point.active){
            point.updateMesh(this.pointInfo.meshWidth,this.pointInfo.meshHeight)
            let screenPos = point.marker.position.clone()
            screenPos.project(this.camera)
            let translateX = this.appletContainer.clientWidth * screenPos.x * 0.5
            point.element.style.transform = `translate(${translateX}px)`
            let translateY = this.appletContainer.clientHeight * screenPos.y * 0.5
            point.element.style.transform = `translate(${translateY}px)`
        }
        pointsUniform[pointIter] = new THREE.Vector2(point.x,point.y)
        pointIter++
    })
    this.material.uniforms.points.value = pointsUniform
    this.material.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
    this.three.drawEdges()
    this.three.renderer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight);
    this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(this.appletContainer.clientWidth, this.appletContainer.clientHeight)

}

let regeneratePlaneGeometry = () => {
    let newGeometry = new THREE.PlaneGeometry(this.pointInfo.meshWidth, this.pointInfo.meshHeight, segmentsX, segmentsX/imageAspect)
    plane.geometry.dispose()
    plane.geometry = newGeometry
}

// Animate
let currentIntersect = null

var animate = () => {

    setTimeout( () => {
        if (this.three.canvas != null){

                this.manageMultiplayer()
                animateUsers()
                this.material.uniforms.uTime.value = Date.now() - tStart
                this.points.forEach(point => {
                    point.animateLabel(this.camera,this.appletContainer)
                })

                this.controls.update()
                effectComposer.render()
        }
    }, 1000 / 60 );
};


// Draw Shapes
const animateUsers = () => {
    raycaster.setFromCamera(mouse,this.camera)
    const objectArray = Array.from( this.points.keys() ).map(key => this.points.get(key).marker)
    const intersects = raycaster.intersectObjects(objectArray)

    if (intersects.length){
        if (currentIntersect === null){
            const scale = intersects[0].object.scale
            intersects[0].object.scale.set(scale.x*2,scale.y*2,scale.z*2)
            intersects[0].object.material.opacity = 0.75
        }
        currentIntersect = intersects[0]
        
    } else {
        if (currentIntersect !== null){
            const scale = currentIntersect.object.scale
            currentIntersect.object.scale.set(scale.x/2,scale.y/2,scale.z/2)
            currentIntersect.object.material.opacity = 0.50
        }
        currentIntersect = null;
    }

    this.points.forEach(point => {

        // Remove old marker
        point.prevMarkers.forEach((obj) => {
            obj.geometry.dispose();
            obj.material.dispose();
            this.three.scene.remove( obj );
        })

        point.prevGroups.forEach((group) => {
            this.three.scene.remove( group );
        })

        // Add new marker
        this.three.scene.add(point.marker)
        this.three.scene.add(point.neurofeedbackGroup)
        point.neurofeedbackGroup.rotateZ(0.01);
    })
}

this.three.drawEdges = () => {
    function pairwise(list) {
        if (list.length < 2) { return []; }
        var first = list[0],
            rest  = list.slice(1),
            pairs = rest.map(function (x) { return [first, x]; });
        return pairs.concat(pairwise(rest));
      }

    let edges = pairwise(Array.from(this.points.keys()))
    edges = edges.map((keys) => {return {label: `${keys[0]}_${keys[1]}`, nodes: [this.points.get(keys[0]).marker.position,this.points.get(keys[1]).marker.position]}})

    this.resetEdges()
    edges.forEach((e,i) => {
        let direction = new THREE.Vector3().subVectors( e.nodes[1], e.nodes[0] );
        if (!isNaN(direction.length())){
            const lineGeometry = new THREE.CylinderGeometry( 0.0005, 0.0005,  direction.length(), 32 );
            lineGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI/2));
            const lineMaterial = new THREE.MeshBasicMaterial( {
                color: 0xff00ff,
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: 0.15
            } );
            const edge = new THREE.Mesh( lineGeometry, lineMaterial);
            edge.name = `coherenceLine_${e.label}`
            let edgeCenter = new THREE.Vector3().addVectors( e.nodes[0], direction.multiplyScalar(0.5))
            edge.position.set(edgeCenter.x,edgeCenter.y,edgeCenter.z)
            edge.lookAt(e.nodes[1]);
            this.three.scene.add(edge)
            this.edges.push({info: e, object: edge})
        }
    })
}

// Geolocation
this.three.getGeolocation = () => {
    navigator.geolocation.getCurrentPosition(
       // Success   
    (pos) => {
        if (this.three.canvas != null){
            this.dynamicProps.location = {latitude: pos.coords.latitude, longitude: pos.coords.longitude}
        }
    }, 
    // Error
    (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }, 
    // Options
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}
    if(this.three.renderer) this.three.renderer.setAnimationLoop( animate )
}

    // Clear Three.js Scene Completely
    clearThree(){
        for (let i = this.three.scene.children.length - 1; i >= 0; i--) {
            const object = this.three.scene.children[i];
            if (object.type === 'Mesh') {
                object.geometry.dispose();
                object.material.dispose();
            }
            this.three.scene.remove(object);
        }
        this.three.scene = null;
        this.three.renderer = null;
        this.three.canvas = null;
    }

    //Delete all event listeners and loops here and delete the HTML block
    deinit() {
        this.stateIds.forEach(id => {
            this.session.state.unsubscribeAll(id);
        })
        this.three.renderer.setAnimationLoop( null );
        this.clearThree()
        this.AppletHTML.deleteNode();
        //Be sure to unsubscribe from state if using it and remove any extra event listeners
    }

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive() {
        if(this.three.renderer) this.resizeNexus()
        let gameHero = document.getElementById(this.props.id+'gameHero')
        if (gameHero){
            gameHero.width = '100%'
            gameHero.height = '100%'
        }
        let createGame = document.getElementById(this.props.id+'createGame')
        if (createGame){
            createGame.width = '100%'
            createGame.height = '100%'
        }
        let loginScreen = document.getElementById(`${this.props.id}login-screen`)
        if (loginScreen){
            loginScreen.width = '100%'
            loginScreen.height = '100%'
        }
    }

    configure(settings=[]) { //For configuring from the address bar or saved settings. Expects an array of arguments [a,b,c] to do whatever with
        settings.forEach((cmd,i) => {
            //if(cmd === 'x'){//doSomething;}
        });
    }

    //--------------------------------------------
    //--Add anything else for internal use below--
    //--------------------------------------------

    //doSomething(){}
    manageMultiplayer(){
        let streamInfo = this.session.state.data?.commandResult
        // Update UI if results are different
        if ((!streamInfo != null) && Object.keys(streamInfo).length !== 0 && streamInfo.constructor === Object){
            if (Array.isArray(streamInfo.userData)){
                streamInfo.userData.forEach((user) => {
                    this.removeAbsentUsers(streamInfo)
                    this.updatePoints(user.username, user.dynamicProps?.location)
                    this.updateNeurofeedback(user)
                    this.updateEdges()
                })
            }
        }
    }

    removeAbsentUsers(streamInfo){
        Array.from( this.points.keys() ).forEach((username) => {
            if (!streamInfo.usernames.includes(username)){
                let toDelete = this.points.get(username)
                toDelete.element.remove();
                toDelete.prevMarkers.forEach((obj) => {
                  obj.geometry.dispose();
                  obj.material.dispose();
                  this.three.scene.remove( obj );
                })
                toDelete.prevGroups.forEach((group) => {
                    this.three.scene.remove( group );
                })
                this.points.delete(username)
                this.responsive()
            }
        })
    }

    updatePoints(username, location){

        if (!this.points.has(username)){
            this.points.set(username, new UserMarker({name: username, diameter:this.pointInfo.diameter, meshWidth:this.pointInfo.meshWidth, meshHeight:this.pointInfo.meshHeight, neurofeedbackDimensions: Object.keys(this.neurofeedbackColors), camera: this.camera, controls: this.controls, appletContainer: this.appletContainer}))
        }

        if (location != null){
            let user = this.points.get(username)
            if (username === "LosAngeles"){
                user.setGeolocation({latitude: 34.0522, longitude: -118.2437})
            } else {
                user.setGeolocation(location)
            }
            user.setElement(this.camera,this.controls)
            user.active = true
            this.responsive()
        }
    }

    updateNeurofeedback(userData){

        let currentUser = this.points.get(userData.username)
        let scaling = {}
        let dataObj = userData['eegfftbands_FP1_all'] ?? userData['eegfftbands_FP2_all'] ?? userData['eegfftbands_AF7_all'] ?? userData['eegfftbands_AF8_all']
        if (dataObj?.bandpowers != null) {
            currentUser.neurofeedbackDimensions.forEach(key => {
                scaling[key] = dataObj.bandpowers[key]
            })

            let scalingMax = Math.max(...Object.values(scaling))
            currentUser.neurofeedbackDimensions.forEach(key => {
                let nfscale = scaling[key]
                nfscale = nfscale/scalingMax
                currentUser.neurofeedbackGroup.getObjectByName(key).material.opacity = nfscale
                currentUser.neurofeedbackGroup.getObjectByName(key).material.color = new THREE.Color(1,1,1).lerp(new THREE.Color(...this.neurofeedbackColors[key]),nfscale)
                currentUser.neurofeedbackGroup.getObjectByName(key).scale.set(nfscale,nfscale,nfscale)
            })

            if (userData.username === this.session.info.auth.username){
                this.glitchPass.glitchFrequency = Math.pow((1-coherence),3)*60
            }
        }

        let coherence = userData?.frontalcoherencescore
        if (coherence != null){
            currentUser.coherence = coherence
            this.material.uniforms.colorThresholds.value[Array.from(this.points.keys()).indexOf(userData.username)] = this.colorReachBase + this.colorReachBase*coherence
        }
    }

    updateEdges(){
        this.edges.forEach((dict) => {
            let usernames = dict.info.label.split('_')
            let c1 = this.points.get(usernames[0])?.coherence
            let c2 = this.points.get(usernames[1])?.coherence
            let coherenceSimilarity = Math.min(Math.max(0, 1-Math.sqrt(Math.pow(c1,2) - Math.pow(c2,2))),1)
            if (!isNaN(coherenceSimilarity)) dict.object.material.opacity = coherenceSimilarity
        })
    }

    resetEdges(){
        this.edges.forEach(dict => {
            dict.object.geometry.dispose()
            dict.object.material.dispose()
            this.three.scene.remove(dict.object)
        })
        this.edges = []
    }
} 