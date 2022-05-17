import { LitElement, html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map.js";

export interface InputProps {
    value?: string;
    outline?: boolean;
    disabled?: boolean;
    type?: string;
    label?: string;
  }

class Input extends LitElement {

    value: InputProps['value']
    outline: InputProps['outline']
    disabled: InputProps['disabled']
    type: InputProps['type']
    label: InputProps['label']

    // properties getter
    static get properties() {
        return {
            type: { type: String },
            label: { type: String },
            value: { type: String },
            disabled: { type: Boolean },
            outline: { type: Boolean }
        };
    }
    constructor(props:InputProps = {}) {
        super();
        // initialize the properties
        this.value = props.value ?? "";
        this.outline = props.outline ?? false;
        this.disabled = props.outline ?? false;
    }
    //
    static get styles() {
        return css`
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
background-color:  #fff;
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
color:  #333333;
transition: 0.1s ease-out;
border-bottom: 1px solid  #333333;
background: transparent;
cursor: text;
margin-left: auto;
width: 95%;
margin-right: auto;
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
                placeholder=" "
                .value=${this.value}
                ?disabled="${this.disabled}"
                />
                <label>${this.label}</label>
            </div>
        `;
    }
}

customElements.define("visualscript-input", Input);
