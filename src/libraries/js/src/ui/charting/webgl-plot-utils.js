import {
    WebglPlot,
    WebglLine,
    ColorRGBA,
    } from "webgl-plot";


export class WebglPlotUtils {
    constructor(canvas) {
        
        this.canvas = canvas;
        this.plot = new WebglPlot(canvas);
        
        this.lines = [];
        this.lineProperties = []; // {sps: }
        this.axes = [];
        this.dividers = [];
        this.scalar = 1; // chart scalar

        this.nSecGraph = 10;
        this.nMaxPointsPerSec = 128;

    }

    //averages values when downsampling.
    static downsample(array,fitCount, normalize=1) {

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
                output[counter] /= (rounded-last)*normalize;
                counter++;
                last = rounded;
            }
            return output;
        } else return array; //can't downsample
    }

    //Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	static upsample(array, fitCount, normalize=1) {

		var norm = normalize;

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*norm;
		};

		var newData = new Array();
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

    initPlot(nLines = 1, properties=[{sps:this.nSecGraph*this.nMaxPointsPerSec}]) {

        let xaxisColor = new ColorRGBA(1,1,1,0.1);
        let dividerColor = new ColorRGBA(1,1,1,1);

        this.lineProperties = properties;
        this.scalar = this.canvas.height/nLines;
        for(let i = 0; i < nLines; i++) {
            let color = new ColorRGBA(
                Math.random()*.5+.5,
                Math.random()*.5+.5,
                Math.random()*.5+.5,
                1
            );
            this.colors.push(color);
            let numX = this.nSecGraph*this.nMaxPointsPerSec;
            if(properties[i].sps < numX) numX = properties.sps*this.nSecGraph;
            let line = new WebglLine(color,numX);
            line.arrangeX();

            this.plot.addDataLine(line);

            let xaxisY = i*this.scalar*.5+i*this.scalar;
            let xaxis = new WebglLine(xaxisColor,2);
            xaxis.constY(xaxisY);
            this.plot.addAuxLine(xaxis);

            if(i !== nLines-1) {
                let dividerY = this.scalar*i;
                let divider = new WebglLine(dividerColor,2);
                divider.constY(dividerY);
                this.plot.addAuxLine(divider);
            }

        }

    }

    setSecondsGraphed(nSec=10){
        this.nSecGraph = nSec;
    }

    update(newAmplitudes=[],lineIdx=undefined) {
        if(lineIdx) {

        } else {

        }
    }

}

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