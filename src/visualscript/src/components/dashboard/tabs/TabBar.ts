
import { LitElement, html, css } from 'lit';
import { Tab } from './Tab';
import '../App';

// TODO: Remove long-winded references to the Global Main


export type TabBarProps = {
  tabs?: Tab[]
}


export const TabBarPropsLit = {

}

export class TabBar extends LitElement {

  // tabs: TabBarProps['tabs']

  static get styles() {
    return css`

    :host {
      background: whitesmoke;
      overflow-y: hidden;
      overflow-x: scroll;
      display: flex;
      align-items: center;
      position: sticky;
      width: 100%;
      top: 0;
      left: 0;
      z-index: 10;
    }

    /* Tab Scrollbar */
    :host::-webkit-scrollbar {
      height: 2px;
      position: absolute;
      bottom: 0;
      left: 0;
    }

    :host::-webkit-scrollbar-track {
      background: whitesmoke;
      width: 25px;
    }

    :host::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    /* Handle on hover */
    :host:hover::-webkit-scrollbar-thumb {
      background: rgb(80, 236, 233);
    }

      @media (prefers-color-scheme: dark) {

        :host {
          background: rgb(25,25,25);
        }

      }
    `;
  }
    
    static get properties() {
      return TabBarPropsLit;
    }


    constructor(props: TabBarProps = {}) {
      super();
        // this.tabs = props.tabs ?? []
    }

    render() {

      return html`
      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-tab-bar', TabBar);