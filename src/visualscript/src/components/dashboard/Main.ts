
import { LitElement, html, css } from 'lit';

export type MainProps = {

}

export class Main extends LitElement {

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
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
        
      };
    }


    constructor(props: MainProps = {target: {}, header: 'Object'}) {
      super();

    }
    
    render() {

      return html`

      <section><slot></slot></section>
    `
    }
  }
  
  customElements.define('visualscript-main', Main);