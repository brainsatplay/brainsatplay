
import { LitElement, html, css } from 'lit';
import { Dashboard } from '../Dashboard';
import { TabToggle } from './TabToggle';
import { Control, ControlProps } from '../Control';

export const tabStyle = css`

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
`

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
    return tabStyle;
  }
    
    static get properties() {
      return TabPropsLit;
    }


    constructor(props: TabProps = {}) {
      super();
      if (props.name) this.name = props.name
      if (props.controls) this.controls = props.controls // Will also check for controls in the <slot> later
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
          this.addControl(new Control(o))
        })

      }
    }

    addControl = (instance: Control) => {
      this.controlPanel.appendChild(instance)
    }

    updated = () => {
      const controls = this.querySelectorAll('visualscript-control')
      controls.forEach((control: Control) => {
        if (this.type === 'app')  control.park = true // Park all controls within an app
        else if (!control.park) this.addControl(control)
      })
    }
    
    render() {
      return html`
      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-tab', Tab);