import { AssertType } from "./types"

export const join = (...paths: string[]) => {

    const split = paths.map(path => {
        return path.split('/')
    }).flat()

    return split.join('/')

}

export const getBase = (path) => {
    return path.split('/').slice(0,-1).join('/')
}

export const dynamicImport = async (url:string, type?: AssertType) => {
    const assert:any = {}
    if (type) assert.type = type
    let imported = await import(url, {assert})
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