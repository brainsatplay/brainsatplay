
import { addDocs, addFrontend, addBackend } from '../add/index.js'
import { updatePackage } from '../../utils/package.js'

const generateSrc = (options) => {
    return new Promise(async (resolve, reject) => {
        Promise.all([addFrontend(options), addBackend(options)]).then(res => {
            resolve(true)
        }).catch(err => {
            reject(err)
        })
    })
}

export const app = (options) => {
    return new Promise(async (resolve, reject) => {
        await updatePackage('./', options)
        await generateSrc(options)
        resolve(true)
    })
}

export const device = (options) => {
    return new Promise(async (resolve, reject) => {
        await updatePackage('./', options)
        await generateSrc(options)
        resolve(true)
    })
}

export const extension = (options) => {
    return new Promise(async (resolve, reject) => {
        await updatePackage('./', options)
        await generateSrc(options)
        resolve(true)
    })
}

export const library = (options) => {

    const fileContents = `console.log('Hello world')`

    return new Promise(async (resolve, reject) => {

        await updatePackage('./', options)
        Promise.all([addDocs(options), generateSrc(options)]).then(res => {
            resolve(true)
        }).catch(err => {
            reject(err)
        })

        // fs.writeFile(path.join(basePath, 'library.js'), fileContents, (err) => {
        //     if (err) reject('Files not addd.')
        //     else resolve(true)
        // })
    })

}

export const plugin = () => {
    return new Promise(async (resolve, reject) => {
        await updatePackage('./', options)
        await generateSrc(options)
        resolve(true)
    })
}