import fs from 'fs'
import path from 'path'
import process from 'process'

import showdown from 'showdown'

// This class manages all documentation generation for @brainsatplay/docs
class DocsGenerator {
    info = {}
    converter = new showdown.Converter();

    constructor(info= {}) {
        this.info = info
        if (!this.info.inDir) this.info.inDir = 'docs'
        if (!this.info.outDir) this.info.outDir = 'build'
    }

    generate = async (input=this.info.inDir, output=this.info.outDir) => {
        const base = process.cwd()
        const inputBase = path.join(base, input)
        const results = await this.list(inputBase);

        for (let file in results) {
            let ext = path.extname(file)
            if (file.includes('.wasl.json')) ext = '.wasl' // recognize .wasl.json files

            const notCommon = file.replace(inputBase, '')

            // Deal with Different File Types
            switch(ext) {
                case '.md': 
                    const html = this.converter.makeHtml(results[file]);
                    const newUnique = notCommon.replace('.md', '.html')
                    const newPath = path.join(base, output, newUnique)
                    this.check(newPath)
                    fs.appendFileSync(newPath, html);
                    break;
                case '.wasl': 
                    console.log(`Generate HTML for wasl file (${notCommon})...`);
                    break;
                default: 
                    console.warn(`Can't handle`, notCommon)
                    break;

            }
        }

    }

    check = (filePath) => {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
          return true;
        }
        this.check(dirname);
        fs.mkdirSync(dirname);
      }

    save(path, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err) return reject(err);
                return resolve();
            });
        })
    };

    list = (dir) => {

        return new Promise((resolve, reject) => {
        var results = {};
        fs.readdir(dir, (err, list)  => {
            if (err) return reject(err);
            var pending = list.length;
            if (!pending) return resolve(results);
            list.forEach((file) => {
                file = path.resolve(dir, file);
            fs.stat(file, async (err, stat) => {
                if (stat && stat.isDirectory()) {
                const res = await this.list(file);
                results = Object.assign(results, res)
                if (!--pending) resolve(results);
                } else {
                results[file] = fs.readFileSync(file).toString()
                if (!--pending) resolve(results);
                }
            });
            });
        });
    })
    };
}

export default DocsGenerator