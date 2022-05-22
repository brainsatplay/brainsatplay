
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';
import { Sidebar } from '..';

// TODO: Remove long-winded references to the Global Main


export type TabToggleProps = {
  selected: boolean
}


export const TabTogglePropsLit = {
  name : {
    type: String,
    reflect: true
  },
}

export class TabToggle extends LitElement {

  to: Tab
  selected: TabToggleProps['selected']

  static get styles() {
    return css`

    :host {
      flex-grow: 1;
      min-width: 100px;
    }

    :host * {
      box-sizing: border-box;
    }

    button {
        color: black;
        background: rgb(205,205,205);
        border-right: 1px solid rgb(230,230,230);
        border: 0px;
        padding: 6px 20px;
        text-align: center;
        font-size: 80%;
        cursor: pointer;
        width: 100%;
        height: 100%;
    }

    button > span {
      font-size: 60%;
    }

    button:hover {
        background: rgb(230,230,230);
      }
  
      button:active {
        background: rgb(210,210,210);
      }
  
      button.selected {
        background: rgb(230,230,230);
      }


      @media (prefers-color-scheme: dark) {
        button {
            color: white;
            background: rgb(50,50,50);
            border-right: 1px solid rgb(25,25,25);
        }

        button:hover {
            background: rgb(60,60,60);
        }
      
        button:active {
        background: rgb(75,75,75);
        }
      
        button.selected {
        background: rgb(60,60,60);
        }

      }
    `;
  }
    
    static get properties() {
      return TabTogglePropsLit;
    }


    constructor(tab: Tab) {
      super();
        this.to = tab
    }
    
    render() {

      return html`
      <button class="${(this.selected) ? 'selected' : ''}"  @click=${(ev) => {

        this.to.on(ev)

        // Show Correct Tab
        const tabs = this.to.dashboard.main.shadowRoot.querySelector('visualscript-tab-bar')

        if (tabs){
          this.to.toggle.shadowRoot.querySelector('button').classList.add('selected')

          // if (this.to.style.display === 'none') {
            this.to.dashboard.main.tabs.forEach(t => {

              if (t != this.to) { 
                t.toggle.shadowRoot.querySelector('button').classList.remove('selected')
                t.style.display = 'none' 
                t.off(ev)
              } else { t.style.display = ''} // hide other tabs

            })
          // }
        } else console.warn('No TabBar instance in the global Main')

        // Swap Sidebar Content
        const dashboard = this.to.dashboard 

        if (dashboard){
          const sidebar = dashboard.querySelector('visualscript-sidebar') as Sidebar
          
          if (sidebar) {
            sidebar.content = (this.to.controlPanel.children.length) ? this.to.controlPanel : ''
          }
        }

      }}>${this.to.name ?? `Tab`} <span>${this.to.type}</span></button>
    `
    }
  }
  
  customElements.define('visualscript-tab-toggle', TabToggle);