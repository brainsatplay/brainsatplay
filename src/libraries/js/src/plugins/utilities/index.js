import {Move} from './Move'
import {Scheduler} from './Scheduler'
import {DataManager} from './DataManager'
import {MapArray} from './MapArray'
import {Thread} from './Thread'
import {Storage} from './Storage'

import {dynamicImport} from '../../utils/general/importUtils'

//the link is based on where the import utils are 
const move = async (label, session, params=[]) => {let plugin = await dynamicImport('../../plugins/utilities/Move.js'); console.log(plugin);}; //the url may need to be set based on which script you are trying to import it from

move();

export {
    Move,
    Scheduler,
    DataManager,
    MapArray,
    Thread,
    Storage
}