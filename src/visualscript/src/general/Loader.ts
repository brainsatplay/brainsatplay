// Note: Inspired by the Red Hat website https://www.redhat.com/en

import { LitElement, html, css } from 'lit';

export type LoaderProps = {
  progress?: number;
  text?: string;
  color?: string;
  background?: string;
  textBackground?: string;
  textColor?: string;
  type?: 'default' | 'linear';
  showPercent?: boolean;
  size?: string;
}

export class Loader extends LitElement {

  static get styles() {
    return css`
    
    :host {
      font-family: sans-serif;
    }

    #container {  
      width: 100%;
    }

    #indicator { 
      width: 100%;
      overflow: hidden;
      animate: 0.5s;
      opacity: 0.7;
    }

    #indicator > div {
      width: 100%;
      height: 100%;
    }

    #linear-text {  
      padding: 10px 15px;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      font-size: 75%;
      background: white;
    }

    .loader-container {
      width: 80px;
      height: 80px;
      position: relative;
      color: #5b5b5b;
    }

    .loader {
      width: 100%;
      height: 100%;
      border: 4px solid;
      background: white;
      border-right: none;
      border-top: none;
      border-left: none;
      z-index: 2000;
      background-color: transparent;
      border-radius: 100%;
      transform: rotateZ(0);
    }

    .loader-container > span{
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 80%;
      transform: translate(-50%, -50%);
      user-select: none;
    }

    .loader.active {
      opacity: 0.45;
      -webkit-animation: spin 2s linear infinite;
      animation: spin 2s linear infinite;
    }

    /* @-moz-keyframes spin {  . . . } */
    
    
    /* @-ms-keyframes spin {  . . . } */
    
    
    /* @-o-keyframes spin { . . . } */
    
    @-webkit-keyframes spin {
      from {
        transform: rotateZ(0deg) scale(1);
      }
      50% {
        transform: rotateZ(540deg) scale(0.9);
        filter: brightness(50%);        
      }
      to {
        transform: rotateZ(1080deg) scale(1);
      }
    }
    
    @keyframes spin {
      from {
        transform: rotateZ(0deg) scale(1);
      }
      50% {
        transform: rotateZ(540deg) scale(0.9);
        filter: brightness(50%);
      }
      to {
        transform: rotateZ(1080deg) scale(1);
      }
    }
    `;
  }
    
    static get properties() {
      return {
        progress: {
          type:Number,
          reflect: true,
        },
        text: {
          type: String,
          reflect: true,
        },
        type: {
          type: String,
          reflect: true,
        },
        color: {
          type: String,
          reflect: true,
        },
        background: {
          type: String,
          reflect: true,
        },
        textBackground: {
          type: String,
          reflect: true,
        },
        textColor: {
          type: String,
          reflect: true,
        },
        size: {
          type: String,
          reflect: true,
        },
      };
    }

    progress: LoaderProps['progress']
    color: LoaderProps['color']
    background: LoaderProps['background']
    type: LoaderProps['type']
    showPercent: LoaderProps['showPercent']
    text: LoaderProps['text']
    textColor: LoaderProps['textColor']
    textBackground: LoaderProps['textBackground']
    size: LoaderProps['size']

    constructor(props: LoaderProps = {}) {
      super();

      this.progress = props.progress
      this.color = props.color
      this.background = props.background ?? '#f3f3f3'
      this.type = props.type ?? 'default'
      this.showPercent = props.showPercent ?? true
      this.text = props.text
      this.textBackground = props.textBackground
      this.textColor = props.textColor
      this.size = props.size ?? '13px'

      // Conditionally change default color
      if (!this.color){
        if (this.type === 'default') this.color = 'blue'
        else this.color = '#7aff80'
      }

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('type')) {

      // }
    }

    render() {

      const progress = this.progress ?? 0

      const text = (this.text != undefined) ? this.text : (this.showPercent) ? `${(progress*100).toFixed(1)}%` : ''

        switch (this.type){
          case 'linear':
            return html`
            ${ (text) ? html`<div id="linear-text" style="background: ${this.textBackground}; color: ${this.textColor};">${text}</div>` : ''}
            <div id="indicator" style="height:${this.size}; background:${this.background}; opacity:${(progress === 1) ? 1 : ''};">
                <div style="width:${progress * 100}%; background: ${this.color}"></div>
              </div>
            `

          default: 
            // if (progress < 1) 
            return html`
            <div class="loader-container" style="height:${this.size}; width:${this.size}; background: ${this.textBackground};">
              ${ (text) ? html`<span style="color: ${this.textColor};">${text}</span>` : ''}
              <div class="loader active" style="border-color: ${this.color};"></div>
            </div>
            `
        }

  }

  }
  
  customElements.define('brainsatplay-loader', Loader);