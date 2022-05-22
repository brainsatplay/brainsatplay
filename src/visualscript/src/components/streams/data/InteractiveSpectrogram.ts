import {LitElement, css, } from 'lit';
import ResizeObserver from 'resize-observer-polyfill';

export type InteractiveSpectrogramProps = {
  max?: number;
  backgroundColor?: string;
  data?: any[]
  colorscale?: 'Hot' | 'Cold' | 'YlGnBu' | 'YlOrRd' | 'RdBu' | 'Portland' | 'Picnic' | 'Jet' | 'Greys' | 'Greens' | 'Electric' | 'Earth' | 'Bluered' | 'Blackbody' | string[][],
  Plotly?: any
}


const colorscales = ['Hot' , 'Cold' , 'YlGnBu' , 'YlOrRd' , 'RdBu' , 'Portland' , 'Picnic' , 'Jet' , 'Greys' , 'Greens' , 'Electric' , 'Earth' , 'Bluered' , 'Blackbody']

export class InteractiveSpectrogram extends LitElement {

    static get styles() {
      return css`

      `;
    }

    createRenderRoot() {
      return this;
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
        colorscale: {
          type: Object,
          reflect: true
        },
        backgroundColor: {
          type: String,
          reflect: true,
        },
      };
    }

    static colorscales = colorscales
    colorscale: InteractiveSpectrogramProps['colorscale'] = 'Electric'
    div: HTMLDivElement = document.createElement('div');
    data: any[] = [];
    plotData: any[] = []
    config: {[x:string]: any} = {}
    windowSize = 300
    binWidth = 256
    Plotly: InteractiveSpectrogramProps['Plotly']
    colorscales = colorscales

    constructor(props: InteractiveSpectrogramProps={}) {
      super();

      this.data = props.data ?? [[]]
      if (props.colorscale) this.colorscale = props.colorscale

      this.plotData = [
                {
                  x: [1,2],
                  z: this.transpose(this.data),
                  showscale: true,
                  colorscale: this.colorscale,
                  type: 'heatmap'
                }
              ];

      this.config = {
        responsive: true,
        autosize: true // set autosize to rescale
      }


      if (props.Plotly){
        this.Plotly = props.Plotly
        this.Plotly.newPlot(this.div, this.plotData, this.config);
      } else console.warn('<interactive-spectrogram>: Plotly instance not provided...')

      // window.addEventListener('resize', this.resize)

      let observer = new ResizeObserver(() => this.resize());
      observer.observe(this.div);
  }

  resize = () => {
    this.Plotly.relayout(this.div, {
      'xaxis.autorange': true,
      'yaxis.autorange': true
    })
  }

    transpose(a) {
      return Object.keys(a[0]).map(function(c) {
          return a.map(function(r) { return r[c]; });
      });
  }

  willUpdate(changedProps:any) {

    if (changedProps.has('colorscale')) {
      if (!Array.isArray(this.colorscale) && !this.colorscales.includes(this.colorscale)) this.colorscale = 'Electric'
      this.Plotly.restyle(this.div, 'colorscale', this.colorscale);
    }
    
    if (changedProps.has('data')) {
      this.plotData[0].z = this.transpose(this.data)
      this.Plotly.newPlot(this.div, this.plotData, this.config);
    }
  }

  //   updateData = (newData) => {

  //     // For a fixed window size,
  //     // Push the latest data and remove the first element
  //     if (!Array.isArray(newData[0])) newData = [newData]

  //     newData.forEach(d => {
  //       if(this.data.length > this.windowSize) {
  //         this.data.push(d)
  //         this.data.splice(0, 1)
  //       } else {
  //         this.data.push(d);
  //       }
  //     })


  //   this.plotData[0].z[0] = transpose(this.data)
  //     const ticRes = performance.now()
  //     Plotly.restyle(this.div, 'z', this.plotData[0].z);
  //     const tocRes = performance.now()
  //     console.log('Restyle', tocRes - ticRes)

  //     // const ticUp = performance.now()
  //     // Plotly.update(this.div, this.plotData[0])
  //     // const tocUp = performance.now()
  //     // console.log('Update', tocUp - ticUp)

  // //     const ticAn = performance.now()
  // //     Plotly.animate(this.div, {
  // //       data: [{z: this.plotData[0].z, type: 'heatmap'}],
  // //   }, {
  // //       transition: {duration: 0},
  // //       frame: {duration: 0, redraw: true}
  // //   });
  // //   const tocAn = performance.now()
  //   // console.log('Animate', tocAn - ticAn)

  //   }

    render() {
      return this.div
    }
  }
  
  customElements.define('visualscript-spectrogram-interactive', InteractiveSpectrogram);