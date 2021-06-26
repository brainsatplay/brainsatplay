
import * as brainsatplay from '../../../libraries/js/brainsatplay'

export const settings = {
    name: "WebXR Playground",
    devices: ["EEG", "HEG"],
    author: "Jack of Hearts",
    description: "Tea",
    categories: ["WIP"],
    instructions:"Coming soon...",
    // intro: {
    //   mode: 'single'
    // },
    
    // App Logic
    graph:
      {
      nodes: [
        {id: 'light', class: brainsatplay.plugins.utilities.Light},
        {id: 'material', class: brainsatplay.plugins.utilities.Material},
        {id: 'geometry', class: brainsatplay.plugins.utilities.Geometry},
        {id: 'vertex', class: brainsatplay.plugins.utilities.VertexShader},
        {id: 'planegeo', class: brainsatplay.plugins.utilities.Geometry, params:{type: 'PlaneGeometry', segments: 100}},
        {id: 'planemat', class: brainsatplay.plugins.utilities.Material, params:{color: '#50C878', wireframe: false}},
        {id: 'fragment', class: brainsatplay.plugins.utilities.FragmentShader},
        {id: 'sphere', class: brainsatplay.plugins.utilities.Mesh, params:{x:0, y:0, z:0,scale:100}},
        {id: 'plane', class: brainsatplay.plugins.utilities.Mesh, params:{x:0, y:0, z:0,scale:200, rotatex: Math.PI/2}},
        {id: 'plantmat', class: brainsatplay.plugins.utilities.Material, params:{color: '#228B22', wireframe: false}},
        {id: 'plant', class: brainsatplay.plugins.utilities.Mesh, params:{x:0, y:0, z:-10,scale:0.3}},
        {id: 'scene', class: brainsatplay.plugins.outputs.Scene},
      ],
      edges: [

        // Draw Sphere to Scene
        {
          source: 'geometry', 
          target: 'sphere:geometry'
        },
        {
          source: 'vertex', 
          target: 'material:vertex'
        },
        {
          source: 'fragment', 
          target: 'material:fragment'
        },
        {
          source: 'material', 
          target: 'sphere:material'
        },
        {
          source: 'sphere:add', 
          target: 'scene:add'
        },

        // Add Ground
        {
          source: 'planegeo', 
          target: 'plane:geometry'
        },
        {
          source: 'planemat', 
          target: 'plane:material'
        },
        {
          source: 'plane:add', 
          target: 'scene:add'
        },

        // Add Plant
        {
          source: 'plantmat', 
          target: 'plant:material'
        },
        {
          source: 'plant:add', 
          target: 'scene:add'
        },

        // Draw light to Scene
        {
          source: 'light:add', 
          target: 'scene:add'
        },

      ]
    },
}
