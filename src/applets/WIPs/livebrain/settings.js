import * as THREE from 'three'

import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import {brainpoints} from './visbrain'

let uniforms = {uData: {value: [0,0,0]}, uCoords: {value: [0,0,0]}, electrodeRadius: {value: 30}}

const rotatex = -Math.PI/2
const rotatez = 3*Math.PI/4

export const settings = {
    name: "3D Brain",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "A responsive 3D brain in JavaScript.",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: true,
      development: true
    },

    // intro: {
    //   title:false
    // },

    // App Logic
    graph:
    {
      nodes: [
        {name: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {name: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {metric: 'Alpha Ratio', output: 'Channels'}},

        // Scene
        {name: 'vertex', class: brainsatplay.plugins.scene.Shader, params: {default: vertex, uniforms}},
        {name: 'fragment', class: brainsatplay.plugins.scene.Shader, params: {default: fragment, uniforms}},
        {name: 'geometry', class: brainsatplay.plugins.scene.Geometry, params:{
          type: 'BufferGeometry', 
          attributes: {position: {buffer: brainpoints, size: 3}}, 
          // resolution: 0.5
        }},
        {name: 'material', class: brainsatplay.plugins.scene.Material, 
        params: {
          // type: 'PointsMaterial', transparent:true, depthWrite: false, opacity: 0.1, alphaTest:0.5, size: 0.5
          type: 'ShaderMaterial', wireframe: false, transparent:true, depthWrite: false
          // type: 'ShaderMaterial', wireframe: false, transparent:true, depthWrite: false
        }
        },
        {name: 'particles', class: brainsatplay.plugins.scene.Object3D, params:{ type: 'Points'}},
        {name: 'group', class: brainsatplay.plugins.scene.Group, params: {rotatex, rotatez }},

        {name: 'scene', class: brainsatplay.plugins.scene.Scene, params: {controls: 'orbit', camerax: 0, cameray: 0, cameraz: 200}},

        // Utilities
        {name: 'map', class: brainsatplay.plugins.utilities.MapArray, params: {
          function: (a)=>{
          const geometry =  new THREE.SphereGeometry(2,32,32)
          const material = new THREE.MeshBasicMaterial({color: 'red', opacity: 0.5, transparent: true})
          const mesh = new THREE.Mesh(geometry, material)
          mesh.position.set(a[0], a[1], a[2])
          return mesh
        }}},


        // UI
        {name: 'ui', class: brainsatplay.plugins.interfaces.DOM, params: {}},
      ],

      edges: [
        {
          source: 'eeg:atlas', 
          target: 'neurofeedback'
        },

        // {
        //   source: 'neurofeedback', 
        //   target: 'fragment:uData'
        // },

        // {
        //   source: 'manager:data', 
        //   target: 'fragment:uData'
        // },

        // Add Particles
        // shaders
        {
          source: 'vertex', 
          target: 'material:vertexShader'
        },
        {
          source: 'fragment', 
          target: 'material:fragmentShader'
        },
        {
          source: 'eeg:position', 
          target: 'fragment:uCoords'
        },
        {
          source: 'eeg:voltage', 
          target: 'fragment:uData'
        },

        {
          source: 'geometry', 
          target: 'particles:geometry'
        },
        {
          source: 'material', 
          target: 'particles:material'
        },

        // Create Electrode Markers
        {
          source: 'eeg:position', 
          target: 'map'
        },

        // Group
        {
          source: 'map', 
          target: 'group'
        },

        {
          source: 'particles:add', 
          target: 'group'
        },

        // Add to Scene
        {
          source: 'group', 
          target: 'scene:add'
        },

        // Add to UI
        {
          source: 'scene:element', 
          target: 'ui:content'
        },


        // {
        //   source: 'manager:element', 
        //   target: 'ui:content'
        // },
      ]
    },
}