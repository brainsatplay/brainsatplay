
// import * as esm from 'esmpile'

// ------------------------------ HTML Helper Functions ------------------------------
function updateKey(key) {
    let newK = key
    const match = newK.match(/[A-Z][a-z]/g);
    // name = name.split(/(?=[A-Z][a-z])/).map(str => str.toLowerCase()).join(' ') // Split on Capital Letters (but not acronyms)

    if (match) match.forEach(str => newK = newK.replace(str, `-${str.toLowerCase()}`))
    return newK
}

function getAttributes(obj, opts, path=[]) {
    const acc = {}
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            const res = getAttributes(obj[key], opts, [...path, key])
            for (let k in res) {
                acc[updateKey(k)] = res[k]
            }
        }
        else {
            const updatedKey = updateKey(key)
            const updatedVal = obj[key] // (catchKeys[key] instanceof Function) ? catchKeys[key](obj[key], opts): obj[key]
            acc[(path.length) ? `${path.join('.')}.${updatedKey}` : updatedKey] = updatedVal
        }
    }
    return acc
}


let catchKeys = {
    src: (val, opts) => {
        let isRemote = false
        try {
            new URL(val)
            isRemote = true
        } catch {}

        const url = (isRemote) ? val : esm.resolve(val, opts.path ?? '')

        return url
    }
}

function handleComponents(name, parentObject, parent, opts) {
    const attrs = getAttributes(parentObject[name], opts)
    const el = document.createElement(attrs['tag-name'] ?? 'div')
    el.id = name
    parent.appendChild(el)
    for (let key in attrs) {
        el.setAttribute(key, attrs[key])
    }
    toHTMLElement(parentObject[name], opts, el)
}

// ------------------------------ HTML Core Functions ------------------------------
export function wasl(json) {

    if (typeof json === 'string' || json.constructor.name === 'Buffer') json = JSON.parse(json);

    const drill = (object, acc='') => {
        
        for (let name in object.components) {
            const component = object.components[name];
            const tag = component.tagName
            console.log(tag)

            const content = (component.components) ? drill(component) : ''
            console.log(content)

            if (tag) {

                let inner = ''
                const attributes = []
                for (let attr in component.attributes) {
                    const key = updateKey(attr)
                    const val = component.attributes[attr]
                    if (key === 'innerText') inner = val
                    else if (key === 'innerHTML') inner = val
                    else attributes.push(`${key}="${val}"`)
                }

                const attrText = (attributes.length) ? ` ${attributes.join(' ')}` : ''
                inner = content ? `\n\t${content}\n` : inner

                acc += `<${tag} id=${name}${attrText}>${inner ? `${inner}` : ''}</${tag}>`
            }
        }

        return acc
    }

    return drill(json)
}

export function toHTMLElement(wasl, opts, parent) {
    if (!parent) parent = opts.parentNode ?? document.body // set first parent with options...
    for (let key in wasl) {
        if (key === 'components') {
            for (let name in wasl[key]) handleComponents(name, wasl[key], parent, opts)
        }
    }

    return parent
}


export function fromHTMLElement(element, options) {

    options.parentNode = element

    const ref = {components:{}}
    const toIgnore = ['id']
    const drill = (el, ref) => {
        if (ref.components){

            for (let child of el.children) {
                // Include a reference to the relevant element
                const childRef = ref.components[child.id] = {element: child}
                if (child.children.length > 0) childRef.components = {}
                
                // Iterate through attributes
                for(let attribute of child.attributes) {
                    if (!toIgnore.includes(attribute.name)) {
                        const split = attribute.name.split('.')
                        let target = childRef
                        split.forEach((substr,i) => {

                            // capitalize first letter after dash
                            substr = substr.split('-').map((str, i) => {
                                if (i > 0) return str[0].toUpperCase() + str.slice(1)
                                else return str
                            }).join('')
                            
                            // set or keep drilling
                            if (i === split.length - 1) {
                                const val = attribute.value

                                // TODO: Convert between strings and more variables... 
                                if (val !== '') {
                                    if (!isNaN(val)) target[substr] = Number(val) // get numbers
                                    else target[substr] = val // get strings

                                } 
                                
                                // Default to True
                                else target[substr] = true
                            }
                            else {
                                if (!target[substr]) target[substr] = {}
                                target = target[substr]
                            }
                        })
                    }
                }
                drill(child, childRef)
            }
        }
    }

    drill(element, ref)

    return ref
}