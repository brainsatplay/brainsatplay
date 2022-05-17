
import { LitElement, html, css } from 'lit';

export type SelectProps = {
  options?: Option[]
}

export type Option = {
  text: string;
  value: any;
}


export class Select extends LitElement {

  options: Option[] = []

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
    }
    
    render() {
      return html`
      <select>
      ${(this.options.length === 0) ? html`<slot></slot>` : this.options.map(o => html`<option value=${o.value}>${o.text}</option>`)}</select>
    `
    }
  }
  
  customElements.define('visualscript-select', Select);