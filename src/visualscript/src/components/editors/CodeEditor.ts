
import { LitElement, html, css } from 'lit';
import Prism from 'prismjs';
// window.Prism = Prism
// import 'prismjs/components/prism-c';
// import 'prismjs/components/prism-glsl';
// import "prism-themes/themes/prism-vsc-dark-plus.css"


export type CodeEditorProps = {
  instance: {[x:string]: any}
  header?: string
  mode?: string
}

export class CodeEditor extends LitElement {

  static get styles() {
    return css`

    
    :host {
      
      width: 100%; 
      height: 100%; 
      z-index: 100000; 
      overflow: scroll;
    }

    :host * {
      box-sizing: border-box;
      
    }

    :host > * {
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
    }

    h3 {
      margin: 0;
    }

    #controls {
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      padding: 10px 25px;
      z-index: 2;
    }

  button {
      margin: 0px;
      border-radius: 0px;
      border: 1px solid rgb(35,35,35);
      padding: 0px 15px;
      font-size: 60%;
  }
  
  textarea {
      border: none;
  }
  
  #editor {
      // color: transparent;
      background: transparent;
      opacity: 0.5;
      caret-color: black;
      z-index: 1;
  }
  
  
  #highlight {
      // background-color: rgba(0,0,0,0.8) !important; 
      z-index: -1 !important;
      white-space: pre !important;
      position:absolute !important;
      top: 0 !important;
      left: 0 !important;
  }
  
  #editor, #highlight {
    margin: 0px !important;
    width: 100% !important;
    height: 100% !important;
    overflow: auto !important;
    white-space: nowrap !important;
    padding: 25px !important;
    resize: none !important;
    -moz-tab-size : 4 !important;
      -o-tab-size : 4 !important;
         tab-size : 4 !important;
  }
  
  #editor, #highlight, #highlight code {
      font-size: 12px !important;
      font-family: monospace !important;
      line-height: 20pt !important;
      box-sizing: border-box !important;
  }
  

    `;
  }
    
    static get properties() {
      return {
        instance: {
          type: Object,
          reflect: true,
        },
        header: {
          type: String,
          reflect: true,
        },
        mode: {
          type: String,
          reflect: true,
        },
      };
    }

    instance: CodeEditorProps['instance']
    header: CodeEditorProps['header']
    history: any[] = []
    mode: string

    constructor(props: CodeEditorProps = {instance: {}, header: 'Object'}) {
      super();

      this.instance = props.instance ?? {}
      this.header = props.header ?? 'Object'
      this.mode = props.mode ?? 'view'

    }
    
    willUpdate(changedProps:any) {
      // console.log(changedProps)
      if (changedProps.has('instance')) {

      }
    }

    getControls = () => {

      let controls = ['Save', 'Reset', 'Close']
      // let buttonType = ['primary', 'primary', 'primary']

      return html`
      <div class="actions">
            ${controls.map((name,i) => html`<visualscript-button  size="small" @click="${() => {
              console.log('Clicked', name, i)
          }}">${name}</visualscript-button>`)}
      </div>
      `
    }

    text = (text) => {
      const highlight = this.shadowRoot.getElementById('highlight')
      if (highlight){
        const el = highlight.querySelector('code')
        let replacedText = text.replace(new RegExp("\&", "g"), "&amp").replace(new RegExp("\<", "g"), "&lt;"); // Don't Actually Create New HTML
        el.innerHTML = replacedText;
        Prism.highlightElement(el);
      }
    }

  scroll = (element) => {
    const highlight = this.shadowRoot.getElementById('highlight')
    if (highlight){
      highlight.scrollTop = element.scrollTop;
      if (highlight.scrollTop < element.scrollTop) element.scrollTop = highlight.scrollTop
      highlight.scrollLeft = element.scrollLeft;
    }
    }
  
    render() {

      const language = 'javascript'

      return html`
      <div id="controls">
        <h3>${language[0].toUpperCase() + language.slice(1)} Editor</h3>
        ${this.getControls()}
      </div>
      <div id='editorContainer' style="position: relative; width: 100%; height: 100%;">
        <textarea 
        id='editor' 
        spellcheck="false" 
        placeholder='Write your ${language} code...'
        @input="${(ev) => {
          console.error('input detected')
          this.text(ev.target.value)
          this.scroll(ev.target)
          // this.oninput(ev.target.value)
      }}"
      
      ></textarea>
        <pre id="highlight" aria-hidden="true">
            <code class="language-${language}"></code>
        </pre>
    </div>
    `
    }
  }
  
  customElements.define('visualscript-code-editor', CodeEditor);