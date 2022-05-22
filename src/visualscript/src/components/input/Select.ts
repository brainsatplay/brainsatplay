
import { LitElement, html, css } from 'lit';
import { PersistableProps, getPersistent, setPersistent } from './persistable';


export type SelectProps = {
  label?: string;
  persist?: boolean;

  options?: (string | Option)[]
  value?: Option['value']
  onChange?: (ev: Event)=> any
}

export type Option = {
  text: string;
  value: string;
}

/* 
Largely from https://css-tricks.com/striking-a-balance-between-native-and-custom-select-elements/

Features to make the selectCustom work for mouse users.

- Toggle custom select visibility when clicking the "box"
- Update custom select value when clicking in a option
- Navigate through options when using keyboard up/down
- Pressing Enter or Space selects the current hovered option
- Close the select when clicking outside of it
- Sync both selects values when selecting a option. (native or custom)

*/

export class Select extends LitElement {

  label: SelectProps['label'];
  persist: SelectProps['persist'] = false


  optionChecked:String = "";
  optionHoveredIndex:number = -1;
  options: SelectProps['options'] = []
  value: SelectProps['value']
  onChange: SelectProps['onChange'] = () => {}

  elements:{
    elSelectNative: HTMLSelectElement
    elSelectCustom: HTMLElement
    elSelectCustomOpts: HTMLElement
    customOptsList: Element[]
  }

  optionsCount: number


  static get styles() {
    return css`

    #container { 
      position: relative;
    }

    :host * {
      box-sizing: border-box;
    }

    .selectNative, .selectCustom {
      position: relative;
      width: 100%;
      height: 50px;
      font-size: 15px;
    }

    
    .selectCustom {
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      background: white;
    }
    
    .selectNative:focus,
    .selectCustom.isActive .selectCustom-trigger {
      outline: none;
      box-shadow: white 0 0 5px 2px;
    }
    

    .select {
      position: relative;
    }
    
    .selectLabel {
      display: block;
      font-weight: bold;
      margin-bottom: 0.4rem;
    }
    
    .selectNative, .selectCustom-trigger {
      border: 1px solid #6f6f6f;
      border-radius: 0.4rem;
    }
    
    .selectNative {
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
      background-repeat: no-repeat;
      background-position-x: 100%;
      background-position-y: 0.8rem;
      padding: 0rem 0.8rem;
    }
    
    .selectCustom-trigger  > div {
      overflow: scroll;
      white-space: nowrap;
    }

    .selectCustom-trigger {
      display: flex;
      align-items: center;
      position: relative;
      padding: 0rem 0.8rem;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    
    .selectCustom-trigger::after {
      content: "▾";
      position: absolute;
      top: 0;
      line-height: 3.2rem;
      right: 0.5rem;
    }
    
    .selectCustom-trigger:hover {
      border-color: #028ee6;
    }
    
    .selectCustom-options {
      position: absolute;
      top: calc(2.8rem + 0.8rem);
      left: 0;
      width: 100%;
      border: 1px solid #6f6f6f;
      border-radius: 0.4rem;
      background-color: whitesmoke;
      box-shadow: 0 0 4px #e9e1f8;
      z-index: 1;
      padding: 0.8rem 0;
      display: none;
    }
    
    .selectCustom.isActive .selectCustom-options {
      display: block;
    }
    
    .selectCustom-option {
      position: relative;
      padding: 0.8rem;
      padding-left: 2.5rem;
      font-size: 80%;
    }

    .selectCustom-option.isHover,
    .selectCustom-option:hover {
      background-color: #1ea7fd; // contrast AA
      color: white;
      cursor: default;
    }
    
    .selectCustom-option:not(:last-of-type)::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border-bottom: 1px solid #d3d3d3;
    }
    
    .selectCustom-option.isActive::before {
      content: "✓";
      position: absolute;
      left: 0.8rem;
    }


    /* This makes the Custom Select work... 
      Issues: Doesn't work inside of another component (e.g. Control), it clicks on that instead
    @media (hover: hover) {
      
      .selectCustom {
        display: block;
      }
    
      .selectNative:focus + .selectCustom {
        display: none;
      }
    }
    */

    @media (prefers-color-scheme: dark) {
      .selectCustom {
        background: rgb(59, 59, 59);
      }

      .selectCustom-options {
        background: rgb(45, 45, 45);
      }
    }
    `;
    
  }
    
    static get properties() {
      return Object.assign({
        options: {
          type: Array,
          reflect: true
        }
      }, PersistableProps)
    }

    add = (option:Option) => {
      this.options = [...this.options, option]
    }

    openSelectCustom = () => {
    
      this.elements.elSelectCustom.classList.add("isActive");
      // Remove aria-hidden in case this was opened by a user
      // who uses AT (e.g. Screen Reader) and a mouse at the same time.
      this.elements.elSelectCustom.setAttribute("aria-hidden", 'false');

      if (this.optionChecked) {
        const optionCheckedIndex = this.elements.customOptsList.findIndex(
          (el:HTMLElement) => el.getAttribute("data-value") === this.optionChecked
        );
        this.updateCustomSelectHovered(optionCheckedIndex);
      }
    
      // Add related event listeners
      // document.addEventListener("click", this.watchClickOutside);
      document.addEventListener("keydown", this.supportKeyboardNavigation);
    }

    closeSelectCustom = () => {

      this.elements.elSelectCustom.classList.remove("isActive");
      this.elements.elSelectCustom.setAttribute("aria-hidden", 'true');
    
      this.updateCustomSelectHovered(-1);
    
      // Remove related event listeners
      // document.removeEventListener("click", this.watchClickOutside);
      document.removeEventListener("keydown", this.supportKeyboardNavigation);
    }
 

