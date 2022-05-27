
import { LitElement, html, css } from 'lit';
import { Tab } from './tabs/Tab';
import { Dashboard } from './Dashboard';
import './App';
import './tabs/TabToggle';
import './tabs/TabBar';

export type MainProps = {

}

export class Main extends LitElement {

  tabs: Map<string, Tab> = new Map();

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      grid-area: main;
      overflow: hidden;
      background: inherit;
      color: inherit;
      position: relative;
    }

    :host * {
      box-sizing: border-box;
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

    getTabs = () => {
      const tabs = []

      // Apps (only for global Main)
      if ((this.parentNode as Dashboard)?.global){
        const apps = document.querySelectorAll('visualscript-app')
        for(var i=0; i < apps.length; i++){        
          if (!tabs.includes(apps[i])) tabs.push(apps[i])
        }
      }

      // Tabs
      for(var i=0; i<this.children.length; i++){        
        const child = this.children[i]
        if (child instanceof Tab) tabs.push(child)
      }

      tabs.forEach(tab => this.tabs.set(tab.name, tab))      

      return tabs
    }
    
    render() {
      const tabs = this.getTabs()
      const toggles = tabs.map((t,i) => {
        if (i !== 0) t.style.display = 'none' // Hide tabs other than the first
        return t.toggle
      })

      return html`
      <visualscript-tab-bar style="${toggles.length < 1 ? 'display: none;' : ''}">${toggles}</visualscript-tab-bar>
      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-main', Main);