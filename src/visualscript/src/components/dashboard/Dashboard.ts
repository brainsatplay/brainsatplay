
import { LitElement, html, css } from 'lit';
import "../general/Overlay"
import { Main } from './Main';
import { Sidebar } from '../dashboard';
import { Nav, Footer } from '../general';
import { App } from './App';


export const slotGrid = css`

slot {
  display: grid;
  grid-template-columns: 1fr fit-content(100%);
  grid-template-rows: fit-content(75px) 1fr fit-content(75px);
  grid-template-areas: 
          "nav nav"
          "main side"
          "foot foot";

  width: 100%;
  height: 100%;
}

`

export type DashboardProps = {
  open?: boolean
  closeHandler?: Function,
  global?: boolean
  toggle?: HTMLElement | string
}

export class Dashboard extends LitElement {

  static get styles() {
    return css`
    
    :host {
      color-scheme: light dark;
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      grid-area: main;
      overflow: hidden;
    }

    :host([global]) {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1000;
      pointer-events: none;
    }

    :host([open]) {
      pointer-events: all;
    }


    :host([global]) slot {
      opacity: 0;
      pointer-events: none;
    }

    :host([open]) #close {
      display: block;
    }

    :host * {
      box-sizing: border-box;
    }

    slot {
      background: white;
      color: black;
    }

    ${slotGrid}

    :host([open]) slot {
      opacity: 1;
      pointer-events: all;
    }

    #close {
      position: absolute; 
      top: 22px;
      right: 22px;
      z-index: 101;
      display: none;
    }

    #dashboard-toggle {
      background: white;
      position: absolute; 
      pointer-events: all;
      top: 0px;
      right: 22px;
      z-index: 1000;
      color: black;
      border: 1px solid black;
      border-top: none;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 70%;
      font-weight: bold;
      border-bottom-left-radius: 7px;
      border-bottom-right-radius: 7px;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
    }

    :host([open]) #dashboard-toggle {
      display: none;
    }

    @media (prefers-color-scheme: dark) {
      slot {
        color: white;
        background: black;
      }

      #dashboard-toggle { 
        border: 1px solid white;
        border-top: none;
        color: white;
        box-shadow: 0 1px 5px 0 rgb(255 255 255 / 20%);
        background: black;
      }
    }
    `;
  }
    
    static get properties() {
      return {
        open: {
          type: Boolean,
          reflect: true,
        },
        closeHandler: {
          type: Function,
          reflect: true,
        },
        global: {
          type: Boolean,
          reflect: true,
        },
      };
    }

    open: DashboardProps['open']
    closeHandler: DashboardProps['closeHandler']
    global: DashboardProps['global']
    apps: Map<string, App> = new Map()

    main: Main
    nav: Nav
    footer: Footer
    sidebar: Sidebar
    toggle: HTMLElement

    constructor(props: DashboardProps = {}) {
      super();

      this.open = props.open ?? true;
      this.closeHandler = props.closeHandler ?? (() => {});
      this.toggle = (typeof props.toggle === 'string') ? document.getElementById(props.toggle) : props.toggle
    }
    

  
    render() {

      // Add Global Class
      if (this.global) this.classList.add('global')
      else  this.classList.remove('global')


      if (this.global){
        const apps = document.querySelectorAll('visualscript-app')
        for(var i=0; i < apps.length; i++){   
          const app = apps[i] as App    
          if (!this.apps.has(app.name)) this.apps.set(app.name, app)
        }
      }

      // Add Open Class
      if (this.open) this.classList.add('open')
      else {
        this.classList.remove('open')
        this.dispatchEvent(new CustomEvent('close'))
      }
      
      this.main = this.querySelector('visualscript-main')
      this.footer = this.querySelector('visualscript-footer')
      this.nav = this.querySelector('visualscript-nav')
      this.sidebar = this.querySelector('visualscript-sidebar')

      const onClick = () => {
        this.open = true
        const selectedApp = this.apps.values().next().value

        // Always open the app first!
        selectedApp.toggle.shadowRoot.querySelector('button').click()
    }

    if (this.toggle) this.toggle.onclick = onClick

      return html`
      ${(this.global && !this.toggle) ? html`<div id="dashboard-toggle" @click=${onClick}>Edit</div>`: ''}
      ${this.global ? html`<visualscript-button id='close' secondary size="small" @click=${() => this.open=false}>Close</visualscript-button>` : ``}
      <slot>
      </slot>
    `
    }



  //   <div>
  //   <div class="header separate">
  //     <span>${this.header}</span>
  //     ${ (this.history.length > 0) ? html`<visualscript-button size="extra-small" @click="${() => {
  //         const historyItem = this.history.pop()
  //         this.header = historyItem.key
  //         this.target = historyItem.parent
  //     }}">Go Back</visualscript-button>` : ``}
  //   </div>
  //   <div class="container">
  //         ${(
  //           this.mode === 'view' 
  //           ? Object.keys(this.target)?.map(key => this.getElement(key, this.target))
  //           : Object.keys(this.target)?.map(key => this.getElement(key, this.target)) // TODO: Implement plot
  //         )}
  //   </div>
  // </div>
  }
  
  customElements.define('visualscript-dashboard', Dashboard);