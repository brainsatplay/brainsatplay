import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'extra-small' | 'small' | 'medium' | 'large';
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export class Button extends LitElement {

  static get styles() {
    return css`

    .storybook-button {
      font-family: sans-serif;
      font-weight: 700;
      border: 0;
      border-radius: 1em;
      cursor: pointer;
      display: inline-block;
      line-height: 1;
    }
    .storybook-button--primary {
      color: white;
      background-color: #1ea7fd;
    }
    .storybook-button--secondary {
      color: #333;
      background-color: transparent;
      box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
    }
    .storybook-button--extra-small {
      font-size: 10px;
      padding: 7px 12px;
    }

    .storybook-button--small {
      font-size: 12px;
      padding: 10px 16px;
    }
    .storybook-button--medium {
      font-size: 14px;
      padding: 11px 20px;
    }
    .storybook-button--large {
      font-size: 16px;
      padding: 12px 24px;
    }

    `;
  }
    
    static get properties() {
      return {
        primary:  {
          type: Boolean,
          reflect: true
        },
        backgroundColor:  {
          type: String,
          reflect: true
        },
        size:  {
          type: String,
          reflect: true
        },
        onClick: {
          type: Function,
          reflect: true
        }
      };
    }

    primary: ButtonProps['primary']
    backgroundColor: ButtonProps['backgroundColor']
    size: ButtonProps['size']
    onClick: ButtonProps['onClick']

    constructor(props: ButtonProps = {}) {
      super();

      this.primary = props.primary
      this.backgroundColor = props.backgroundColor
      this.size = props.size
      this.onClick = props.onClick

    }
    
    willUpdate(_:any) {
      // console.log(changedProps)
      // if (changedProps.has('type')) {

      // }
    }
  
    render() {

      const mode = (this.primary) ? 'storybook-button--primary' : 'storybook-button--secondary';

      return html`
      <button
           type="button"
            class=${['storybook-button', `storybook-button--${this.size || 'medium'}`, mode].join(' ')}
            style=${styleMap({ backgroundColor: this.backgroundColor })}
            @click=${this.onClick}
      >
        <slot>Button</slot>
      </button>
    `
    }
  }
  
  customElements.define('brainsatplay-button', Button);