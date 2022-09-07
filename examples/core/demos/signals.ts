import appInfo from '../../../../htil/content/signals/index.wasl.json' assert {type: "json"}
import dataInfo from '../../../../htil/plugins/datastreams/index.wasl.json' assert {type: "json"}
import mainPkg from '../../../../htil/content/signals/package.json'  assert {type: "json"}
import dataPkg from '../../../../htil/plugins/datastreams/package.json'  assert {type: "json"}
import * as button from  '../../../../htil/plugins/ui/button/index.js'
import * as display from '../../../../htil/plugins/ui/display/index.js'
import * as synthetic from '../../../../htil/plugins/devices/synthetic/index.js'
import * as muse from '../../../../htil/plugins/devices/muse/index.js'
import * as ganglion from '../../../../htil/plugins/devices/ganglion/index.js'
import * as start from '../../../../htil/plugins/datastreams/plugins/start/index.js'

const options = {
    filesystem: {
        'package.json': mainPkg,
        'plugins/ui/button/index.js': button,
        'plugins/ui/display/index.js': display,
        'plugins/devices/synthetic/index.js': synthetic,
        'plugins/devices/muse/index.js': muse,
        'plugins/devices/ganglion/index.js': ganglion,
        'plugins/datastreams/package.json': dataPkg,
        'plugins/datastreams/index.wasl.json': dataInfo,
        'plugins/datastreams/plugins/start/index.js': start
    }
}

export {
    appInfo,
    options
}