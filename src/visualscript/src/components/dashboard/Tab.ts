
import { LitElement, html, css } from 'lit';

export type TabProps = {

}

export class Tab extends LitElement {

  static get styles() {
    return css`

    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background:gray;
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
        
      };
    }


    constructor(props: TabProps = {target: {}, header: 'Object'}) {
      super();

    }
    
    render() {

      return html`

      <section><slot></slot></section>
    `
    }
  }
  
  customElements.define('visualscript-tab', Tab);