    constructor(props: SelectProps = {}) {
      super();
      this.options = props.options ?? []
      if (props.onChange) this.onChange = props.onChange
      if (props.label) this.label = props.label
      if (props.persist) this.persist = props.persist
      const val =  getPersistent(props)
      if (val) this.value = val
    }

    updateCustomSelectHovered = (newIndex) => {
  
  
      const prevOption = this.elements.elSelectCustomOpts.children[this.optionHoveredIndex];
      const option = this.elements.elSelectCustomOpts.children[newIndex];
    
      if (prevOption) {
        prevOption.classList.remove("isHover");
      }
      if (option) {
        option.classList.add("isHover");
      }
    
      this.optionHoveredIndex = newIndex;
    }
    
    updateCustomSelectChecked = (value, text?) => {

      if (this.elements) {
        if (!text) text = this.elements.elSelectCustomOpts.querySelectorAll(
          `[data-value="${value}"]`
        )[0]?.textContent;
      
        const prevValue = this.optionChecked;
      
        const elPrevOption = this.elements.elSelectCustomOpts.querySelector(
          `[data-value="${prevValue}"`
        );
        const elOption = this.elements.elSelectCustomOpts.querySelector(`[data-value="${value}"`);
      
        if (elPrevOption) {
          elPrevOption.classList.remove("isActive");
        }
      
        if (elOption) {
          elOption.classList.add("isActive");
        }
      
        const elSelectCustomBox = this.elements.elSelectCustom.children[0].children[0];
        elSelectCustomBox.textContent = text;
        this.optionChecked = value;
      }
    }
    
    watchClickOutside = (e) => {

      const didClickedOutside = !this.contains(e.target);

      if (didClickedOutside) {
        this.closeSelectCustom();
      }
    }

    supportKeyboardNavigation = (e) => {


      // TODO: Move these to globals and check existence
      // press down -> go next
      if (e.keyCode === 40 && this.optionHoveredIndex < this.optionsCount - 1) {
        let index = this.optionHoveredIndex;
        e.preventDefault(); // prevent page scrolling
        this.updateCustomSelectHovered(this.optionHoveredIndex + 1);
      }
    
      // press up -> go previous
      if (e.keyCode === 38 && this.optionHoveredIndex > 0) {
        e.preventDefault(); // prevent page scrolling
        this.updateCustomSelectHovered(this.optionHoveredIndex - 1);
      }
    
      // press Enter or space -> select the option
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
    
        const option = this.elements.elSelectCustomOpts.children[this.optionHoveredIndex];
        const value = option && option.getAttribute("data-value");
    
        if (value) {
          this.elements.elSelectNative.value = value;
          this.updateCustomSelectChecked(value, option.textContent);
        }
        this.closeSelectCustom();
      }
    
      // press ESC -> close selectCustom
      if (e.keyCode === 27) {
        this.closeSelectCustom();
      }
    }

    willUpdate(changedProps:any) {
      if (changedProps.has('value')) setPersistent(this)

      if (changedProps.has('options')) {
        const firstOption = ((this.options[0] as Option)?.value ?? this.options[0] as string)
        this.value = this.value ?? firstOption
      }
    }

    updated(changedProperties) {

      const elSelectNative = this.shadowRoot.querySelectorAll(".js-selectNative")[0] as HTMLSelectElement
      const elSelectCustom = this.shadowRoot.querySelectorAll(".js-selectCustom")[0] as HTMLElement
      const elSelectCustomOpts = elSelectCustom.children[1] as HTMLElement;
      const customOptsList = Array.from(elSelectCustomOpts.children)
      this.optionsCount = customOptsList.length;
    
      this.elements = {
        elSelectNative,
        elSelectCustom,
        elSelectCustomOpts,
        customOptsList,
      }


      if (this.value) this.updateCustomSelectChecked(this.value);
       
    }
    
    
    render() {

      return html`
      <div id=container>
      <select class="selectNative js-selectNative" aria-labelledby="${this.label}Label" 
      @change=${(e) => {

          // Update selectCustom value when selectNative is changed.
          const value = e.target.value;
          const elRespectiveCustomOption = this.elements.elSelectCustomOpts.querySelectorAll(
            `[data-value="${value}"]`
          )[0];
          this.updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);

          // Original
          this.value = e.target.value
          this.onChange(e) // forward change
      }}>
      ${(this.options.length === 0) ? html`<slot></slot>` : this.options.map((o, i) => {
        if (typeof o != 'object') o = {value: o, text: o}
        return html`<option 
          value=${o.value} 
          ?selected=${(o.value === this.value)} 
          >
            ${o.text}
          </option>`
      })}
    </select>

    <div class="selectCustom js-selectCustom" aria-hidden="true"}>
      <div class="selectCustom-trigger" @click=${(e) => {

        const isClosed = !e.target.parentNode.classList.contains("isActive");

        if (isClosed) {
          this.openSelectCustom();
        } else {
          this.closeSelectCustom();
        }
      }}>
        <div></div>
      </div>
        <div class="selectCustom-options">
        ${this.options.map((o, i) => {
          if (typeof o != 'object') o = {value: o, text: o}
          return html` <div 
          class="selectCustom-option" 
          data-value=${o.value}
          @mouseenter=${(e) => {
            this.updateCustomSelectHovered(i);
          }}
          @click=${(e) => {
            const value = e.target.getAttribute("data-value");
            // Sync native select to have the same value
            this.elements.elSelectNative.value = value;
            this.updateCustomSelectChecked(value, e.target.textContent);
            this.closeSelectCustom();
          }}
          >
            ${o.text}
          </div>`
        })}
          </div>
        </div>
      </div>
    </div>
    `
    }
  }
  
  customElements.define('visualscript-select', Select);