import { LitElement, html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map.js";
import { getPersistent, setPersistent, PersistableProps } from './persistable';

export interface InputProps {
    value?: string;
    outline?: boolean;
    disabled?: boolean;
    type?: string;
    label?: string;
    persist?: boolean;
  }

export class Input extends LitElement {

    value: InputProps['value']
    outline: InputProps['outline']
    disabled: InputProps['disabled']
    type: InputProps['type']
    label: InputProps['label']
    persist: InputProps['persist']

    // properties getter
    static get properties() {
        return Object.assign(PersistableProps, {
            disabled: { type: Boolean, reflect: true },
            outline: { type: Boolean, reflect: true }
        });
    }
    constructor(props:InputProps = {}) {
        super();
        this.value = props.value ?? "";
        this.outline = props.outline ?? false;
        this.disabled = props.disabled ?? false;
        this.label = props.label;
        this.persist = props.persist;

        const val =  getPersistent(props)
        if (val) this.value = val
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('value')) setPersistent(this)
    }

    static get styles() {
        return css`

        :host {
            width: 100%;
        }
*{
box-sizing: border-box;
}
.form-group {
position: relative;
margin: 1rem 0;
}
input.outline {
border: 1px solid  #333333;
border-radius: 5px;
}
label {
position: absolute;
font-size: 1rem;
left: 0;
top: 50%;
transform: translateY(-50%);
color: gray;
padding: 0 0.3rem;
margin: 0 0.5rem;
transition: 0.1s ease-out;
transform-origin: left top;
pointer-events: none;
}
input {
font-size: 1rem;
outline: none;
border: none;
border-radius: 0px;
padding: 1rem 0.6rem;
transition: 0.1s ease-out;
border-bottom: 1px solid  #333333;
background: transparent;
cursor: text;
margin-left: auto;
width: 95%;
margin-right: auto;
}
input::placeholder {
    color: transparent;
}
input:focus{
border-color:  #b949d5;
}
input:focus + label{
color:  #b949d5;
top: 0;
transform: translateY(-50%) scale(0.9);
}
input:not(:placeholder-shown) + label{
top: 0;
transform: translateY(-50%) scale(0.9);
}
input:focus:not(.outline) ~ label,
input:not(:placeholder-shown):not(.outline) ~ label
{
padding-left: 0px;
}
input:disabled,  input:disabled ~ .label {
opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
    label {
      color: rgb(120,120,120);
    }
  }
`;
    }
    render() {

        return html`
            <div class="form-group">
                <input
                class=${classMap({
                            outline: this.outline
                        })}
                type="${this.type}"
                placeholder="${this.label}"
                .value=${(this.value != 'null' && this.value != 'undefined') ? this.value : ''}
                ?disabled="${this.disabled}"

                @change=${(ev) => {
                    this.value = ev.target.value
                }}
                />
                <label>${this.label}</label>
            </div>
        `;
    }
}

customElements.define("visualscript-input", Input);
