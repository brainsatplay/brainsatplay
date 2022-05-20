
import { LitElement, html, css } from 'lit';

export type SelectProps = {
  options?: (string | Option)[]
  value?: Option['value']
  onChange?: (ev: Event)=> any
}

export type Option = {
  text: string;
  value: string;
}


export class Select extends LitElement {

  options: SelectProps['options'] = []
  value: SelectProps['value']
  onChange: SelectProps['onChange'] = () => {}

  static get styles() {
    return css`

    :host {

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
        options: {
          type: Array,
          reflect: true
        },
        value: {
          type: String,
           reflect: true
        },
        onChange: {
            type: Function,
           reflect: true
        }
      };
    }

    add = (option:Option) => {
      this.options = [...this.options, option]
      this.render()
    }
 

    constructor(props: SelectProps = {}) {
      super();
      this.options = props.options ?? []
      const firstOption = (this.options[0]?.value ?? this.options[0] as string)
      this.value = props.value ?? firstOption
      if (props.onChange) this.onChange = props.onChange
    }
    
    render() {

      return html`
      <select @change=${(ev) => {
        this.value = ev.target.value
        this.onChange(ev) // forward change
      }}>
      ${(this.options.length === 0) ? html`<slot></slot>` : this.options.map(o => {
        if (typeof o != 'object') o = {value: o, text: o}
        return html`<option value=${o.value} ?selected=${(o.value === this.value)}>${o.text}</option>`
      })}</select>
    `
    }
  }
  
  customElements.define('visualscript-select', Select);