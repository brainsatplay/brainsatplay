
import { LitElement, html, css } from 'lit';

export type SidebarProps = {

}

export class Sidebar extends LitElement {

  static get styles() {
    return css`

    
    :host {
      background: rgb(234, 234, 234);
      grid-area: side;
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
        <div style="${this.children?.length ? 'padding: 25px' : ''}">
          <slot></slot>
        </div>
      `
    }
  }
  
  customElements.define('visualscript-sidebar', Sidebar);