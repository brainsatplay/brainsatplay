import {Session} from '../../../library/src/Session.js/index.js'
import {uPlotApplet} from './js/applets/General/other/uplot/uPlotApplet'

let plotter = new uPlotApplet(
    document.body,
    new Session()
)


//Now add some ui elements like to connect to the device
plotter.bci.makeConnectOptions(document.body,()=> { plotter.responsive(); });
plotter.init();
plotter.responsive();
