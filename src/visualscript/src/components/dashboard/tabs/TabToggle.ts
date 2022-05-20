
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';

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
        this.render()
    }
    
    render() {

      console.log('RENDERING', this.to, this.to.name)
      return html`
      <button class="${(this.selected) ? 'selected' : ''}"  @click=${(ev) => {

        this.to.on(ev)

        // Show Correct Tab
        const tabs = this.to.dashboard.main.shadowRoot.querySelector('visualscript-tab-bar')

        if (tabs){
          console.log(this.to.toggle)

          console.log('This Toggle', this.to.name, this.to.toggle)
          this.to.toggle.shadowRoot.querySelector('button').classList.add('selected')
          console.log(this.to.dashboard.main.tabs, tabs.querySelectorAll('visualscript-tab-toggle') )
          if (this.to.style.display === 'none') {
            this.to.dashboard.main.tabs.forEach(t => {
              if (t != this.to) { 
                console.log('Other Toggle',t.name, t.toggle)
                t.toggle.shadowRoot.querySelector('button').classList.remove('selected')
                t.style.display = 'none' 
                t.off(ev)
              } else { t.style.display = ''} // hide other tabs

            })
          }
        } else console.warn('No TabBar instance in the global Main')

        // Swap Sidebar Content
        const dashboard = this.parentNode 
        if (dashboard){
          const sidebar = dashboard.querySelector('visualscript-sidebar')
          if (sidebar) {
            for (let i = 0; i < sidebar.children.length; i++) {
              sidebar.removeChild(sidebar.children[i])
            }
            sidebar.insertAdjacentElement('beforeend', this.to.controlPanel)
          }
        }

      }}>${this.to.name ?? `Tab`}</button>
    `
    }
  }
  
  customElements.define('visualscript-tab-toggle', TabToggle);