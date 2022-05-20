
import { LitElement, html, css } from 'lit';

export type FooterProps = {

}

export class Footer extends LitElement {

  static get styles() {
    return css`

    :host {
      padding: 25px;
      border-top: 1px solid rgb(180,180,180);
      background: white;
      color: black;
      display:flex;
      align-items: center;
      width: 100%;
      font-size: 70%;
      box-sizing: border-box;
      z-index: 100;
      grid-area: foot;
    }

    :host * {
      box-sizing: border-box;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        background: #060606;
        color: white;
      }

      a {
        color: white;
      }
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