import { LitElement, html, css } from 'lit';

export interface ModalProps {
  open?: boolean;
  header?: string;
  footer?: string;

  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export class Modal extends LitElement {

  static get styles() {
    return css`
/* Modal Header */

  :host {
    font-family: sans-serif;
  }
  
  :host * {
    box-sizing: border-box;
    font-color: #424242;
  }

.modal-header {
  padding: 12px 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid #e3e3e3;
}

.modal-header span {
  font-weight: 800;
  font-size: 120%;
}


/* Modal Body */
.modal-body {
  padding: 16px;
  overflow: scroll;
  width: 100%;
  flex-grow: 1;
}

/* Modal Footer */
.modal-footer {
  border-top: 1px solid #e3e3e3;
  padding: 12px 16px;
  width: 100%;
}

.modal-footer span {
  font-size: 80%;
}

/* Modal Content */
.modal-content {
  font-family: sans-serif;
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);

  background-color: #fefefe;
  margin: auto;
  border-radius: 4px;
  padding: 0;
  width: 80vw;
  height: 80vh;
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 20%);
  transition: opacity 0.5s;
  display: flex; 
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
}

.modal-content.closed {
  opacity: 0;
}

.modal-content.open {
  opacity: 1;
}

    `;
  }
    
    static get properties() {
      return {
        open:  {
          type: Boolean,
          reflect: true
        },
         header:  {
          type: String,
          reflect: true
        },
         footer:  {
          type: String,
          reflect: true
        },
      };
    }

    open: ModalProps['open']
    header: ModalProps['header']
    footer: ModalProps['footer']

    backgroundColor: ModalProps['backgroundColor']
    size: ModalProps['size']

    constructor(props: ModalProps = {}) {
      super();

      this.open = props.open
      this.header = props.header
      this.footer = props.footer

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('type')) {

      // }
    }

    toggle = () => this.open = !this.open

    render() {


      return html`
      <div class="modal-content ${this.open ? 'open' : 'closed'}">
        ${(this.header) ? html`<div class="modal-header">
          <span>${this.header}</span>
          <brainsatplay-button secondary size="extra-small" class="close" @click="${this.toggle}">Close</brainsatplay-button>
        </div>` : ''}
        <div class="modal-body">
          <slot>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas fringilla dolor vitae hendrerit feugiat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer ultricies arcu nec nibh commodo aliquam at in felis. Mauris lorem dui, porttitor et lectus vel, ornare sodales risus. Sed eu rhoncus ex. Donec tristique nibh lacus, sed dictum lacus lacinia eu. Nunc imperdiet a ante et feugiat. Praesent euismod tortor lacus, et euismod turpis mollis vitae. Etiam sagittis vehicula pulvinar. Aliquam id tincidunt tortor, sed feugiat nulla. Donec sollicitudin tincidunt viverra. Nunc condimentum molestie massa a feugiat. Nam mattis bibendum sodales. Nulla at maximus arcu, quis tempus lacus.

Vestibulum pharetra pretium neque eu faucibus. Morbi aliquam urna non lacinia congue. Donec sed odio interdum, imperdiet tellus in, porttitor erat. Mauris erat velit, facilisis ut luctus sit amet, laoreet vitae ligula. Morbi a mi ultrices, feugiat ante in, convallis enim. Etiam sollicitudin leo purus, ut commodo ex placerat et. Proin ut nulla non risus luctus eleifend eu id orci.

Ut aliquam tristique massa. Nullam a ipsum tincidunt, malesuada ipsum non, suscipit lectus. Suspendisse sit amet risus ut lectus efficitur feugiat in ut urna. Suspendisse odio felis, efficitur eu molestie eu, malesuada nec nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque fermentum sit amet odio id convallis. Donec luctus risus ac pretium ultrices. Quisque congue velit sed hendrerit posuere. Integer dictum felis eu tortor mattis scelerisque. Fusce facilisis justo nec velit vehicula gravida sit amet at erat. Suspendisse sit amet nibh metus. Aenean euismod, tortor a venenatis laoreet, sapien arcu semper turpis, non molestie risus ligula nec velit.

Nulla eget ultrices justo, non posuere dui. Praesent ultrices dui eget erat accumsan varius. Ut ut mi arcu. Integer porttitor, neque vitae fermentum dictum, tellus quam tincidunt mauris, eget tristique turpis mauris nec magna. Phasellus ut tortor eros. Ut vehicula non purus in efficitur. Quisque justo elit, varius id luctus et, pulvinar eget ipsum. Sed tristique et odio eu facilisis.

Phasellus sodales eros at erat elementum, a semper ligula facilisis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi at maximus nunc. In porttitor rutrum rhoncus. Ut dignissim viverra erat in aliquet. Suspendisse potenti. Donec lorem sem, vulputate non diam a, facilisis luctus tortor. In pellentesque ut eros id vulputate. Proin rutrum tincidunt libero, vel dictum libero ullamcorper in. Nam nec ultricies tortor, sit amet pellentesque ante. Sed tellus purus, pharetra vitae purus quis, accumsan vestibulum tellus. Vivamus porttitor urna a odio tincidunt tristique. Integer ut metus finibus, ultricies magna sed, congue eros. Duis velit velit, consectetur at faucibus ac, scelerisque nec diam.
</slot>
        </div>
        ${(this.footer) ? html`<div class="modal-footer">
          <span>${this.footer}</span>
        </div>` : ''}
      </div>
    `
    }
  }
  
  customElements.define('brainsatplay-modal', Modal);