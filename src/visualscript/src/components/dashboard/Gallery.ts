
import { LitElement, html, css } from 'lit';
import { App } from './App';

export type GalleryProps = {

}

export class Gallery extends LitElement {

  apps: App[] = []


  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
    } 

    #apps {
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    #tile {
      box-sizing: border-box;
      flex: 1 0 auto;
      aspect-ratio: 1 / 1 ;
      max-width: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.2);
      cursor: pointer;
      transition: 0.5s;
    }

    #tile:hover{
      background: rgba(0,0,0,0.1);
    }

    #tile > div {
      padding: 25px;
    }
    `;
  }
    
    static get properties() {
      return {

      };
    }


    constructor(props: GalleryProps = {}) {
      super();
    }

    load = (app, i) => {
      // if (i !== 0) app.style.display = 'none' // Hide tabs other than the first
      // return html`<button class="tab" @click=${() => {

      //   // Toggle between Tabs
      //   if (app.style.display === 'none') {
      //     this.apps.forEach(t => (t != app) ? t.style.display = 'none' : t.style.display = '') // hide other tabs
      //   }

      // }}>${app.label ?? `Tab ${i}`}</button>`

      app.style.display = 'none' // Hide app content

      return html`<div id=tile @click=${() => { console.log('clicked!')}}>
        <div>
          <h3>${app.name}</h3>
          <p>This is app #${i}.</p>
        <div>
      </div>`
    }

    getApps = () => {
      this.apps = []
      for(var i=0; i<this.children.length; i++){        
        const child = this.children[i]
        if (child instanceof App) this.apps.push(child)
      }
      return this.apps
    }
    
    
    
    render() {

      this.getApps()

      return html`
      <div id=apps>
      ${this.apps.map(this.load)}
      </div>
      <section>
        <slot></slot>
      </section>
    `
    }
  }
  
  customElements.define('visualscript-gallery', Gallery);