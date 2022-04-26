import {LitElement, css, } from 'lit';
import { WebglLinePlotUtils } from '../../../libraries/webglplotutil/webgl-plot-utils.js';

export type TimeSeriesProps = {
  data?: any[][];
  volume?: number;
  backgroundColor?: string;
  sps:number;
  seconds:number;

}

export class TimeSeries extends LitElement {

    static get styles() {
      return css`

      canvas{
        background: black;
      }

      `;
    }
    
    static get properties() {
      return {
        data: {
          type: Array,
          reflect: true,
        },
        sps: {
          type: Number,
          reflect: true,
        },
        seconds: {
          type: Number,
          reflect: true,
        },
        backgroundColor: {
          type: String,
          reflect: true,
        },
      };
    }

    canvas: HTMLCanvasElement;
    util: WebglLinePlotUtils;
    data: any[][] = []
    spss: number[] = [];
    buffers: any[] = [];

    sps: TimeSeriesProps['sps']
    seconds: TimeSeriesProps['seconds']
    backgroundColor: TimeSeriesProps['backgroundColor']

    constructor(props: TimeSeriesProps = {seconds: 5, sps: 512}) {
      super();

      this.canvas = document.createElement('canvas')
      this.util = new WebglLinePlotUtils(this.canvas, false)

      this.sps = props.sps ?? 512
      this.seconds = props.seconds ?? 5
      this.backgroundColor = props.backgroundColor ?? '#69ce2b'

      let newFrame = () => {
        if (this.buffers.length > 0) {
            this.util.updateAllLines(this.buffers, this.spss, true);
            this.util.update();
        }
        requestAnimationFrame(newFrame);
    }

    requestAnimationFrame(newFrame);

    }
    
    willUpdate(updatedProps:any) {
      if (updatedProps.has('data')) this.draw()
      // if (updatedProps.has('sps')) this.init()
      if (updatedProps.has('seconds')) {
        if (!this.seconds) this.seconds = 0.001
        this.init()
      }
    }

    // Only run when changed
    init = () => {
        const length = this.data.length
        let nPointsRenderedPerSec = 60
        this.sps = this.seconds * nPointsRenderedPerSec
        // let nPointsRenderedPerSec = Math.ceil(this.seconds / this.sps)
        this.spss = Array.from({ length }, _ => this.sps)
        this.buffers = Array.from({ length }, _ => [])
        this.util.initPlot(length, this.spss, this.seconds, nPointsRenderedPerSec);
    }


    draw = () => {
        // Plot the Lines
        if (this.data.length != this.buffers.length) this.init()
        
        this.data.forEach((data, i) => {
              if (this.buffers[i].length === 0) this.buffers[i]  = Array.from({length:this.spss[i]}, _ => data)
              else {
                if (!Array.isArray(data)) data = [data]
                data.forEach(() => this.buffers[i].pop())
                this.buffers[i].unshift(...data)
              }
        })
    }
  
    render() {

      return this.canvas
    }
  }
  
  customElements.define('brainsatplay-timeseries', TimeSeries);