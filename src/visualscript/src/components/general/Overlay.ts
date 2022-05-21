
import { LitElement, html, css } from 'lit';

export type OverlayProps = {
  open?: boolean,
}

export class Overlay extends LitElement {

  static get styles() {
    return css`

    div {
      opacity: 0;
      width: 100vw;
      height: 100vh;
      transition: 0.5s;
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 50;
      color: black;
      background: rgb(255,255, 255, 0.7);
    }
    

    div[open] {
      opacity: 1;
      pointer-events: all;
      backdrop-filter: blur(3px);
    }

    @media (prefers-color-scheme: dark) {
      div {
        color: white;
        background: rgb(0,0,0, 0.5);
      }
    }

    `;
  }
    
    static get properties() {
      return {
        open: {
          type: Boolean,
          reflect: true,
        }
      };
    }

    open: boolean = false

    constructor(props: OverlayProps = {}) {
      super();

      this.open = props.open ?? false
    }
    
    render() {

      return html`
      <div ?open=${this.open ? true : false}>
        <slot></slot>
      </div>
    `
    }
  }
  
  customElements.define('visualscript-overlay', Overlay);