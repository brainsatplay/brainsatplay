import {LitElement, html, css, } from 'lit';

export type VolumeProps = {
  count?: number;
  volume?: number;
  backgroundColor?: string;
}

export class Volume extends LitElement {

    static get styles() {
      return css`

      #wrapper{
        width: 100%;
      }

      `;
    }
    
    static get properties() {
      return {
        volume: {
          type: Number,
        },
        count: {
          type: Number,
        },
        backgroundColor: {
          type: String,
          reflect: true,
        },
      };
    }

    volume: number
    count: number
    backgroundColor: VolumeProps['backgroundColor']

    constructor(props: VolumeProps = {}) {
      super();

      this.volume = props.volume ?? 0
      this.backgroundColor = props.backgroundColor ?? '#69ce2b'
      this.count = props.count ?? 10

    }
    
    willUpdate(changedProps:any) {
      // console.log(changedProps)
      if (changedProps.has('volume')) {
          // const oldValue = changedProps.get('volume');
          if (!this.volume || this.volume < 0) this.volume = 0
          else if (this.volume > 1) this.volume = 1
      }
    }
  
    render() {

      const numToColor = Math.round(this.count*(this.volume ?? 0))

      return html`
      <style>
        .target{
          width: calc(${100/this.count}% - 10px);
          height: 10px;
          display: inline-block;
          margin: 5px;
          background-color: #e6e7e8;
        }

        .active {
          background-color: ${this.backgroundColor};
        }
        
      </style>

        <div id="wrapper">
          ${Array.from({length: this.count}, (_, i) => html`<div class=${i < numToColor ? 'target active' : 'target'}></div>`)}
        </div>
    `
    }
  }
  
  customElements.define('brainsatplay-audio-volume', Volume);