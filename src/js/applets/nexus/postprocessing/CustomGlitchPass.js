/**
 * Custom Glitch Pass
 * Updated by Garrett Flynn on 03/30/21 t0 allow for changing the glitch frequency on the fly
 * @author alteredq / http://alteredqualia.com/
 */
import * as THREE from 'three'
import { DigitalGlitch } from 'three/examples/jsm/shaders/DigitalGlitch.js'

export { GlitchPass }

const Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
	this.renderToScreen = false;

};

Object.assign( Pass.prototype, {

	setSize: function ( /* width, height */ ) {},

	render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

} );

const GlitchPass = function ( dt_size ) {

	Pass.call( this );

	if ( DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

	var shader = DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( dt_size == undefined ) dt_size = 64;


	this.uniforms[ "tDisp" ].value = this.generateHeightmap( dt_size );


	this.material = new THREE.ShaderMaterial( {
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

	this.goWild = false;
    this.glitchFrequency = 1/3;
    this.lastGlitchTime = Date.now();
    this.randTimeOffset = 0;
    this.timingVariability = 5;
	this.generateTrigger();

};

GlitchPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: GlitchPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ 'seed' ].value = Math.random();//default seeding
        this.uniforms[ 'byp' ].value = 0;
        
        const secondsElapsed = (Date.now() - this.lastGlitchTime - (this.randTimeOffset))/1000;
        const timeAfterThisGlitch = secondsElapsed-(1/this.glitchFrequency)
		if ( timeAfterThisGlitch >= 0 || this.goWild == true ) {
            this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
            this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 0.3, 0.3 );
        } 
        else if ( this.goWild == false ) {
			this.uniforms[ 'byp' ].value = 1;
        } 

        // Turn Off Glitch
        if (timeAfterThisGlitch >= this.randGlitchTime/1000){
            this.lastGlitchTime = Date.now()
            this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = THREE.Math.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = THREE.Math.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = THREE.Math.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = THREE.Math.randFloat( 0, 1 );
            this.generateTrigger()
            this.randTimeOffset = Math.max(-this.randGlitchTime*0.5,this.timingVariability * Math.random())
        }

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			renderer.render( this.scene, this.camera );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );

		}

    },
    
    generateTrigger: function(){
        this.randGlitchTime = THREE.Math.randInt( 100, 500 );
    },
	generateHeightmap: function ( dt_size ) {

		var data_arr = new Float32Array( dt_size * dt_size * 3 );
		var length = dt_size * dt_size;

		for ( var i = 0; i < length; i ++ ) {

			var val = THREE.Math.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;

		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.needsUpdate = true;
		return texture;

	}

} );