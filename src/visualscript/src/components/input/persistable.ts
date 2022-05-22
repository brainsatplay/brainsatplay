export const PersistableProps = {
    label: {
      type: String,
      reflect: true
    },
    persist: {
      type: Boolean,
      reflect: true
    },
    value: {
      type: String,
       reflect: true
    },
    onChange: {
        type: Function,
       reflect: true
    }
  }

  export const setPersistent = (o) => {
  if (o.persist &&  o.label) localStorage.setItem(o.label, String(o.value));
}

export const getPersistent = (props) => {
  if (props.value) return props.value
  else if (props.persist && props.label){
      const val = localStorage.getItem(props.label)
    if (val === 'null') return null
    else if (val === 'undefined') return undefined
    else return val
  }
}
