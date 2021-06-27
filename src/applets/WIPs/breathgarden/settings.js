
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import featureImg from './feature.png'
import fragmentShader from './shaders/galaxy.glsl'
import vertexShader from './shaders/vertex.glsl'
import desertGroundVertexShader from './shaders/desertGround/vertex.glsl'
import desertGroundFragmentShader from './shaders/desertGround/fragment.glsl'
import invisisphereVertexShader from './shaders/invisisphere/vertex.glsl'
import invisisphereFragmentShader from './shaders/invisisphere/fragment.glsl'
import * as THREE from 'three'

/* 
 Samir Parameters
*/
const terrainFog = 10;
const riverOffset = 4.0
const riverWidth = 4.0
var quantityPoints = 3000

let groundUniforms = {
  iTime: {value: 0.0},
  uBigWavesSpeed: { value: 0.5 },
  uBigWavesElevation: { value: 0.12 },
  uBigWavesFrequency: { value: new THREE.Vector2(2,2)},
  uDepthColor: { value: new THREE.Color('#000000')},
  uSurfaceColor: { value: new THREE.Color('#111111')},
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
  uBigWavesFrequency: { value: new THREE.Vector2(2,2)},
  uDepthColor: { value: new THREE.Color('#000000')},
  uSurfaceColor: { value: new THREE.Color('grey')},
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

let invisisphereUniforms = {iTime: {value: 0}}

/* 
 App Settings
*/

export const settings = {
    name: "Breath Garden",
    devices: ["EEG", "HEG"],
    author: "Jack of Hearts",
    description: "WebXR breathing trainer.",
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
        {id: 'breath', class: brainsatplay.plugins.inputs.Breath},
        {id: 'heg', class: brainsatplay.plugins.inputs.HEG},

        // Utilities
        {id: 'lastIndex', class: brainsatplay.plugins.utilities.Index},
        {id: 'transform', class: brainsatplay.plugins.utilities.Transform, params: {value: 4}},
        // {id: 'debug', class: brainsatplay.plugins.outputs.Debug},

        // Light
        {id: 'light', class: brainsatplay.plugins.utilities.Light},

        // Ground
        {id: 'meshvertex', class: brainsatplay.plugins.utilities.Shader, params: {glsl: desertGroundVertexShader, uniforms: meshUniforms}},
        {id: 'meshfragment', class: brainsatplay.plugins.utilities.Shader, params: {glsl: desertGroundFragmentShader, uniforms: meshUniforms}},
        {id: 'meshmat', class: brainsatplay.plugins.utilities.Material, params:{wireframe: true, transparent:true}},
        {id: 'mesh', class: brainsatplay.plugins.utilities.Object3D, params:{type: 'Mesh', x:0, y:0.1, z:0,scale:1, rotatex: Math.PI/2}},
        
        {id: 'groundvertex', class: brainsatplay.plugins.utilities.Shader, params: {glsl: desertGroundVertexShader, uniforms: groundUniforms}},
        {id: 'groundfragment', class: brainsatplay.plugins.utilities.Shader, params: {glsl: desertGroundFragmentShader, uniforms: groundUniforms}},
        {id: 'groundgeo', class: brainsatplay.plugins.utilities.Geometry, params:{type: 'PlaneGeometry', radius: 50, segments: 256}},
        {id: 'groundmat', class: brainsatplay.plugins.utilities.Material, params:{wireframe: false, transparent:true, depthWrite: true}},
        {id: 'ground', class: brainsatplay.plugins.utilities.Object3D, params:{type: 'Mesh', x:0, y:0, z:0,scale:1, rotatex: Math.PI/2}},
        

        // River
        {id: 'riververtex', class: brainsatplay.plugins.utilities.Shader, params: {glsl: invisisphereVertexShader, uniforms: invisisphereUniforms}},
        {id: 'riverfragment', class: brainsatplay.plugins.utilities.Shader, params: {glsl: invisisphereFragmentShader, uniforms: invisisphereUniforms}},
        {id: 'rivergeo', class: brainsatplay.plugins.utilities.Geometry, params:{type: 'BufferGeometry', count: quantityPoints, radius: 50, segments: 256}},
        {id: 'rivermat', class: brainsatplay.plugins.utilities.Material, params:{type: 'ShaderMaterial',wireframe: true, transparent:false, depthWrite: false}},
        {id: 'river', class: brainsatplay.plugins.utilities.Object3D, params:{type: 'Points', x: riverOffset - riverWidth/2, y:-1, z:terrainFog,scalex:terrainFog*2, scalez: riverWidth, rotatey: Math.PI/2}},

        // Sphere
        // {id: 'vertex', class: brainsatplay.plugins.utilities.Shader, params: {glsl: vertexShader}},
        // {id: 'fragment', class: brainsatplay.plugins.utilities.Shader, params: {glsl: fragmentShader, uniforms: {iTime: {value: 0}, iResolution: {value: new THREE.Vector2(1,1)}}}},
        // {id: 'material', class: brainsatplay.plugins.utilities.Material},
        // {id: 'geometry', class: brainsatplay.plugins.utilities.Geometry},
        // {id: 'sphere', class: brainsatplay.plugins.utilities.Object3D, params:{type: 'Mesh',x:0, y:0, z:0,scale:100}},
        
        // Plant
        // {id: 'plantmat', class: brainsatplay.plugins.utilities.Material, params:{color: '#228B22', wireframe: false}},
        // {id: 'plant', class: brainsatplay.plugins.utilities.Mesh, params:{x:0, y:0, z:-10,scale:0.3}},

        // {id: 'html', class: brainsatplay.plugins.outputs.HTML, params:{
        //   html: `
        //   <div style='background: transparent; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'>
        //     <div>
        //       <h2>Welcome to Breath Garden</h2>
        //       <div>
        //         <button>Press Me</button
        //       </div>
        //     </div>
        //   </div>
        //   `}
        // },
        // {id: 'hud', class: brainsatplay.plugins.utilities.HTMLMesh, params:{x:0, y:1.6, z:-0.5,scale:2, isHUD: true}},

        {id: 'scene', class: brainsatplay.plugins.outputs.Scene, params: {camerax: 0, cameray: 1.0}},
      ],
      edges: [

        // HEG Input
        {
          source: 'heg:ratio', 
          target: 'lastIndex'
        },
        {
          source: 'lastIndex', 
          target: 'transform:add'
        },
        {
          source: 'transform:add', 
          target: 'groundvertex:uRiverWidth'
        },
        {
          source: 'transform:add', 
          target: 'meshvertex:uRiverWidth'
        },

        // Microphone Input
        // {
        //   source: 'breath:holding', 
        //   target: ''
        // },

        // // Draw Sphere to Scene
        // {
        //   source: 'geometry', 
        //   target: 'sphere:geometry'
        // },
        // {
        //   source: 'vertex', 
        //   target: 'material:vertex'
        // },
        // {
        //   source: 'fragment', 
        //   target: 'material:fragment'
        // },
        // {
        //   source: 'material', 
        //   target: 'sphere:material'
        // },
        // {
        //   source: 'sphere:add', 
        //   target: 'scene:add'
        // },

        // Add Ground
        {
          source: 'groundvertex', 
          target: 'groundmat:vertex'
        },
        {
          source: 'groundfragment', 
          target: 'groundmat:fragment'
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
          target: 'meshmat:vertex'
        },
        {
          source: 'meshfragment', 
          target: 'meshmat:fragment'
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
          target: 'rivermat:vertex'
        },
        {
          source: 'riverfragment', 
          target: 'rivermat:fragment'
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

        // Add Plant
        // {
        //   source: 'plantmat', 
        //   target: 'plant:material'
        // },
        // {
        //   source: 'plant:add', 
        //   target: 'scene:add'
        // },

        // HUD
        // {
        //   source: 'html:element', 
        //   target: 'hud:element'
        // },
        // {
        //   source: 'hud:add', 
        //   target: 'scene:add'
        // },
        

        // Draw light to Scene
        {
          source: 'light:add', 
          target: 'scene:add'
        },

      ]
    },
}
