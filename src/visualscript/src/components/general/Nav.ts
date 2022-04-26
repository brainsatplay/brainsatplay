// Note: Inspired by the Red Hat website https://www.redhat.com/en

import { LitElement, html, css } from 'lit';

type ElementType = {
  content: string
  link?: string,
  external?: boolean,
  type?: string
}

export type NavProps = {
  primary: {
    menu: ElementType[]
    options: ElementType[]
  }
  secondary: ElementType[];
  brand: ElementType; // URL or string
  color?: string;
}

export class Nav extends LitElement {

  static get styles() {
    return css`

    
    :host {
      font-family: sans-serif;
    }

    header {
      width: 100%;
      position: absolute; 
      top: 0;
      left: 0;
    }

    :host * {
      box-sizing: border-box;
    }

    nav {
      color: white;
      width: 100%;
      padding:  0px 25px;
      display: flex;
      align-items: center;
      background: #060606;
    }


    #primary {
      position: sticky; 
      top: 0;
      left: 0;
      height: 70px;
      max-height: 100px;
      justify-content: space-between;
      font-size: 80%;
    }

    #primary > div {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row-reverse;
    }

    #menu, #options {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #secondary {
      height: 50px;
      justify-content: flex-end;
      border-bottom: 1px solid #3d3d3d;
      font-size: 75%;
    }

    a{
      color: white;
      text-decoration: none;
    }

    .brand {
      padding-right: 15px;
    }

    a:not(.brand) {
      height: 100%;
      display: flex;
      align-items: center; 
      justify-content: center;
      text-align: center;
    }

    .decorate {
      padding: 10px 15px;
    }

    #primary .decorate:hover {
      box-shadow: 0 4px 0 #0fb3ff inset;
    }

    #secondary .decorate:hover {
      box-shadow: 0 3px 0 #c4c4c4 inset;
    }

    button {
      border: 1px solid white;
      color: white;
      border-radius: 3px;
      background: transparent;
      padding: 5px 10px;
      margin-left: 10px;
      font-size: 95%;
    }
    
    nav button:last-child {
      margin-right: 0px;
    }

    button:hover {
      outline: 1.1px solid white;
      cursor: pointer;
    }

    @media only screen and (max-width: 800px) {
      #primary #menu {
        display: none;
      }
    }

    `;
  }
    
    static get properties() {
      return {
        primary: {
          type: Object,
          reflect: true,
        },
        secondary: {
          type: Array,
          reflect: true,
        },
        brand: {
          type: Object,
        },
        color: {
          type: String,
          reflect: true,
        },
      };
    }

    primary: NavProps['primary']
    secondary: NavProps['secondary']

    color: NavProps['color']
    brand: NavProps['brand']

    constructor(props: NavProps = {brand: {
      content: 'My Brand',
    }, primary: {menu: [], options: []}, secondary: []}) {
      super();

      this.primary = props.primary ?? {menu: [], options: []}
      this.secondary = props.secondary ?? []
      this.color = props.color ?? 'blue'
      this.brand = props.brand ?? 'My Brand'

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('type')) {

      // }
    }

    getElement = (o: ElementType) => {
      switch (o.type){

        case 'button': 
          return html`<a href="${o.link}" target=${(o.external) ? "_blank" : "_self"}><button>${o.content}</button></a>`

        default:
          return html`<a href="${o.link}" target=${(o.external) ? "_blank" : "_self"} class="decorate">${o.content}</a>`

      }
    }
  
    render() {



      return html`
      <header>
      ${(this.secondary.length > 0) ? html`<nav id="secondary">${this.secondary?.map(o => this.getElement(o))}</nav>` : ``}
      <nav id="primary">
      ${ html`<a class="brand" target=${(this.brand.external) ? "_blank" : "_self"} href=${this.brand.link}>${(/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/.test(this.brand.content)) ? html`<img src="${this.brand.content}"></img>` : html`<h1>${this.brand.content.toUpperCase()}</h1>`}</a>`}
        <div>
          <div id="options">
          ${this.primary.options?.map(o => this.getElement(o))}
          </div>
          <div id="menu">
            ${this.primary.menu?.map(o => this.getElement(o))}
          </div>
        </div>

      </nav>
      </header>
    `
    }
  }
  
  customElements.define('brainsatplay-nav', Nav);