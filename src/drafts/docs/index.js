import DocsGenerator from './src/index.js'
const docs = new DocsGenerator({
    inDir: 'example', 
    outDir: 'build'
})
docs.generate()
