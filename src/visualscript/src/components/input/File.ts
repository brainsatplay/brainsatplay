
import { LitElement, html, css } from 'lit';

export type FileProps = {
  accept?: string // e.g. "audio/*, video/*"
  onChange?: (ev: Event)=> any
  webkitdirectory?: boolean
  directory?: boolean 
  multiple?: boolean
}

export class File extends LitElement {

  onChange: FileProps['onChange'] = () => {}
  accept: FileProps['accept']
  webkitdirectory: FileProps['webkitdirectory'] 
  directory: FileProps['directory'] 
  multiple: FileProps['multiple']

  static get styles() {
    return css`

    :host {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    
    input[type=file] {
      display: none;
    }

    :host * {
      box-sizing: border-box;
    }
    
    button {
      flex: auto;
      padding: 8px 12px;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border: none;  
      color: #ffffff;
      background-color: #1ea7fd;
      width: 100%;
      cursor: pointer;    
      /* white-space: nowrap; */
      font-weight: bold;
    }

    .hide {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      border: 0;
    }

    input[type=text] {
      flex-grow: 1;
      padding: 8px 8px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border: none;
    }

    input[type=text] {
      flex-grow: 1;
      padding: 8px 8px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border: none;
      color: black;
      background-color: white;
    }

    @media (prefers-color-scheme: dark) {
      input[type=text] {
        color: white;
        background-color: rgb(59, 59, 59);
      }
    }
    
    `;
  }
    
    static get properties() {
      return {
          accept: {
            type: String,
            reflect: true
          },
          onChange: {
            type: Function,
            reflect: true
          },
          webkitdirectory: {
            type: Boolean,
            reflect: true
          },
          directory: {
            type: Boolean,
            reflect: true
          },
          multiple: {
            type: Boolean,
            reflect: true
          },
      };
    }

    constructor(props: FileProps = {}) {
      super();
      if (props.accept) this.accept = props.accept
      if (props.onChange) this.onChange = props.onChange
      if (props.webkitdirectory) this.webkitdirectory = props.webkitdirectory
      if (props.directory) this.directory = props.directory
      if (props.multiple) this.multiple = props.multiple
    }
    
    render() {

      return html`
      <label for="fileupload" id="buttonlabel">
        <button aria-controls="filename" tabindex="0" @click=${() => {
          const input = this.shadowRoot.querySelector('input[type=file]') as HTMLInputElement
          if (input) input.click()
        }}>Choose File</button>
      </label>
      <input 
        type="file" 
        id="fileupload" 
        accept="${this.accept ?? ''}" 
        webkitdirectory=${this.webkitdirectory}
        directory=${this.directory}
        multiple=${this.multiple}

        @change=${(ev) => {
          const fileUploaded = ev.target.files[0];
          const input = this.shadowRoot.querySelector('input[type=text]') as HTMLInputElement
          var filename = fileUploaded.name
          input.value = filename
          input.placeholder = filename
          input.focus()
          this.onChange(ev);
        }}
      >
      <label for="filename" class="hide">
        uploaded file
      </label>
      <input type="text" id="filename" autocomplete="off" readonly placeholder="no file chosen">  
    `
    }
  }
  
  customElements.define('visualscript-file', File);