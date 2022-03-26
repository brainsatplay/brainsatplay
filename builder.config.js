// ./builder.config.js
const builder = require('build-dev')

function run([type]) {
    switch (type) {

        case 'run:nodejs2':
            return builder.runNodejs({
                entryFile: './src/server2', 
            });
            
        case 'run:nodejs':
            return builder.runNodejs({
                entryFile: './src/server1', 
                watchDirs: ['src', 'examples'],
                nodeArgs: ['development'],
            });

        case 'run':
            run(['run:nodejs'])
            run(['run:nodejs2'])
            break;

        default:
            throw new Error(`"${type}" not implemented`);
    }
}

run(process.argv.slice(2));