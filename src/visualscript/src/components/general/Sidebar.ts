
import { LitElement, html, css } from 'lit';

export type SidebarProps = {

}

export class Sidebar extends LitElement {

  static get styles() {
    return css`

    
    :host {
      background: rgb(234, 234, 234);
      padding: 25px;
    }

    select, input {
      width: 200px;
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

      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-sidebar', Sidebar);