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
    downsample(array,count) {
        if(array.length > count) {        
            let output = new Array(count);
            let incr = array.length/count;
            let lastIdx = array.length-1;
            let last = 0;
            let counter = 0;
            for(let i = incr; i < array.length; i+=incr) {
                let rounded = Math.round(i);
                if(rounded > lastIdx) rounded = lastIdx;
                for(let j = last; j < rounded; j++) {
                    output[counter] += array[j];
                }
                output[counter] /= (rounded-last);
                counter++;
                last = rounded;
            }
            return output;
        } else return array; //can't downsample
    }

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
            //line.arrangeX();

            this.lines.push(line);
            this.plot.addLine(line);

            let xaxisY = i*this.scalar*.5+i*this.scalar;
            let xaxis = new WebglLine(xaxisColor,2);
            xaxis.setY(0,xaxisY); xaxis.setY(1,aaxisY);
            this.plot.addLine(xaxis);
            this.axes.push(xaxis);

            if(i !== nLines-1) {
                let dividerY = this.scalar*i;
                let divider = new WebglLine(dividerColor,2);
                divider.setY(0,dividerY); divider.setY(1,dividerY);
                this.plot.addLine(divider);
                this.dividers.push(divider);
            }

        }

    }

    setSecondsGraphed(nSec=10){
        this.nSecGraph = nSec;
    }

    update(lineIdx=undefined) {
        if(lineIdx) {

        } else {

        }
    }

}