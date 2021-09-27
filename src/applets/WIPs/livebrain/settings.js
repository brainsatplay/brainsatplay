
import * as brainsatplay from '../../../libraries/js/brainsatplay'
import {Manager} from './Manager'

import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import {brainpoints} from './visbrain'

let uniforms = {iTime: {value: 0}, uAtlas: {value: []}}


export const settings = {
    name: "3D Brain",
    devices: ["EEG"],
    author: "Garrett Flynn",
    description: "A responsive 3D brain in JavaScript.",
    categories: ["learn"],
    instructions:"Coming soon...",
    display: {
      production: false,
      development: true
    },

    // intro: {
    //   title:false
    // },

    // App Logic
    graph:
    {
      nodes: [
        {id: 'eeg', class: brainsatplay.plugins.biosignals.EEG},
        {id: 'manager', class: Manager, params: {
          // model: brainpoints, resolution: 0.5
        }},
        {id: 'neurofeedback', class: brainsatplay.plugins.algorithms.Neurofeedback, params: {metric: 'Alpha Ratio', output: 'Channels'}},

        // Scene
        {id: 'vertex', class: brainsatplay.plugins.scene.Shader, params: {default: vertex, uniforms}},
        {id: 'fragment', class: brainsatplay.plugins.scene.Shader, params: {default: fragment, uniforms}},
        {id: 'geometry', class: brainsatplay.plugins.scene.Geometry, params:{
          type: 'BufferGeometry', 
          buffer: brainpoints, 
          // resolution: 0.5
        }},
        {id: 'material', class: brainsatplay.plugins.scene.Material, 
        params: {
          // type: 'PointsMaterial', transparent:true, depthWrite: false, opacity: 0.1, alphaTest:0.5, size: 0.5
          type: 'ShaderMaterial', wireframe: false, transparent:true, depthWrite: false
          // type: 'ShaderMaterial', wireframe: false, transparent:true, depthWrite: false
        }
        },
        {id: 'particles', class: brainsatplay.plugins.scene.Object3D, params:{ type: 'Points', rotatex: -Math.PI/2, rotatez: 3*Math.PI/4 }},

        {id: 'scene', class: brainsatplay.plugins.scene.Scene, params: {controls: 'orbit', camerax: 0, cameray: 0, cameraz: 200}},

        // UI
        {id: 'ui', class: brainsatplay.plugins.interfaces.UI, params: {}},
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
          source: 'geometry', 
          target: 'particles:geometry'
        },
        {
          source: 'material', 
          target: 'particles:material'
        },
        {
          source: 'particles:add', 
          target: 'scene:add'
        },
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