import * as brainsatplay from '../libraries/js/src/Session'
import {BlobApplet} from '../applets/General/blob/BlobApplet'
// import {uPlotApplet} from './js/applets/General/uplot/uPlotApplet'


document.body.innerHTML += `
<div id="app" style="position: relative; width: 100vw; height: 100vh;">
    <div id="sidebar" style="position: absolute; top: 0px; left: 0; width: 100%; height: 0px;">
    </div>
</div>`

let plotter = new BlobApplet(
    document.getElementById('app'),
    new brainsatplay.Session()
)


//Now add some ui elements like to connect to the device
plotter.bci.connectDevice(document.getElementById('sidebar'),()=> { plotter.responsive(); });
plotter.init();
plotter.responsive();
document.body.querySelector('.loader').style.opacity = 0;
