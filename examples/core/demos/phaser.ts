import appInfo from '../../../../phaser/index.wasl.json' assert {type: "json"}
import phaserInfo from '../../../../phaser/src/index.wasl.json' assert {type: "json"}

import mainPkg from '../../../../phaser/package.json'  assert {type: "json"}
import phaserPkg from '../../../../phaser/src/package.json'  assert {type: "json"}
import * as game from  '../../../../phaser/src/plugins/game/index.js'
import * as cursors from  '../../../../phaser/src/plugins/cursors/index.js'
import * as player from  '../../../../phaser/src/plugins/player/index.js'

import * as create from  '../../../../phaser/scripts/create.js'
import * as createMain from  '../../../../phaser/scripts/player/create/main.js'
import * as createCompanion from  '../../../../phaser/scripts/player/create/companion.js'

import * as updatePlayer from  '../../../../phaser/scripts/player/update.js'

const options = {
    relativeTo: import.meta.url,
    filesystem: {
        'package.json': mainPkg,
        'src/package.json': phaserPkg,
        'src/index.wasl.json': phaserInfo,
        'src/plugins/game/index.js': game,
        'src/plugins/player/index.js': player,
        'src/plugins/cursors/index.js': cursors,
        'scripts/create.js': create,
        'src/scripts/player/create/main.js': createMain,
        'src/scripts/player/create/companion.js': createCompanion,
        'src/scripts/player/update.js': updatePlayer,
    }
}

export {
    appInfo,
    options
}