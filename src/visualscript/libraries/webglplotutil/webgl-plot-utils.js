import * as WebglPlotBundle from 'webgl-plot'
/**
 * importnat WebglPlot functions
 * addLine(line)
 * addDataLine(line)
 * addAuxLine(line)
 * popDataLine()
 * removeAllLines()
 * linesData() //returns data line obj array
 * linesAux() //returns aux line obj array
 * removeDataLines()
 * removeAuxLines()
 * update()
 * 
 * 
 * important WebglLine functions
 * setX(i,x)
 * setY(j,y)
 * constY(c) 
 * replaceArrayX(xarr)
 * replaceArrayY(yarr)
 * arrangeX()
 * linSpaceX(start, stepsize);
 */

export class WebglLinePlotUtils {
    constructor(canvas,overlay=true) {
        if(!canvas) throw new Error('Supply a canvas to the webgl plot!')
        this.canvas = canvas;
        
        this.useOverlay = overlay;
        this.overlay;
        this.overlayctx;

        this.plot = new WebglPlotBundle.WebglPlot(canvas);

        if(this.useOverlay) {
            this.overlay = document.createElement('canvas');
            this.overlay.style = this.canvas.style;

            // this.overlay.style.width = this.canvas.style.width;
            // this.overlay.style.height = this.canvas.style.height;
            this.overlay.width = this.canvas.width;
            this.overlay.height = this.canvas.height;
            this.overlay.style.position = 'absolute';
            this.overlay.style.zIndex = this.canvas.style.zIndex+1;
            // this.overlay.style.offsetX = this.canvas.style.offsetX;
            // this.overlay.style.offsetY = this.canvas.style.offsetY;

            this.overlayctx = this.overlay.getContext('2d');

            this.canvas.parentNode.insertAdjacentElement('afterbegin',this.overlay);

        }
        
        this.lines = []; //array of WebglLine objects
        this.linesY = []; //raw data arrays
        this.linesSPS = []; // [];
        this.axes = [];
        this.dividers = [];
        this.colors = [];

        this.lineSettings = [];

        this.axisscalar = 1; // chart axis scalar
        this.nLines = 0;

        this.nSecGraph = 10; //default
        this.nMaxPointsPerSec = 512;

        this.animationSpeed = 6.9; //ms

    }

    //autoscale array to -1 and 1
    autoscale(array,lineIdx=0,nLines=1,centerZero=false) {
        let max = Math.max(...array)
        let min = Math.min(...array);

        this.lineSettings[lineIdx].ymax = max;
        this.lineSettings[lineIdx].ymin = min;

        let _lines = 1/nLines;
        let scalar;
        if(centerZero) {
            let absmax = Math.max(Math.abs(min),Math.abs(max));
            scalar = _lines/absmax;
            return array.map(y => (y*scalar+(_lines*(lineIdx+1)*2-1-_lines))); //scaled array
        }
        else {
            scalar = _lines/(max-min);
            return array.map(y => (2*((y-min)*scalar-(1/(2*nLines)))+(_lines*(lineIdx+1)*2-1-_lines))); //scaled array
        }
    }


    //absolute value maximum of array (for a +/- valued array)
    static absmax(array) {
        return Math.max(Math.abs(Math.min(...array)),Math.max(...array));
    }

    //averages values when downsampling.
    static downsample(array, fitCount, scalar=1) {

        if(array.length > fitCount) {        
            let output = new Array(fitCount);
            let incr = array.length/fitCount;
            let lastIdx = array.length-1;
            let last = 0;
            let counter = 0;
            for(let i = incr; i < array.length; i+=incr) {
                let rounded = Math.round(i);
                if(rounded > lastIdx) rounded = lastIdx;
                for(let j = last; j < rounded; j++) {
                    output[counter] += array[j];
                }
                output[counter] /= (rounded-last)*scalar;
                counter++;
                last = rounded;
            }
            return output;
        } else return array; //can't downsample a smaller array
    }

