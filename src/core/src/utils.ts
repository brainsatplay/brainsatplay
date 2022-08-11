import { AssertType } from "./types"

export const join = (...paths: string[]) => {

    const split = paths.map(path => {
        return path.split('/')
    }).flat()

    return split.reduce((a,b) => {
        if (!a) a = b
        else if (!b) return a
        else if (a.split('/')[0] !== b)  a = a + '/' + b

        return a 
    }, '')

}

export const isMetadata = (info) => {
    return 'graph' in info && 'nodes' in info.graph
}

export const isWASL = (path) => {
    return path.slice(-5) === '.wasl'
}

export const getBase = (path) => {
    return path.split('/').slice(0,-1).join('/')
}

export const dynamicImport = async (url:string, type?: AssertType) => {
    // if (type) assert.type = type
    // let imported = await import(url, {assert})

    let imported;
    if (!type){
        imported = await import(url) 
    } else {
        imported = await import(url, {assert: {type: 'json'}})
    }

    if (imported.default) imported = imported.default
    return imported
}

export const importFromOrigin = async (url, scriptLocation, local=true, type?:AssertType) => {

    // Import the Module
    let imported = null
    if (local) {
        // Remap URL to absolute path
        const extraPath = scriptLocation.replace(window.origin, '').split('/')
        url = [...extraPath.map(e => '..'), ...url.split('/')].join('/')
        imported = await dynamicImport(url, type)
    } else imported = await fetch(url).then(res => {
        if (res.ok) return res[type ?? 'text']()
        else return
    })

    return imported
}