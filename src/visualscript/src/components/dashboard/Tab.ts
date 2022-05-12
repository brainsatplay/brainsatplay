
import { LitElement, html, css } from 'lit';

export type TabProps = {
  label?: string;
}

export class Tab extends LitElement {

  label: TabProps['label']

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
        label : {
          type: String
        }
      };
    }


    constructor(props: TabProps = {}) {
      super();

      console.log('props', props)
      this.label = props.label
    }
    
    render() {

      return html`
      <section><slot></slot></section>
    `
    }
  }
  
  customElements.define('visualscript-tab', Tab);