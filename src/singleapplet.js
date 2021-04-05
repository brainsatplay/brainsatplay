import {brainsatplay} from './js/brainsatplay'
import {uPlotApplet} from './js/applets/General/uPlotApplet'

let plotter = new uPlotApplet(
    document.body,
    new brainsatplay()
)

//That's all folks