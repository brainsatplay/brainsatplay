
import { LitElement, html, css } from 'lit';

export type SidebarProps = {
  closed?: boolean
}


const collapseThreshold = 600

export class Sidebar extends LitElement {

  closed: SidebarProps['closed']

  static get styles() {
    return css`

    
    :host {

      --collapse-width: ${collapseThreshold}px;
      --dark-color: rgb(25, 25, 25);
      --light-color: rgb(240, 240, 240);

      --blue-spiral: repeating-linear-gradient(
        45deg,
        rgb(30, 167, 253),
        rgb(30, 167, 253) 10px,
        rgb(118, 222, 255) 10px,
        rgb(118, 222, 255) 20px
      );

      /* Light Hue: 118, 222, 255 */
      /* Dark Hue: 0, 116, 196 */

      --light-spiral: repeating-linear-gradient(
        45deg,
        rgb(190, 190, 190),
        rgb(190, 190, 190) 10px,
        rgb(240, 240, 240) 10px,
        rgb(240, 240, 240) 20px
      );

      --dark-spiral: repeating-linear-gradient(
        45deg,
        rgb(25, 25, 25),
        rgb(25, 25, 25) 10px,
        rgb(75, 75, 75) 10px,
        rgb(75, 75, 75) 20px
      );

      --final-toggle-width: 15px;

      color: black;
      grid-area: side;
      background: var(--light-color);
      position: relative;
      display: flex;
    }


    :host > * {
      box-sizing: border-box;
    }

    :host(.selected) > #main {
        width: 0px;
        overflow: hidden;
    }

    :host(.selected) > #toggle {
      width: var(--final-toggle-width);
    }

    #toggle:hover { 
      background: var(--blue-spiral)
    }


    #toggle {
      height: 100%;
      width: 10px;
      display: block;
      background: rgb(25, 25, 25);
      cursor: pointer;
      background: var(--light-spiral);
      border:none;
    }

    #toggle:active {
      background: var(--blue-spiral)
    }

    #controls {
      overflow-x: scroll; 
      overflow-y: scroll;
      height: 100%;
    }


    #header {
      width: 100%;
      padding: 10px 25px;
      background: var(--dark-color);
      color: white;
      margin: 0px;
      position: sticky;
      left:0;
      top: 0;
    }

    /* FLIP SIDEBAR SELECTED MEANING */
    @media only screen and (max-width: ${collapseThreshold}px) {

      :host > #main {
          width: 0px;
          overflow: hidden;
      }

      :host(.selected) > #main {
        width: auto;
        overflow: auto;
      }


      :host(.selected) > #toggle {
        width: 10px;
      }
      

      :host > #toggle {
        width: var(--final-toggle-width);
      }

    }

    @media (prefers-color-scheme: dark) {
      :host {
        color: white;
        background: var(--dark-color);
      }

      #toggle {
        background: var(--dark-spiral)
      }

      #header {
        width: 100%;
        padding: 5px 25px;
        color: black;
        background: var(--light-color);
      }
    }

    `;
  }
    
    static get properties() {
      return {
        closed: {
          type: Boolean,
          reflect: true
        }
      };
    }

    constructor(props: SidebarProps = {}) {
      super()

      this.closed = props.closed
    }

  
    // NOTE: this.children.length is not updating when children are added (e.g. when switching to the default Dashbaord Tab)
    render() {

      if (this.closed) {
        if (window.innerWidth > collapseThreshold) this.classList.add('selected')
      }
      return html`
        ${this.children?.length ? html`<button id=toggle @click=${() => {
          this.classList.toggle('selected')
    }}></button>` : ''}
        <div id=main>
        ${this.children?.length ? html`<h4 id=header>Controls</h4>` : ''}
          <div id=controls>
            <slot></slot>
          </div>
        </div>
      `
    }
  }
  
  customElements.define('visualscript-sidebar', Sidebar);