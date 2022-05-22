
import { LitElement, html, css } from 'lit';
import { PersistableProps, getPersistent, setPersistent } from './persistable';

// Modified from https://www.a11ywithlindsey.com/blog/creating-accessible-range-slider-css

export type RangeProps = {
  label?: string;
  persist?: boolean;
  value?: number
  min?: number
  max?: number
  onChange?: (ev: Event)=> any
  onInput?: (ev: Event)=> any
}

export class Range extends LitElement {

  label: RangeProps['label'];
  persist: RangeProps['persist'] = false
  value: RangeProps['value'] = 0
  min: RangeProps['min'] = 0
  max: RangeProps['max'] = 100

  onChange: RangeProps['onChange'] = () => {}
  onInput: RangeProps['onInput'] = () => {}

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
    }

    :host * {
      box-sizing: border-box;
    }

    .wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    input[type="range"] {
      -webkit-appearance: none;
      position: relative;
      overflow: hidden;
      height: 30%;
      width: 100%;
      cursor: pointer;
      border: none;
      margin: 0;
  }
  
  output {
      position: absolute; 
      user-select: none; 
      pointer-events: none; 
      z-index: 1;
      top: 50%;
      left: 10px;
      transform: translate(0%, calc(-50% - 0.12rem));
      font-size: 80%;
  }
  
  input[type="range"]::-webkit-slider-runnable-track {
  }
  
  input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 0; /* 1 */
      height: 20px;
      box-shadow: -100vw 0 0 100vw #1ea7fd;
      opacity: 0.9;
      transition: opacity 0.5s;
  }
  
  input[type="range"]:hover::-webkit-slider-thumb{
      opacity: 1;
  }
  
  input[type="range"]::-moz-range-track {

  }
  
    .visually-hidden { 
        position: absolute !important;
        height: 1px; 
        width: 1px;
        overflow: hidden;
        clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap; /* added line */
    }

    `;
    
  }
    
    static get properties() {
      return Object.assign(PersistableProps, {
        min: {
          type: Number,
          reflect: true
        }, 
        max: {
          type: Number,
          reflect: true
        }
      });
    }

    constructor(props: RangeProps = {}) {
      super();
      if (props.onChange) this.onChange = props.onChange
      if (props.label) this.label = props.label
      if (props.persist) this.persist = props.persist
      if (props.min) this.min = props.min
      if (props.max) this.max = props.max

      const val = getPersistent(props)
      if (val) this.value = val
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('value')) setPersistent(this)
    }
    
    render() {

      return html`
      <div class="wrapper">
        <input type="range" min="${this.min}" max="${this.max}" id="${this.label}" @change=${(ev) => {
          this.value = ev.target.value
          this.onChange(ev)
        }} @input=${(ev) => {
            this.onInput(ev)
        }}/>
        <output for="${this.label}">${this.value}</output>
        <label class="visually-hidden" for="${this.label}">${this.label}</label>
      </div>
    `
    }
  }
  
  customElements.define('visualscript-range', Range);