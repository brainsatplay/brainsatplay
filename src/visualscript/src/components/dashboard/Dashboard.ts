
import { LitElement, html, css } from 'lit';
import "../general/Overlay"

export type DashboardProps = {
  target: {[x:string]: any}
  header?: string
  footer?: string
  sidebar?: string
  main?: string
  mode?: string
}

export class Dashboard extends LitElement {

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

    slot {
      display: grid;
      grid-template-columns: 1fr fit-content(300px);
      grid-template-rows: fit-content(75px) 1fr fit-content(75px);
      grid-template-areas: 
              "nav nav"
              "main side"
              "foot foot";
  
      width: 100%;
      height: 100%;
    }
    `;
  }
    
    static get properties() {
      return {
        target: {
          type: Object,
          reflect: true,
        },
        header: {
          type: String,
          reflect: true,
        },
        mode: {
          type: String,
          reflect: true,
        },
      };
    }

    target: DashboardProps['target']
    header: DashboardProps['header']
    footer: DashboardProps['footer']
    sidebar: DashboardProps['sidebar']
    main: DashboardProps['main']

    history: any[] = []
    mode: string

    constructor(props: DashboardProps = {target: {}, header: 'Object'}) {
      super();

      this.target = props.target ?? {}
      this.header = props.header ?? 'Object'
      this.mode = props.mode ?? 'view'
      this.footer = props.footer ?? ''
      this.sidebar = props.sidebar ?? ''
      this.main = props.main ?? ''

    }
    
    willUpdate(changedProps:any) {
      // console.log(changedProps)
      if (changedProps.has('target')) {

      }
    }

    getActions = (key:string, o:any) => {

      let actions;

      if (typeof o[key] === 'object') {
        actions = html`<brainsatplay-button primary=true size="small" @click="${() => {
          this.history.push({parent: o, key: this.header})
          this.target = o[key]
          this.header = key
          this.mode = (Array.isArray(o[key])) ? 'plot' : 'view'
      }}">${Array.isArray(o[key]) ? html`Plot` : html`View`}</brainsatplay-button>`
      }

      return html`
      <div class="actions">
            ${actions}
      </div>
      `
    }


    getElement = (key:string, o: any) => {

        
        return html`
        <div class="attribute separate">
        <div>
          <span class="name">${key}</span><br>
          <span class="value">${(
            typeof o[key] === 'object' 
            ? (Object.keys(o[key]).length ? o[key].constructor.name : html`Empty ${o[key].constructor.name}`)
            : o[key])}</span>
        </div>
          ${this.getActions(key, o)}
        </div>`

    }
  
    render() {

      return html`
      <slot>
      </slot>
    `
    }



  //   <div>
  //   <div class="header separate">
  //     <span>${this.header}</span>
  //     ${ (this.history.length > 0) ? html`<brainsatplay-button size="extra-small" @click="${() => {
  //         const historyItem = this.history.pop()
  //         this.header = historyItem.key
  //         this.target = historyItem.parent
  //     }}">Go Back</brainsatplay-button>` : ``}
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