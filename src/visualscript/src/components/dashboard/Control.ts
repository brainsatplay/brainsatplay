
import { LitElement, html, css } from 'lit';
import { Button, ButtonProps } from '../general';
import { Select, File, Range, Switch, Input, SelectProps, FileProps, RangeProps, SwitchProps, InputProps } from '../input';

export type ControlProps = {
  label?: string
  type?: 'select' | 'button' | 'file' | string
  persist?: boolean,
  park?: boolean
} & SelectProps & ButtonProps & FileProps & SwitchProps & RangeProps & InputProps

export class Control extends LitElement {

  element: HTMLElement;

  label: ControlProps['label'] = 'Control'
  type: ControlProps['type'] = 'button'
  persist: ControlProps['persist'] = false
  park: ControlProps['park'] // Keep in the same place

  // Select
  value: ControlProps['value']
  options: ControlProps['options'] = []

  // File / Select
  onChange: ControlProps['onChange'] = () => {}
  accept: ControlProps['accept']
  webkitdirectory: ControlProps['webkitdirectory'] 
  directory: ControlProps['directory'] 
  multiple: ControlProps['multiple']

  // Button
  onClick: ControlProps['onClick']
  primary: ControlProps['primary']
  backgroundColor: ControlProps['backgroundColor'] 
  size: ControlProps['size']

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
    }

    slot {
      display: none;
    }

    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0px 15px;
      margin: 10px;
      border: 1px solid rgb(180,180,180);
      /* white-space: nowrap; */
    }

    h5 {
      margin: 0;
    }


    div > * {
      padding: 10px;
    }

    span { 
      flex-grow: 1;
    }

    @media (prefers-color-scheme: dark) {
      div {
        border: 1px solid rgb(120,120,120);
      }
    }

    `;
  }
    
    static get properties() {
      return {
        label: {
          type: String,
          reflect: true
        },
        type: {
          type: String,
          reflect: true
        },
        persist: {
          type: Boolean,
          reflect: true
        },
        park: {
          type: Boolean,
          reflect: true
        },

        // Select
        value: {
          type: Object,
          reflect: true
        },
        options: {
          type: Object,
          reflect: true
        },

        // File / Select
        onChange: {
          type: Object,
          reflect: true
        },
        accept: {
          type: String,
          reflect: true
        },
        webkitdirectory: {
          type: Boolean,
          reflect: true
        },
        directory: {
          type: Boolean,
          reflect: true
        },
        multiple: {
          type: Boolean,
          reflect: true
        },

        // Button
        primary:  {
          type: Boolean,
          reflect: true
        },
        backgroundColor: {
          type: String,
          reflect: true
        },
        size:  {
          type: String,
          reflect: true
        },
        onClick: {
          type: Object,
          reflect: true
        },

      };
    }


    constructor(props: ControlProps = {}) {
      super();

      if (props.label) this.label = props.label
      if (props.type) this.type = props.type
      if (props.park) this.park = props.park
      if (props.persist) this.persist = props.persist

      // Select
      if (props.options) this.options = props.options
      if (props.value) this.value = props.value

      // File / Select
      if (props.onChange) this.onChange = props.onChange
      if (props.accept) this.accept = props.accept
      if (props.webkitdirectory) this.webkitdirectory = props.webkitdirectory
      if (props.directory) this.directory = props.directory
      if (props.multiple) this.multiple = props.multiple

      // Button
      if (props.onClick) this.onClick = props.onClick
      if (props.primary) this.primary = props.primary
      if (props.backgroundColor) this.backgroundColor = props.backgroundColor
      if (props.size) this.size = props.size

      // this.getElement()
    }
    

    // NOTE: Must do this so that custom Select trigger can be recognized as the target of a window.onclick event.
    // createRenderRoot() {
    //   return this;
    // }

    getElement = () => {
      if (this.type === 'select') this.element = new Select(this)
      else if (this.type === 'file') this.element = new File(this)
      else if (this.type === 'switch') this.element = new Switch(this)
      else if (this.type === 'range') this.element = new Range(this)
      else if (['input', 'text', 'number'].includes(this.type)) this.element = new Input(this)
      else this.element = new Button(this)
    }

    render() {

      this.getElement()

      return html`<div><h5>${this.label}</h5>${this.element}</div><slot></slot>`
    }

    willUpdate = (changedProps:any) => {
      changedProps.forEach((v, k) => {
        if (this.element) this.element[k] = this[k]
      }) // TODO: Make sure this actually passes relevant changes
    }

    updated(changedProperties) {
      const slot = this.shadowRoot.querySelector("slot")
      const nodes = slot.assignedNodes()

      // Manually Place Slot Text in Button
      if (this.type === 'button' && nodes.length) nodes.forEach(el => this.element.appendChild(el))

    }
  }
  
  customElements.define('visualscript-control', Control);