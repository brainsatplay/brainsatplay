
import { LitElement, html, css } from 'lit';

// ---------------- SPECIFICATION ----------------
// 1. View all the devices loaded into datastreams-api.
// 2. Select and start a device.
// 3. Send commands to the device.
// 4. Customize the device behavior
// 5. Prototype a device from scratch

export type DeviceEditorProps = {

}

export class DeviceEditor extends LitElement {

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


    constructor(props: DeviceEditorProps = {target: {}, header: 'Object'}) {
      super();

    }
    
    render() {

      return html`

      <slot></slot>
    `
    }
  }
  
  customElements.define('visualscript-device-editor', DeviceEditor);