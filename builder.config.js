// ./builder.config.js
const builder = require('build-dev')

function run([type]) {
    switch (type) {

        case 'run:nodejs2':
            return builder.runNodejs({
                entryFile: './examples/server/server2', 
            });
            
        case 'run:nodejs':
            return builder.runNodejs({
                entryFile: './examples/server/server1', 
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