    //Linear upscaling interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	static upsample(array, fitCount, scalar=1) {

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*scalar;
		};

		var newData = new Array(fitCount);
		var springFactor = new Number((array.length - 1) / (fitCount - 1));
		newData[0] = array[0]; // for new allocation
		for ( var i = 1; i < fitCount - 1; i++) {
			var tmp = i * springFactor;
			var before = new Number(Math.floor(tmp)).toFixed();
			var after = new Number(Math.ceil(tmp)).toFixed();
			var atPoint = tmp - before;
			newData[i] = linearInterpolate(array[before], array[after], atPoint);
		}
		newData[fitCount - 1] = array[array.length - 1]; // for new allocation
		return newData;
	};

    deinitPlot() {
        this.plot?.clear();
        this.plot?.removeAllLines();
    }

    HSLToRGB(h,s,l) {
        // Must be fractions of 1
        s /= 100;
        l /= 100;
      
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;
     
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;  
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return [r,g,b];
    }

    //charts. need to set sample rate and number of seconds, this creates lines with set numbers of coordinates you can update data into
    initPlot(nLines = 1, linesSPS=[], nSecGraph=this.nSecGraph, nMaxPointsPerSec=this.nMaxPointsPerSec) {

        this.nSecGraph = nSecGraph;
        this.nMaxPointsPerSec = nMaxPointsPerSec;

        let xaxisColor = new WebglPlotBundle.ColorRGBA(1,1,1,0.3);
        let dividerColor = new WebglPlotBundle.ColorRGBA(1,1,1,1);

        //scale line heights with number of lines
        let axisscalar = 1/nLines;
        this.nLines = nLines;
        
        this.lines = [];
        this.linesSPS = linesSPS;
        for(let i = 0; i < nLines; i++) {
            let rgb = this.HSLToRGB(360*(i/nLines)%360,100,50);

            let color = new WebglPlotBundle.ColorRGBA(
                rgb[0],rgb[1],rgb[2],
                1
            );

            this.colors.push(color);

            let numX = 10;
            if(linesSPS[i] > nMaxPointsPerSec) 
                numX = nSecGraph*nMaxPointsPerSec;
            else numX = linesSPS[i]*nSecGraph;

            numX =  Math.floor(numX)
            
            
            let line = new WebglPlotBundle.WebglLine(color,numX);
            line.arrangeX();

            this.lines.push(line);
            if(this.linesY.length < this.lines.length) {
                this.linesY.push(new Array(numX));
            }

            
            this.plot.addDataLine(line);

            let xaxisY = axisscalar*(i+1)*2-1-axisscalar;

            //console.log('lineidx',i);
            let xaxis = new WebglPlotBundle.WebglLine(xaxisColor,2);
            xaxis.constY(xaxisY);
            xaxis.arrangeX();
            xaxis.xy[2] = 1;
            //console.log('xaxisY',xaxisY,xaxis)
            this.plot.addAuxLine(xaxis);
            this.axes.push(xaxis);

            if(i !== nLines-1) {
                let dividerY = axisscalar*(i+1)*2-1;
                let divider = new WebglPlotBundle.WebglLine(dividerColor,2);
                divider.constY(dividerY);
                divider.arrangeX();
                divider.xy[2] = 1;
                //console.log('dividerY',dividerY,divider)
                this.plot.addAuxLine(divider);
                this.dividers.push(divider);
            }

            this.lineSettings[i] = {
                color:color,
                sps:linesSPS[i],
                ymin:-1,
                ymax:1
            };
            //console.log(i,xaxisY,xaxis)

        }

        if(this.linesY.length > this.lines.length) this.linesY.splice(this.lines.length);
        //console.log('plot setup', this.lines,this.linesY, this.axes,this.dividers);
        return true;

    }

    updateAllLines = (newAmplitudes=[],linesSPS=[],autoscale=true,centerZero=false) => {
        let passed = true;
        let sps = [...linesSPS];

     
        newAmplitudes.forEach((arr,i) => {
            if(arr.length !== this.linesY[i]?.length) {
                //let absmax = WebglLinePlotUtils.absmax(arr);
                if(arr.length > this.linesY[i]?.length) {
                    this.linesY[i] = WebglLinePlotUtils.downsample(arr,this.linesY[i].length);
                } else this.linesY[i] = WebglLinePlotUtils.upsample(arr,this.linesY[i]);
                sps[i] = Math.ceil(arr.length / this.nSecGraph);

                if(autoscale) {
                    this.linesY[i] = this.autoscale(arr,i,this.nLines,centerZero); //autoscale the array to -1,+1
                }
                passed = false;
            } else {
                if(autoscale) {
                    this.linesY[i] = this.autoscale(arr,i,this.nLines,centerZero); //autoscale the array to -1,+1
                }
                else this.linesY[i] = arr; //
                //console.log('line set')
            }
            
        });

        if(!passed) {
            this.deinitPlot();
            this.initPlot(newAmplitudes.length, sps);
            //console.log('reinit');
        }

        if(this.useOverlay) {
            this.overlayctx.clearRect(0,0,this.overlay.width,this.overlay.height);
            this.overlayctx.font = '1em Courier'
            this.overlayctx.fillStyle = 'white';
        }


        this.linesY.forEach((arr,i) => {
            for(let j = 0; j < arr.length; j++) {
                this.lines[i].setY(j,arr[j]);
            }
            //now update x-axes and y-axes on the canvas
            if(this.useOverlay){
                this.overlayctx.fillText(this.lineSettings[i].ymax.toFixed(2),this.overlay.width-70,this.overlay.height*(i+0.1)/(this.lines.length));
                this.overlayctx.fillText(this.lineSettings[i].ymin.toFixed(2),this.overlay.width-70,this.overlay.height*(i+0.9)/(this.lines.length))
            }
        });


        //console.log('lines updated')
    }

    //supply any line and it'll get crunched to the right spread, assuming it is the correct time length set in this.nSecGraph, nom nom. 
    //Providing what it expects is better for performance i.e. correct line length and -1:+1 scale
    updateLine = (newAmplitudes=[],lineSPS=500,lineIdx=0,autoscale=true,centerZero=false) => {
        
        if(newAmplitudes.length !== lineSPS*this.nSecGraph){
            lineSPS = newAmplitudes.length/this.nSecGraph;
            this.linesSPS[lineIdx] = lineSPS;
            this.deinitPlot();
            this.initPlot(this.lines.length, this.linesSPS);
            //console.log('reinit');
        }
        
        //console.log(this.linesY[lineIdx])
        if(newAmplitudes.length !== this.linesY[lineIdx].length) {
            if(newAmplitudes.length > this.linesY[lineIdx].length) {
                this.linesY[lineIdx] = WebglLinePlotUtils.downsample(newAmplitudes,this.linesY[lineIdx].length); //downsample and autoscale the array to -1,+1
            } else this.linesY[lineIdx] = WebglLinePlotUtils.upsample(newAmplitudes,this.linesY[lineIdx]); //upsample and autoscale the array to -1,+1
            if(autoscale) this.linesY[lineIdx] = this.autoscale(newAmplitudes,lineIdx,this.nLines,centerZero); //autoscale the array to -1,+1
            //console.log('resampled', this.linesY[lineIdx]);
        } else {
            if(autoscale) this.linesY[lineIdx] = this.autoscale(newAmplitudes,lineIdx,this.nLines,centerZero); //autoscale the array to -1,+1
            else this.linesY[lineIdx] = newAmplitudes;
            //console.log('set lineY[i]', this.linesY[lineIdx]);
        }
        for(let i = 0; i < this.linesY[lineIdx].length; i++) {
            this.lines[lineIdx].setY(i,this.linesY[lineIdx][i]);
        }
        //now update x-axes and y-axes on the canvas
        if(this.useOverlay){
            this.overlayctx.clearRect(0,this.overlay.height*lineIdx/(this.lines.length),this.overlay.width,this.overlay.height*(lineIdx+1)/(this.lines.length));
            this.overlayctx.fillText(this.lineSettings[lineIdx].ymax.toFixed(2),this.overlay.width-70,this.overlay.height*(lineIdx+0.1)/(this.lines.length));
            this.overlayctx.fillText(this.lineSettings[lineIdx].ymin.toFixed(2),this.overlay.width-70,this.overlay.height*(lineIdx+0.9)/(this.lines.length))
        }
        //console.log('line updated', lineIdx);
    }

    update() { //draw
        this.plot.update();
    }

    animate() {
        this.update();
        setTimeout(()=>{requestAnimationFrame(this.animate);},this.animationSpeed)
    }
    
    
    static test(canvasId) {
    
        const canvas = document.getElementById(canvasId);
        const devicePixelRatio = globalThis.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
    
    
        let sps = 512;
        let sps2 = 256;
        let nSec = 3;
        let nPointsRenderedPerSec = 512;
    
        const freq = 1;
        const amp = 0.5;
        const noise = 0.5;
    
        let line = new Array(sps*nSec);
        let line2 = new Array(sps2*nSec);
    
    
        let plotutil = new WebglLinePlotUtils(canvas);
        plotutil.initPlot(2,[sps,sps2],nSec,nPointsRenderedPerSec);
    
        function update(line=[],sps=512,sec=10) {
            let len = sps*sec;
            let tincr = sec/len;
            let time = 0;
            for (let i = 0; i < sps*sec; i++) {
                const ySin = Math.sin(Math.PI * time * freq * Math.PI * 2 + (performance.now()*0.001));
                const yNoise = Math.random() - 0.5;
                line[i] = ySin * amp + yNoise * noise;
                time += tincr;
            }
        }
    
        let  newFrame = () => {
            update(line,sps,nSec);
            update(line2,sps2,nSec);
            //console.log(line);
            plotutil.updateAllLines([line,line2],[sps,sps2],true);
            plotutil.update();
    
            requestAnimationFrame(newFrame);
        }
        requestAnimationFrame(newFrame);
                
    }
}

