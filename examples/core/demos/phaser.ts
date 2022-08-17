import appInfo from '../../../../phaser/index.wasl.json' assert {type: "json"}
import phaserInfo from '../../../../phaser/src/index.wasl.json' assert {type: "json"}

import mainPkg from '../../../../phaser/package.json'  assert {type: "json"}
import phaserPkg from '../../../../phaser/src/package.json'  assert {type: "json"}
import * as phaser from  '../../../../phaser/src/components/phaser/index.js'
import * as config from  '../../../../phaser/src/components/config/index.js'
import * as game from  '../../../../phaser/src/components/game/index.js'


import * as update from  '../../../../phaser/scripts/update.js'
import * as preload from  '../../../../phaser/scripts/preload.js'
import * as create from  '../../../../phaser/scripts/create.js'

const path = '../../../../phaser/index.wasl.json'

const options = {
    relativeTo: import.meta.url,
    filesystem: {
        'package.json': mainPkg,
        'src/package.json': phaserPkg,
        'src/index.wasl.json': phaserInfo,
        'src/components/phaser/index.js': phaser,
        'src/components/config/index.js': config,
        'src/components/game/index.js': game,
        'scripts/preload.js': preload,
        'scripts/update.js': update,
        'scripts/create.js': create
    }
}

export {
    path,
    appInfo,
    options
}