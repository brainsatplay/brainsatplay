
import { LitElement, html, css } from 'lit';
import { PersistableProps, getPersistent, setPersistent } from './persistable';

// Adapted from https://inclusive-components.design/toggle-button/

export type SwitchProps = {
  label?: string;
  persist?: boolean;
  value?: boolean
  onChange?: (ev: Event)=> any
}

export class Switch extends LitElement {

  label: SwitchProps['label'];
  persist: SwitchProps['persist'] = false
  value: SwitchProps['value']
  onChange: SwitchProps['onChange'] = () => {}

  static get styles() {
    return css`

    :host * {
      box-sizing: border-box;
    }

    [role="switch"] {  
      position: relative;
      border-radius: 0.5rem;
      padding: 1em 2em;
      cursor: pointer;
      background-color: white;
      border: none;
      border-radius: 14px;
      -webkit-transition: .4s;
      transition: .4s;
    }

    [role="switch"] * {
      pointer-events: none;
    }


    [role="switch"][aria-pressed="true"] {
      background-color: #1ea7fd;
    }

    [role="switch"][aria-pressed="true"] > .slider{
      -webkit-transform: translateY(-50%) translateX(100%);
      -ms-transform: translateY(-50%) translateX(100%);
      transform: translateY(-50%) translateX(100%);
    }

    /* Remove the default outline and 
    add the outset shadow */  
    [aria-pressed]:focus {
      outline: none;
      box-shadow: white 0 0 5px 2px;
    }

    /* The slider */
    .slider {
      padding: 3px;
      position: absolute;
      cursor: pointer;
      top: 50%;
      left: 0;
      -webkit-transform: translateY(-50%);
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
      -webkit-transition: .4s;
      transition: .4s;
      height: 100%;
      aspect-ratio: 1/1;
    }
    .slider > * {
      background-color: #ccc;
      width: 100%;
      height: 100%;
    }

    /* Rounded sliders */
    .slider.round > * {
      border-radius: 34px;
    }

    `;
    
  }
    
    static get properties() {
      return PersistableProps;
    }

    constructor(props: SwitchProps = {}) {
      super();
      if (props.onChange) this.onChange = props.onChange
      if (props.label) this.label = props.label
      if (props.persist) this.persist = props.persist

      // Inside Control
      const val =  getPersistent(props)
      if (val) this.value = val
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('value')) setPersistent(this)
    }
    
    render() {
      return html`
      <button class="switch" role="switch" aria-pressed="${String(this.value)}" aria-labelledby=${this.label} @click=${(e) => {
          let pressed = e.target.getAttribute('aria-pressed') === 'true';
          this.value = !pressed
          e.target.setAttribute('aria-pressed', String(this.value));
          this.onChange(e)
      }}>
        <div class="slider round"><div></div></div>
    </button>
    `
    }
  }
  
  customElements.define('visualscript-switch', Switch);