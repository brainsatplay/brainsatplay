
import { LitElement, html, css } from 'lit';

export type FooterProps = {

}

export class Footer extends LitElement {

  static get styles() {
    return css`

    :host {
      padding: 25px;
      background: black;
      color: white;
      display:flex;
      align-items: center;
      width: 100%;
      font-size: 70%;
      box-sizing: border-box;
      z-index: 100;
      grid-area: foot;
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


    constructor(props: FooterProps = {}) {
      super();
    }
    
    render() {

      return html`

      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-footer', Footer);