
import { LitElement, html, css } from 'lit';
import { App } from './App';
import '../general/Search';

export type Thing = {
  name: string,
  author?: string,
  tags?: string[]
}


export type GalleryProps = {
  search?: boolean,
  things?: Thing[]
}

export class Gallery extends LitElement {

  things: GalleryProps['things'] = []
  search: GalleryProps['search'] = false


  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
    } 

    #things {
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
      border-radius: 10px;
      margin: 10px;
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

      if (props.search) this.search = props.search
    }

    load = (thing, i) => {
      // if (i !== 0) thing.style.display = 'none' // Hide tabs other than the first
      // return html`<button class="tab" @click=${() => {

      //   // Toggle between Tabs
      //   if (thing.style.display === 'none') {
      //     this.things.forEach(t => (t != thing) ? t.style.display = 'none' : t.style.display = '') // hide other tabs
      //   }

      // }}>${thing.name ?? `Tab ${i}`}</button>`

      thing.style.display = 'none' // Hide thing content

      return html`<div id=tile @click=${() => { console.log('clicked!')}}>
        <div>
          <h3>${thing.name}</h3>
          <p>Item #${i}.</p>
        <div>
      </div>`
    }

    getThings = () => {
      this.things = []
      for(var i=0; i<this.children.length; i++){        
        const child = (this.children[i] as any)
        if (child.name) this.things.push(child) // Must have name to be a Thing
      }
      return this.things
    }
    
    
    
    render() {

      this.getThings()

      return html`
      <visualscript-search .items=${this.things}></visualscript-search>
      <div id=things>
      ${this.things.map(this.load)}
      </div>
      <section>
        <slot></slot>
      </section>
    `
    }
  }
  
  customElements.define('visualscript-gallery', Gallery);