
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';

export type MainProps = {

}

export class Main extends LitElement {

  tabs: Map<string, Tab>;

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      grid-area: main;
      overflow: scroll;
    }

    :host * {
      font-family: sans-serif;
      box-sizing: border-box;
      font-color: #424242;
    }

    #tabs {
      background: rgb(25,25,25);
      overflow-y: hidden;
      overflow-x: scroll;
      display: flex;
      align-items: center;
      position: sticky;
      width: 100%;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .tab {
      color: white;
      border: 0px;
      border-right: 1px solid rgb(25,25,25);
      padding: 6px 20px;
      text-align: center;
      font-size: 80%;
      background: rgb(50,50,50);
      cursor: pointer;
      min-width: 100px;
      flex-grow: 1;
    }

    .tab:hover {
      background: rgb(60,60,60);
    }

    .tab:active {
      background: rgb(75,75,75);
    }

    .tab.selected {
      background: rgb(60,60,60);
    }

    /* Tab Scrollbar */
    #tabs::-webkit-scrollbar {
      height: 2px;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    #tabs::-webkit-scrollbar-track {
      background: transparent;
      width: 25px;
    }

    #tabs::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 10px;
    }

    /* Handle on hover */
    #tabs:hover::-webkit-scrollbar-thumb {
      background: rgb(80, 236, 233);
    }
    `;
  }
    
    static get properties() {
      return {
        tabs: {
          type: Object,
          // reflect: true
        }
      };
    }

    constructor(props: MainProps = {target: {}, header: 'Object'}) {
      super();
    }

    addTab = (tab,i) => {
      if (i !== 0) tab.style.display = 'none' // Hide tabs other than the first
      return html`<button class="tab ${(i === 0) ? 'selected' : ''}"  @click=${(ev) => {

        // Show Correct Tab
        const tabs = this.shadowRoot.querySelector('#tabs')
        tabs.querySelectorAll('button').forEach(t => t.classList.remove('selected'))
        ev.target.classList.add('selected')
        if (tab.style.display === 'none') {
          this.tabs.forEach(t => (t != tab) ? t.style.display = 'none' : t.style.display = '') // hide other tabs
        }

        // Swap Sidebar Content
        const dashboard = this.parentNode 
        if (dashboard){
          const sidebar = dashboard.querySelector('visualscript-sidebar')
          if (sidebar) {
            for (let i = 0; i < sidebar.children.length; i++) {
              sidebar.removeChild(sidebar.children[i])
            }
            sidebar.insertAdjacentElement('beforeend', tab.controlPanel)
          }
        }
        

      }}>${tab.label ?? `Tab ${i}`}</button>`
    }

    getTabs = () => {
      this.tabs = new Map()
      for(var i=0; i<this.children.length; i++){        
        const child = this.children[i]
        if (child instanceof Tab) this.tabs.set(child.label, child)
      }
      return this.tabs
    }
    
    render() {
      this.getTabs()
      const tabMap = Array.from(this.tabs.values()).map(this.addTab)

      return html`
      ${( this.tabs.size > 0) ? html`<div id="tabs">
        ${tabMap}
      </div>` : ''}
      <section>
        <slot></slot>
      </section>
    `
    }
  }
  
  customElements.define('visualscript-main', Main);