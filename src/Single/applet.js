import {brainsatplay} from '../library/src/brainsatplay.js'
import {uPlotApplet} from '../js/applets/General/other/uplot/uPlotApplet'

let plotter = new uPlotApplet(
    document.body,
    new brainsatplay()
)


//Now add some ui elements like to connect to the device
plotter.bci.makeConnectOptions(document.body,()=> { plotter.responsive(); });
plotter.init();
plotter.responsive();
