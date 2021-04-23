import * as brainsatplay from './library/src/Session'
import {BlobApplet} from './js/applets/General/threejs/blob/BlobApplet'

let plotter = new BlobApplet(
    document.body,
    new brainsatplay.Session()
)


//Now add some ui elements like to connect to the device
plotter.bci.makeConnectOptions(document.body,()=> { plotter.responsive(); });
plotter.init();
plotter.responsive();
document.body.querySelector('.loader').style.opacity = 0;
