
import { LitElement, html, css } from 'lit';
import { Modal } from './Modal';
import '../input/Input'
import './Button'

type Item = {
  name: string,
  tags: string[]
}

export type SearchProps = {
  placeholder?: string
  items?: Item[]
}

export class Search extends LitElement {

  modal: Modal;
  items: SearchProps['items']
  value: string;

  static get styles() {
    return css`

    :host {
      display: flex;
      align-items: center;
      padding: 10px;
    }

    :host * {
      
      box-sizing: border-box;
      
    }

    button {
      padding: 5px;
      border-radius: 5px;
    }

    `;
  }
    
    static get properties() {
      return {
        placeholder: {
          type: String
        },
        items: {
          type: Object,
          // reflect: true
        },
        value: {
          type:String,
          reflect: true
        }
      };
    }


    constructor(props: SearchProps = {}) {
      super();
      if (props.items) this.items = props.items

      window.onkeydown = (ev) => {
        switch(ev.code) {
          case 'Enter':
            this.modal.open = false
            break;
          case 'ArrowUp':
            console.log('Up!')
            break;

          case 'ArrowDown':
            console.log('Down!')
            break;

          case 'Escape':
            this.modal.open = false
            break;
        }
      }
    }

    getModal = ( ) => {
      return (this.shadowRoot.querySelector('visualscript-modal') as Modal)
    }
    
    render() {
      const regex = new RegExp(this.value, 'i')

      return html`
        <visualscript-button @click=${() => {
          this.modal = this.getModal()
          this.modal.toggle()
        }}>Search</visualscript-button>
        <visualscript-modal 
          .header=${html`<visualscript-input label="Search" @input=${(ev) => {
            this.value = ev.composedPath()[0].value
          }}></visualscript-input>`}
          .footer=${html`<div id=commands>Enter to select. Up and Down Arrows to navigate. Esc to close.</div>`}
        >
        <div>${
          this.items.map(i => {
          let matched = false;
         if (this.value) {
           if (i.tags) i.tags.forEach((v) => {if (v.match(regex)) matched = true})
           if (i.name.match(regex)) matched = true
        } else matched = true
        if (matched) return html`<div><h3>${i.name}</h3><small>${i.tags ?? 'No Tags'}</small></div>`
      })}</div>
        </visualscript-modal>
      `
    }
  }
  
  customElements.define('visualscript-search', Search);