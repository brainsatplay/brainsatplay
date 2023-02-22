
// import * as esm from 'esmpile'

import HTMLParser from 'node-html-parser'

const regex = /<([^\s]*)[\s]+([^>]+)?>([^<]*)<\/([^\s]*)>/gm
// ------------------------------ HTML Helper Functions ------------------------------
export function html(text, outputType='object') {

    HTMLParser.parse(text)

    if (typeof json !== 'string') text = text.toString();

    const parsed = HTMLParser.parse(text)

    const handler = (el, parent={}) => {

        const ignore = ['id']
                
        if (el.childNodes) {

            const info = parent[el.id] = {}
            info.tagName = el.rawTagName
            let attrs = {}
            for (let key in el.attributes) {
                if (!ignore.includes(key)) attrs[key] = el.attributes[key]
            }

            if (Object.keys(attrs).length) info.attributes = attrs
            
            if (el.childNodes.length) handleChildNodes(el, info)
        }
    }

    const handleChildNodes = (el, parent={}) => {
        el.childNodes.forEach(o => {
            if (o.constructor.name === 'HTMLElement') {
                if (!parent.components) parent.components = {}
                handler(o, parent.components)
            }
            else {
                if (!o.isWhitespace) {
                    if (!parent.attributes) parent.attributes = {}
                    parent.attributes.innerHTML = o.rawText // Setting 
                }
            }
        })
        return parent
    }

   const object = handleChildNodes(parsed) // First element is always just a container...

   if (outputType === 'text') return JSON.stringify(object, null, 2)
   else return object
}

