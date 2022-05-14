
import { LitElement, html, css } from 'lit';

// ---------------- SPECIFICATION ----------------
// 1. Display the application metadata
// 2. Click into and instantiate the application
// 3. Leave the application

export type AppProps = {
  name?: string;
}

export class App extends LitElement {

  name: AppProps['name']

  static get styles() {
    
    return css`

    :host {
      width: 100%;
      height: 100%;
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
        name : {
          type: String
        }
      };
    }


    constructor(props: AppProps = {}) {
      super();

      this.name = props.name
    }



    render() {

      return html`
        <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-app', App);