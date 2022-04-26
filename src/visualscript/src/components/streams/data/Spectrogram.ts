import {LitElement, css, } from 'lit';

export type SpectrogramProps = {
  max?: number;
  backgroundColor?: string;
  data?: any[]
}

export class Spectrogram extends LitElement {

    static get styles() {
      return css`

      canvas{
        background: black;
      }

      `;
    }
    
    static get properties() {
      return {
        max: {
          type: Number,
          reflect: true
        },
        data: {
          type: Array,
          reflect: true
        },
        backgroundColor: {
          type: String,
          reflect: true,
        },
      };
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('data')) this.draw() // Only draw on new data
    }

    max: SpectrogramProps['max'];
    canvas: HTMLCanvasElement = document.createElement('canvas');
    backgroundColor: SpectrogramProps['backgroundColor']
    ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		offscreen: OffscreenCanvas;
		offscreenctx: OffscreenCanvasRenderingContext2D;

		reset:boolean = false;
		offset:boolean = true; //automatic DC offset based on mininum 

		//256 key Chromajs generated color scale from: https://vis4.net/labs/multihue/
		colorScale = ['#000000', '#030106', '#06010c', '#090211', '#0c0215', '#0e0318', '#10031b', '#12041f', '#130522', '#140525', '#150628', '#15072c', '#16082f', '#160832', '#160936', '#160939', '#17093d', '#170a40', '#170a44', '#170a48', '#17094b', '#17094f', '#170953', '#170956', '#16085a', '#16085e', '#150762', '#140766', '#140669', '#13066d', '#110571', '#100475', '#0e0479', '#0b037d', '#080281', '#050185', '#020089', '#00008d', '#000090', '#000093', '#000096', '#000099', '#00009c', '#00009f', '#0000a2', '#0000a5', '#0000a8', '#0000ab', '#0000ae', '#0000b2', '#0000b5', '#0000b8', '#0000bb', '#0000be', '#0000c1', '#0000c5', '#0000c8', '#0000cb', '#0000ce', '#0000d1', '#0000d5', '#0000d8', '#0000db', '#0000de', '#0000e2', '#0000e5', '#0000e8', '#0000ec', '#0000ef', '#0000f2', '#0000f5', '#0000f9', '#0000fc', '#0803fe', '#2615f9', '#3520f4', '#3f29ef', '#4830eb', '#4e37e6', '#543ee1', '#5944dc', '#5e49d7', '#614fd2', '#6554cd', '#6759c8', '#6a5ec3', '#6c63be', '#6e68b9', '#6f6db4', '#7072af', '#7177aa', '#717ba5', '#7180a0', '#71859b', '#718996', '#708e91', '#6f928b', '#6e9786', '#6c9b80', '#6aa07b', '#68a475', '#65a96f', '#62ad69', '#5eb163', '#5ab65d', '#55ba56', '#4fbf4f', '#48c347', '#40c73f', '#36cc35', '#34ce32', '#37cf31', '#3ad130', '#3cd230', '#3fd32f', '#41d52f', '#44d62e', '#46d72d', '#48d92c', '#4bda2c', '#4ddc2b', '#4fdd2a', '#51de29', '#53e029', '#55e128', '#58e227', '#5ae426', '#5ce525', '#5ee624', '#60e823', '#62e922', '#64eb20', '#66ec1f', '#67ed1e', '#69ef1d', '#6bf01b', '#6df11a', '#6ff318', '#71f416', '#73f614', '#75f712', '#76f810', '#78fa0d', '#7afb0a', '#7cfd06', '#7efe03', '#80ff00', '#85ff00', '#89ff00', '#8eff00', '#92ff00', '#96ff00', '#9aff00', '#9eff00', '#a2ff00', '#a6ff00', '#aaff00', '#adff00', '#b1ff00', '#b5ff00', '#b8ff00', '#bcff00', '#bfff00', '#c3ff00', '#c6ff00', '#c9ff00', '#cdff00', '#d0ff00', '#d3ff00', '#d6ff00', '#daff00', '#ddff00', '#e0ff00', '#e3ff00', '#e6ff00', '#e9ff00', '#ecff00', '#efff00', '#f3ff00', '#f6ff00', '#f9ff00', '#fcff00', '#ffff00', '#fffb00', '#fff600', '#fff100', '#ffec00', '#ffe700', '#ffe200', '#ffdd00', '#ffd800', '#ffd300', '#ffcd00', '#ffc800', '#ffc300', '#ffbe00', '#ffb900', '#ffb300', '#ffae00', '#ffa900', '#ffa300', '#ff9e00', '#ff9800', '#ff9300', '#ff8d00', '#ff8700', '#ff8100', '#ff7b00', '#ff7500', '#ff6f00', '#ff6800', '#ff6100', '#ff5a00', '#ff5200', '#ff4900', '#ff4000', '#ff3600', '#ff2800', '#ff1500', '#ff0004', '#ff000c', '#ff0013', '#ff0019', '#ff001e', '#ff0023', '#ff0027', '#ff002b', '#ff012f', '#ff0133', '#ff0137', '#ff013b', '#ff023e', '#ff0242', '#ff0246', '#ff0349', '#ff034d', '#ff0450', '#ff0454', '#ff0557', '#ff065b', '#ff065e', '#ff0762', '#ff0865', '#ff0969', '#ff0a6c', '#ff0a70', '#ff0b73', '#ff0c77', '#ff0d7a', '#ff0e7e', '#ff0f81', '#ff1085', '#ff1188', '#ff128c', '#ff138f', '#ff1493'];
		data: any[] = [];
		normalizeFactor: number; // This sets the scaling factor for the color scale. 0 = 0, 1 = 255, anything over or under 0 or 1 will trigger the min or max color
		dynNormalize = true;

    constructor(props: SpectrogramProps = {}) {
      super();

      this.max = props.max ?? 1
      this.normalizeFactor = (props.max) ? 1/props.max : 1
      this.backgroundColor = props.backgroundColor ?? '#69ce2b'

      window.addEventListener('resize', () => {
        this.onresize()
      })

      this.offscreen = new OffscreenCanvas(this.canvas.width,this.canvas.height);
      this.offscreenctx = this.offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D;
      this.init()
      this.data = props.data ?? new Array(this.canvas.height).fill(0);
      // this.test()
      this.onresize()
    }

    init = () => {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      this.offscreenctx.fillStyle = "black";
      this.offscreenctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    }

    // test = () => {

    //   const length = 100
    //   this.data = Array.from({length}, (_,i) => (i === Math.floor(length*(0.5 + 0.5*Math.sin(Date.now()/1000)))) ? 1 : 0)
    //   setTimeout(this.test, 100)

    // }

    onresize = () => {

      const width = (this.canvas.parentNode as HTMLElement)?.clientWidth
      const height = (this.canvas.parentNode as HTMLElement)?.clientHeight

      if (width) {
        this.canvas.width = (this.canvas.parentNode as HTMLElement)?.clientWidth;
        this.canvas.style.width = width.toString()
      }
      if (height) {
        this.canvas.height = (this.canvas.parentNode as HTMLElement)?.clientHeight;
        this.canvas.style.height = height.toString()
      }
    }

    //Adapted from Spectrogram.js by Miguel Mota https://github.com/miguelmota/spectrogram
	draw = () => {

		var width = this.canvas.width;
		var height = Math.floor(this.canvas.height);

		var tempCanvasContext = this.offscreenctx;
		var tempCanvas = tempCanvasContext.canvas;
		tempCanvasContext.drawImage(this.canvas, 0, 0, width, height);
		var data = [...Array.from(this.data)]; //set spectrogram.data = [...newdata]

		if(data.length !== height){ //Fit data to height
			var interp = data;
			data = this.interpolateArray(interp,height);
		}

		var offset = 0;
		if(this.offset === true) {
			offset = Math.pow(10,Math.floor(Math.log10(Math.min(...data))));
		}
		if(this.dynNormalize === true) {
			this.normalizeFactor = 1/Math.pow(10,Math.floor(Math.log10(Math.max(...data))+.5));
		}

		for (var i = 0; i < data.length; i++) {
			var value = Math.floor((data[i]-offset)*this.normalizeFactor*255);
			if(value > 255) { value = 255; }
			else if (value < 0) { value = 0;}
			this.ctx.fillStyle = this.colorScale[value];
			this.ctx.fillRect(width - 1, height - i, 1, 1);
		}
		if(this.reset === false){
			this.ctx.translate(-1, 0);
			// draw prev canvas before translation
			this.ctx.drawImage(tempCanvas, 0, 0, width, height);
			// reset transformation matrix
		  	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		else { this.reset = false; }
	}

    	//Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers
	interpolateArray(data:any[], fitCount:number) {

		var norm = this.canvas.height/data.length;

		var linearInterpolate = function (before:number, after:number, atPoint:number) {
			return (before + (after - before) * atPoint)*norm;
		};

		var newData = new Array();
		var springFactor = new Number((data.length - 1) / (fitCount - 1)) as number;
		newData[0] = data[0]; // for new allocation
		for ( var i = 1; i < fitCount - 1; i++) {
      var tmp = i * springFactor;
      var beforeNum = new Number(Math.floor(tmp)) as number;
			var before = beforeNum.toFixed();
			var after = new Number(Math.ceil(tmp)).toFixed();
			var atPoint = tmp - beforeNum;
			newData[i] = linearInterpolate(data[before], data[after], atPoint);
		}
		newData[fitCount - 1] = data[data.length - 1]; // for new allocation
		return newData;
	};
  
    render() {

      return this.canvas
    }
  }
  
  customElements.define('brainsatplay-spectrogram', Spectrogram);