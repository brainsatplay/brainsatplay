
import featureImg from './feature.png'
import fragmentShader from './shaders/galaxy.glsl'
import vertexShader from './shaders/vertex.glsl'
import desertGroundVertexShader from './shaders/desertGround/vertex.glsl'
import desertGroundFragmentShader from './shaders/desertGround/fragment.glsl'
import invisisphereVertexShader from './shaders/invisisphere/vertex.glsl'
import invisisphereFragmentShader from './shaders/invisisphere/fragment.glsl'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import * as THREE from 'three'

/* 
 Samir Parameters
*/
const terrainFog = 10;
const terrainLength = 30
const riverOffset = 4.0
const riverWidth = 4.0
var quantityPoints = 3000

let groundUniforms = {
  iTime: {value: 0.0},
  uBigWavesSpeed: { value: 0.5 },
  uBigWavesElevation: { value: 0.22 },
  uBigWavesFrequency: { value:{x:2,y:2}},
  uDepthColor: { value: '#000000'},
  uSurfaceColor: { value: '#111111'},
  uColorOffset: {value: 0.2},
  uColorMultiplier: {value: 0.25},
  uSmallWavesElevation: { value: 0.05 },
  uSmallWavesFrequency: { value: 3 },
  uSmallWavesSpeed: { value: 0.2 },
  uSmallIterations: { value: 4 },
  uFogRadius: {value: terrainFog},
  uFogDropoff: {value: 10.0},
  uRiverOffset: {value: riverOffset},
  uRiverWidth: {value: riverWidth}
}

let meshUniforms = {
  iTime: {value: 0.0},
  uBigWavesSpeed: { value: 0.5 },
  uBigWavesElevation: { value: 0.12 },
  uBigWavesFrequency: { value: {x: 2, y:2}},
  uDepthColor: { value: '#000000'},
  uSurfaceColor: { value: 'gray'},
  uColorOffset: {value: 0.2},
  uColorMultiplier: {value: 0.25},
  uSmallWavesElevation: { value: 0.05 },
  uSmallWavesFrequency: { value: 3 },
  uSmallWavesSpeed: { value: 0.2 },
  uSmallIterations: { value: 4 },
  uFogRadius: {value: terrainFog},
  uFogDropoff: {value: 10.0},
  uRiverOffset: {value: riverOffset},
  uRiverWidth: {value: riverWidth}
}

let invisisphereUniforms = {iTime: {value: 0}, uSpeedModifier: {value: 0}, uColorChange: {value: 0}}
let particleUniforms = {iTime: {value: 0}, uVerdant: {value: 0}}

/* 
 App Settings
*/

