
import { LitElement, html, css } from 'lit';
import { Dashboard } from './Dashboard';
import { Tab } from './Tab';

// ---------------- SPECIFICATION ----------------
// 1. Display the application metadata
// 2. Click into and instantiate the application
// 3. Leave the application

export type AppProps = {
  name?: string;
}

export class App extends LitElement {

  name: AppProps['name'];
  dashboard: Dashboard;
  parent: Node;

  static get styles() {
    
    return css`

    :host {
      width: 100%;
      height: 100%;
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
        name : {
          type: String
        }
      };
    }


    constructor(props: AppProps = {}) {
      super();

      this.name = props.name
      this.parent = this.parentNode // Grab original parent

    }



    render() {

      if (!parent) this.parent = this.parentNode // Grab original parent

      // Allow dashboards inside apps!
      let dashboards = document.querySelectorAll('visualscript-dashboard')
      this.dashboard = (Array.from(dashboards).find(o => o.parentNode === document.body) as Dashboard) ?? new Dashboard() // Find global dashboard

        this.dashboard.global = true
        this.dashboard.open = false

      return html`
        <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-app', App);