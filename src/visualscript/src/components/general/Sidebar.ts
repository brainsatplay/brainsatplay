
import { LitElement, html, css } from 'lit';

export type SidebarProps = {

}

export class Sidebar extends LitElement {

  static get styles() {
    return css`

    
    :host {
      color: black;
      background: rgb(240, 240, 240);
      grid-area: side;
      overflow-x: hidden; 
      overflow-y: scroll;
    }

    select, input {
      width: 200px;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        color: white;
        background: rgb(25, 25, 25);
      }
    }

    `;
  }
    
    static get properties() {
      return {
       
      };
    }

    constructor(props: SidebarProps = {}) {
      super();

    }
    

  
    render() {

      return html`
        <div style="${this.children?.length ? 'padding: 25px' : ''}">
          <slot></slot>
        </div>
      `
    }
  }
  
  customElements.define('visualscript-sidebar', Sidebar);