export const settings = {
    name: "Breath Garden",
    devices: ["EEG", "HEG"],
    author: "Jack of Hearts",
    description: "WebXR breathing meditation.",
    categories: ["WIP"],
    instructions:"Coming soon...",
    image: featureImg,
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graph:
      {
      nodes: [

        // Biofeedback
        {name: 'breath', class: brainsatplay.plugins.biosignals.Breath},
        {name: 'heg', class: brainsatplay.plugins.biosignals.HEG},

        // Utilities
        {name: 'lastHEG', class: brainsatplay.plugins.transforms.Index},
        {name: 'lastBreath', class: brainsatplay.plugins.transforms.Index},
        {name: 'scheduler', class: brainsatplay.plugins.utilities.Scheduler, params: { duration: 4, progression: ['Welcome to Breath Garden', 'Welcome to Breath Garden', 'Breathe In','Hold','Breathe Out','Hold','Breathe In','Hold','Breathe Out','Hold','Breathe In','Hold','Breathe Out','Hold','Breathe In','Hold','Breathe Out','Thank You for Playing!']}},

        // Tree
        {name: 'tree1', class: brainsatplay.plugins.scene.Trees, params: {count: 5}},

        // Light
        {name: 'light', class: brainsatplay.plugins.scene.Light},

        // Ground
        {name: 'meshvertex', class: brainsatplay.plugins.scene.Shader, params: {default: desertGroundVertexShader, uniforms: meshUniforms}},
        {name: 'meshfragment', class: brainsatplay.plugins.scene.Shader, params: {default: desertGroundFragmentShader, uniforms: meshUniforms}},
        {name: 'meshmat', class: brainsatplay.plugins.scene.Material, params:{wireframe: true, transparent:true, depthWrite: true}},
        {name: 'mesh', class: brainsatplay.plugins.scene.Object3D, params:{type: 'Mesh', x:0, y:0.05, z:0,scale:1, rotatex: Math.PI/2}},
        
        {name: 'groundvertex', class: brainsatplay.plugins.scene.Shader, params: {default: desertGroundVertexShader, uniforms: groundUniforms}},
        {name: 'groundfragment', class: brainsatplay.plugins.scene.Shader, params: {default: desertGroundFragmentShader, uniforms: groundUniforms}},
        {name: 'groundgeo', class: brainsatplay.plugins.scene.Geometry, params:{type: 'PlaneGeometry', radius: terrainLength, segments: 256}},
        {name: 'groundmat', class: brainsatplay.plugins.scene.Material, params:{wireframe: false, transparent:true, depthWrite: true}},
        {name: 'ground', class: brainsatplay.plugins.scene.Object3D, params:{type: 'Mesh', x:0, y:0, z:0,scale:1, rotatex: Math.PI/2}},
        

        // River
        {name: 'riververtex', class: brainsatplay.plugins.scene.Shader, params: {default: invisisphereVertexShader, uniforms: invisisphereUniforms}},
        {name: 'riverfragment', class: brainsatplay.plugins.scene.Shader, params: {default: invisisphereFragmentShader, uniforms: invisisphereUniforms}},
        {name: 'rivergeo', class: brainsatplay.plugins.scene.Geometry, params:{type: 'BufferGeometry', count: quantityPoints}},
        {name: 'rivermat', class: brainsatplay.plugins.scene.Material, params:{type: 'ShaderMaterial',wireframe: false, transparent:true, depthWrite: false}},
        {name: 'river', class: brainsatplay.plugins.scene.Object3D, params:{type: 'Points', x: riverOffset - riverWidth/2, y:-1, z:terrainFog,scalex:terrainFog*2, scalez: riverWidth, rotatey: Math.PI/2}},

        // Particles
        {name: 'particlesvertex', class: brainsatplay.plugins.scene.Shader, params: {default: particlesVertexShader, uniforms: particleUniforms}},
        {name: 'particlesfragment', class: brainsatplay.plugins.scene.Shader, params: {default: particlesFragmentShader, uniforms: particleUniforms}},
        {name: 'particlesgeo', class: brainsatplay.plugins.scene.Geometry, params:{type: 'BufferGeometry', count: quantityPoints/10}},
        {name: 'particlesmat', class: brainsatplay.plugins.scene.Material, params:{type: 'ShaderMaterial',wireframe: false, transparent:true, depthWrite: false}},
        {name: 'particles', class: brainsatplay.plugins.scene.Object3D, params:{type: 'Points', x: -terrainLength/4, y:0, z:-terrainLength/4,scalex:terrainLength/2, scaley: 5, scalez: terrainLength/2}},
        {name: 'sine', class: brainsatplay.plugins.controls.Event},//, params: {center: 0.5, scale: 0.5, frequency: 0.1}},
        {name: 'html', class: brainsatplay.plugins.interfaces.UI, params:{
          html: `
          <div style='background: transparent; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
            <div>
              <h2 id="text">Welcome to Breath Garden</h2>
            </div>
          </div>
          `,
          style: `
          .brainsatplay-ui-container{
            position: absolute;
            pointer-events: none;
            user-select: none;
            width: 100%; 
            height: 100%;
            transition: 0.5s;
          }
          `
          // containerStyle: `
          // position: absolute;
          // pointer-events: none;
          // user-select: none;
          // width: 100%; 
          // height: 100%;
          // transition: 0.5s;
          // `
        }
        },

        {name: 'scene', class: brainsatplay.plugins.scene.Scene, params: {camerax: 1, cameray: 2.0, cameraz: 9.0}},
        {name:'ui', class: brainsatplay.plugins.interfaces.UI, params: {
          html: `<div id="sceneContainer" id="scene-container"></div>`,
          style: `
          .brainsatplay-ui-container {
            width: 100%;
            height: 100%;
          }
          `
        }}
      ],
      edges: [

        // Scene to UI
        {
          source: 'scene:element', 
          target: 'ui:sceneContainer'
        },

        // HEG Input
        {
          source: 'heg:ratio', 
          target: 'lastHEG'
        },
        {
          source: 'lastHEG', 
          target: 'riververtex:uSpeedModifier'
        },
        {
          source: 'lastHEG', 
          target: 'riverfragment:uColorChange'
        },
        {
          source: 'lastHEG', 
          target: 'particlesfragment:uVerdant'
        },

        // Microphone Input
        {
          source: 'breath:slowSmoothedVolume', 
          target: 'lastBreath'
        },
        // {
        //   source: 'breath:isHolding', 
        //   target: 'transformer:not'
        // },

        // {
        //   source: 'transformer:not', 
        //   target: 'transformer:toFloat'
        // },

        // {
        //   source: 'transformer:toFloat', 
        //   target: 'transformer:value'
        // },
        // {
        //   source: 'lastBreath', 
        //   target: 'transformer:multiply'
        // },
        // {
        //   source: 'transformer:multiply', 
        //   target: 'riververtex:uSpeedModifier'
        // },
        {
          source: 'lastBreath', 
          target: 'riververtex:uSpeedModifier'
        },
        {
          source: 'lastBreath', 
          target: 'riverfragment:uColorChange'
        },
        {
          source: 'lastBreath', 
          target: 'particlesfragment:uVerdant'
        },

        // Add Ground
        {
          source: 'groundvertex', 
          target: 'groundmat:vertexShader'
        },
        {
          source: 'groundfragment', 
          target: 'groundmat:fragmentShader'
        },
        {
          source: 'groundgeo', 
          target: 'ground:geometry'
        },
        {
          source: 'groundmat', 
          target: 'ground:material'
        },
        {
          source: 'ground:add', 
          target: 'scene:add'
        },

        // Add Mesh
        {
          source: 'meshvertex', 
          target: 'meshmat:vertexShader'
        },
        {
          source: 'meshfragment', 
          target: 'meshmat:fragmentShader'
        },
        {
          source: 'groundgeo', // Reuse
          target: 'mesh:geometry'
        },
        {
          source: 'meshmat', 
          target: 'mesh:material'
        },
        {
          source: 'mesh:add', 
          target: 'scene:add'
        },

        // Add River
        {
          source: 'riververtex', 
          target: 'rivermat:vertexShader'
        },
        {
          source: 'riverfragment', 
          target: 'rivermat:fragmentShader'
        },
        {
          source: 'rivergeo', 
          target: 'river:geometry'
        },
        {
          source: 'rivermat', 
          target: 'river:material'
        },
        {
          source: 'river:add', 
          target: 'scene:add'
        },

        // Add Particles
        {
          source: 'particlesvertex', 
          target: 'particlesmat:vertexShader'
        },
        {
          source: 'particlesfragment', 
          target: 'particlesmat:fragmentShader'
        },
        {
          source: 'particlesgeo', 
          target: 'particles:geometry'
        },
        {
          source: 'particlesmat', 
          target: 'particles:material'
        },
        {
          source: 'particles:add', 
          target: 'scene:add'
        },

        // Add Tree
        {
          source: 'tree1:add', 
          target: 'scene:add'
        },

        {
          source: 'scheduler:state', 
          target: 'html:text'
        },
        

        // Draw light to Scene
        {
          source: 'light:add', 
          target: 'scene:add'
        },

      ]
    },
}
