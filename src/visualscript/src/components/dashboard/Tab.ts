
import { LitElement, html, css } from 'lit';
import { Select } from '../general/Select';
import { Button } from '../general/Button';

export type ControlProps = {
  label: string
  type: 'select' | 'button' | string
  options?: string[],
  onChange?: (ev: Event)=> any,
  onClick?: (ev: Event)=> any
}

export type TabProps = {
  label?: string;
  controls?: ControlProps[]
}

export class Tab extends LitElement {

  label: TabProps['label']
  controls: TabProps['controls'] = []
  controlPanel: HTMLDivElement

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background:gray;
    }

    :host * {
      font-family: sans-serif;
      box-sizing: border-box;
      font-color: #424242;
    }
    `;
  }
    
    static get properties() {
      return {
        label : {
          type: String,
           reflect: true
        },
        controls: {
          type: Array,
          reflect: true
        }
      };
    }


    constructor(props: TabProps = {}) {
      super();
      if (props.label) this.label = props.label
      if (props.controls) this.controls = props.controls
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('controls')) {
        this.controlPanel = document.createElement('div')
        this.controls.forEach(o => {
          let element;
          if (o.type === 'select') element = new Select(o)
          if (o.type === 'button') element = new Button(o)
          this.controlPanel.insertAdjacentElement('beforeend',element)
        })
      }
    }
    
    render() {
      return html`
      <section><slot></slot></section>
    `
    }
  }
  
  customElements.define('visualscript-tab', Tab);