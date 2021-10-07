import {Move} from './Move'
import {Scheduler} from './Scheduler'
import {DataManager} from './DataManager'
import {MapArray} from './MapArray'
import {Thread} from './Thread'
import {Storage} from './Storage'

import {dynamicImport} from '../../utils/general/importUtils'

const move = (label, session, params=[]) => {let plugin = dynamicImport('./Move'); return plugin.Move(label, session, params);}; //the url may need to be set based on which script you are trying to import it from

export {
    Move,
    Scheduler,
    DataManager,
    MapArray,
    Thread,
    Storage
}