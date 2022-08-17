import appInfo from '../../../../brainsatplay-starter-kit/index.wasl.json' assert {type: "json"}
import focusInfo from '../../../../brainsatplay-starter-kit/plugins/focus/index.wasl.json' assert {type: "json"}

import mainPkg from '../../../../brainsatplay-starter-kit/package.json'  assert {type: "json"}
import focusPkg from '../../../../brainsatplay-starter-kit/plugins/focus/package.json'  assert {type: "json"}
import * as sine from  '../../../../brainsatplay-starter-kit/plugins/sine/index.js'
import * as seconds from  '../../../../brainsatplay-starter-kit/plugins/seconds/index.js'
import * as filter from  '../../../../brainsatplay-starter-kit/plugins/filter/index.js'
import * as log from  '../../../../brainsatplay-starter-kit/plugins/log/index.js'
import * as timeseries from  '../../../../brainsatplay-starter-kit/plugins/timeseries/index.js'
import * as bandpower from  '../../../../brainsatplay-starter-kit/plugins/focus/bandpower/index.js'
import * as fft from  '../../../../brainsatplay-starter-kit/plugins/focus/fft/index.js'
import * as ratio from  '../../../../brainsatplay-starter-kit/plugins/focus/ratio/index.js'

const options = {
    filesystem: {
        'package.json': mainPkg,
        'plugins/focus/package.json': focusPkg,
        'plugins/focus/index.wasl.json': focusInfo,
        'plugins/sine/index.js': sine,
        'plugins/seconds/index.js': seconds,
        'plugins/filter/index.js': filter,
        'plugins/log/index.js': log,
        'plugins/timeseries/index.js': timeseries,
        'plugins/focus/fft/index.js': fft,
        'plugins/focus/bandpower/index.js': bandpower,
        'plugins/focus/ratio/index.js': ratio,
    }
}

export {
    appInfo,
    options
}