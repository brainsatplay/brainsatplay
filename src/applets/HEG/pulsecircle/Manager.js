import * as PIXI from 'pixi.js';
import vertexSrc from "./shaders/vertex.glsl"
import fragmentSrc from "./shaders/noiseCircle/fragment.glsl"

class Manager{

    static id = String(Math.floor(Math.random()*1000000))

    constructor(label, session) {

        // Generic Plugin Attributes
        this.label = label
        this.session = session

        // UI Identifier
        this.props = {
            id: String(Math.floor(Math.random()*1000000)),
            container: document.createElement('div'),
            canvas: document.createElement('canvas'),
            history: 5
        }

        this.props.container.onresize = this.responsive

        // Port Definition
        this.ports = {
            data: {
                input: {type: undefined},
                output: {type: null},
                onUpdate: (user) => {
                    console.log(user.data)
                    user.data.heg.forEach((o,i) => {
                        if (i == 0){
                            // console.log(o)
                            this.radiusOffsetBuffer.shift()
                            this.radiusOffsetBuffer.push(o.ratio[o.count-1] - this.session.atlas.mean(o.ratio.slice(o.count-20,o.count-1)))
                        }
                    })
                }
            }, 

            element: {
                data: this.props.container,
                input: {type: null},
                output: {type: Element},
            }
        }
    }

    init = () => {
        this.app = new PIXI.Application({view: this.props.canvas});
        this.props.container.insertAdjacentElement('beforeend', this.props.canvas)
        this.props.container.width = this.props.container.height = '100%'

        this.colorBuffer = Array.from({length: this.props.history}, e => [1.0,1.0,1.0])
        this.timeBuffer = Array.from({length: this.props.history}, e => 0)
        this.noiseBuffer = Array.from({length: this.props.history}, e => 1.0)
        this.radiusOffsetBuffer = Array.from({length: this.props.history}, e => 0.0)

        const uniforms = {
            amplitude: 0.75,
            times: this.timeBuffer,
            aspect: this.app.renderer.view.width/this.app.renderer.view.height,  
            colors: this.colorBuffer.flat(1),
            mouse: [0,0], //[this.mouse.x, this.mouse.y],
            noiseIntensity: this.noiseBuffer,
            radiusOffset: this.radiusOffsetBuffer
        };
        this.shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        this._generateShaderElements()
        let startTime = Date.now();
        this.app.ticker.add((delta) => {

            // Change Color
            let c = [1,1,1]
            this.colorBuffer.shift()
            this.colorBuffer.push(c)

            this.timeBuffer.shift()
            this.timeBuffer.push((Date.now() - startTime)/1000)

            this.noiseBuffer.shift()
            this.noiseBuffer.push(0)

            console.log(this.radiusOffsetBuffer)
                
            // Set Uniforms
            
            this.shaderQuad.shader.uniforms.colors = this.colorBuffer.flat(1) 
            this.shaderQuad.shader.uniforms.times = this.timeBuffer
            this.shaderQuad.shader.uniforms.noiseIntensity = this.noiseBuffer
            this.shaderQuad.shader.uniforms.radiusOffset = this.radiusOffsetBuffer
            // Draw
            this.app.renderer.render(this.shaderQuad, this.shaderTexture);
        });
    }


    deinit = () => {}

    //Responsive UI update, for resizing and responding to new connections detected by the UI manager
    responsive = () => {
        let w = this.props.container.parentNode.offsetWidth
        let h = this.props.container.parentNode.offsetHeight
        this.app.renderer.view.width = w;
        this.app.renderer.view.height = h;
        this.app.renderer.view.style.width = w + 'px';
        this.app.renderer.view.style.height = h + 'px';
        this.app.renderer.resize(w,h)
        this.aspect = this.app.renderer.view.width/this.app.renderer.view.height
        this.shaderQuad.shader.uniforms.aspect = this.aspect
        this._generateShaderElements()
        console.log(w,h)
    }

    _generateShaderElements() {
        const w = this.props.container.offsetWidth
        const h = this.props.container.offsetHeight        

        this.geometry = new PIXI.Geometry()
                .addAttribute('aVertexPosition', // the attribute name
                    [0, 0, // x, y
                        w, 0, // x, y
                        w, h,
                        0, h], // x, y
                    2) // the size of the attribute
                .addAttribute('aUvs', // the attribute name
                    [-1, -1, // u, v
                        1, -1, // u, v
                        1, 1,
                        -1, 1], // u, v
                    2) // the size of the attribute
                .addIndex([0, 1, 2, 0, 2, 3]);

        this.shaderTexture = PIXI.RenderTexture.create(w,h);
        this.shaderQuad = new PIXI.Mesh(this.geometry, this.shader);

        if (this.shaderContainer != null) this.app.stage.removeChild(this.shaderContainer)
        this.shaderContainer = new PIXI.Container();
        this.shaderContainer.addChild(this.shaderQuad);
        this.app.stage.addChild(this.shaderContainer);
    }

}

export {Manager}