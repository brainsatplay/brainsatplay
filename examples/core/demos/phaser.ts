import appInfo from '../../../../htil/content/phaser/index.wasl.json' assert {type: "json"}
import phaserInfo from '../../../../htil/plugins/phaser/index.wasl.json' assert {type: "json"}

import mainPkg from '../../../../htil/content/phaser/package.json'  assert {type: "json"}
import phaserPkg from '../../../../htil/plugins/phaser/package.json'  assert {type: "json"}
import * as phaser from  '../../../../htil/plugins/phaser/plugins/phaser/index.js'
import * as config from  '../../../../htil/plugins/phaser/plugins/config/index.js'
import * as game from  '../../../../htil/plugins/phaser/plugins/game/index.js'

const options = {
    filesystem: {
        'package.json': mainPkg,
        'plugins/phaser/package.json': phaserPkg,
        'plugins/phaser/index.wasl.json': phaserInfo,
        'plugins/phaser/plugins/phaser/index.js': phaser,
        'plugins/phaser/plugins/config/index.js': config,
        'plugins/phaser/plugins/game/index.js': game
    }
}

export {
    appInfo,
    options
}