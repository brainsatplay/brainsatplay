
import { LitElement, html, css } from 'lit';
import { Select } from '../../input/Select';
import { Button } from '../../general/Button';
import { Dashboard } from '../Dashboard';
import { TabToggle } from './TabToggle';

export type ControlProps = {
  name: string
  type: 'select' | 'button' | string
  options?: string[],
  onChange?: (ev: Event)=> any,
  onClick?: (ev: Event)=> any
}

export type TabProps = {
  name?: string;
  controls?: ControlProps[],
  type?: 'app' | 'tab'
  on?: (ev: Event)=> any,
  off?: (ev: Event)=> any
}


export const TabPropsLit = {
  name : {
    type: String,
    reflect: true
  },
  controls: {
    type: Array,
    reflect: true
  },
  on: {
    type: Function,
    reflect: true
  },
  off: {
    type: Function,
    reflect: true
  }
}

export class Tab extends LitElement {

  name: TabProps['name']
  controls: TabProps['controls'] = []
  on: TabProps['on'] = () => {}
  off: TabProps['off'] = () => {}
  type: TabProps['type'] = 'tab'
  controlPanel: HTMLDivElement
  dashboard: Dashboard;
  toggle: TabToggle

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background: inherit;
    }

    slot {
      overflow: scroll;
    }

    :host * {
      
      box-sizing: border-box;
      
    }
    `;
  }
    
    static get properties() {
      return TabPropsLit;
    }


    constructor(props: TabProps = {}) {
      super();
      if (props.name) this.name = props.name
      if (props.controls) this.controls = props.controls
      if (props.on) this.on = props.on
      if (props.off) this.off = props.off

      // Allow dashboards inside apps!
      let dashboards = document.body.querySelectorAll('visualscript-dashboard')
      this.dashboard = (Array.from(dashboards).find(o => o.parentNode === document.body) as Dashboard) ?? new Dashboard() // Find global dashboard
      this.dashboard.global = true
      this.dashboard.open = false


      // Create a toggle
      this.toggle = new TabToggle(this)

      this.dashboard.addEventListener('close', (ev) => {
        this.off(ev)
      })

    }

    willUpdate(changedProps:any) {
      if (changedProps.has('controls')) {
        this.controlPanel = document.createElement('div')
        this.controls.forEach(o => {
          let element;
          if (o.type === 'select') element = new Select(o)
          if (o.type === 'button') element = new Button(o)
          this.controlPanel.insertAdjacentElement('beforeend',element)
        })
      }
    }
    
    render() {
      return html`
      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-tab', Tab);