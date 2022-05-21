
import { LitElement, html, css } from 'lit';

// ---------------- SPECIFICATION ----------------
// 1. Connect to a Brains@Play endpoint
// 2. Get a list of options (e.g. Websocket, WebRTC)
// 3. Specify a room to connect to.
// 4. Be a host and manage the room.
// 5. Leave room.


export type SessionEditorProps = {

}

export class SessionEditor extends LitElement {

  static get styles() {
    return css`
    :host {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    :host * {
      
      box-sizing: border-box;
      
    }
    `;
  }
    
    static get properties() {
      return {
        
      };
    }


    constructor(props: SessionEditorProps = {target: {}, header: 'Object'}) {
      super();

    }
    
    render() {

      return html`

      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-session-editor', SessionEditor);