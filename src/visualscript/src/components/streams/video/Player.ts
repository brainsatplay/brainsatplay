import {LitElement, css, } from 'lit';

export type PlayerProps = {
  source?: MediaStream;
  autoplay?: boolean;
  controls?: boolean;
}

export class Player extends LitElement {

    static get styles() {
      return css`

      video {
        width: 100%;
      }

      `;
    }
    
    static get properties() {
      return {
        source: {
          converter: {
            toAttribute(value:any) {
              return value;
            },
    
            fromAttribute(value:any) {
              return value;
            }
          }
        },
        autoplay: {type: Boolean},
        controls: {type: Boolean}
      };
    }

    source?: MediaStream
    autoplay?: boolean
    controls?: boolean

    constructor(props: PlayerProps = {}) {
      super();
      this.source = props.source 
      this.autoplay = props.autoplay 
      this.controls = props.controls 

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('volume')) {
      //     // const oldValue = changedProps.get('volume');
      //     if (!this.volume || this.volume < 0) this.volume = 0
      //     else if (this.volume > 1) this.volume = 1
      // }
    }
  
    render() {

      let video = document.createElement('video')

      // Live Input | NOTE: Not Working in Storybook
      if (typeof this.source === 'object') video.srcObject = this.source
      
      // Video Source
      else {
        if (this.source) {
          const source = document.createElement('source')
          source.src = this.source
          video.insertAdjacentElement('beforeend', source)
        }
      }

      if (this.autoplay) video.autoplay = this.autoplay
      if (this.controls) video.controls = this.controls

      return video
    }
  }
  
  customElements.define('brainsatplay-video-player', Player);