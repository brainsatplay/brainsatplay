import uPlot from 'uplot';
import { SmoothieChart, TimeSeries } from "smoothie";
import '../../../../platform/js/frontend/UX/webgl-heatmap'
//import TimeChart from '../timechart/dist/timechart.module';

//By Joshua Brewster (GPL)
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//-------------------------------EEG Visual Classes--------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

//Nice time series charts based on smoothiejs
export class SmoothieChartMaker {
	constructor(nSeries = 1, canvas=null) {
		if(typeof(SmoothieChart) === 'undefined'){
			alert("smoothie.js not found!");
			return false;
		}

		this.canvas = canvas;
		this.canvasId = canvas.id;
		this.series = [];
		this.seriesColors = [];
		this.chart = null;

		for(var n = 0; n < nSeries; n++) {
			var newseries = new TimeSeries();
			this.series.push(newseries);
		}
	}

	deInit() {
		this.chart.stop();
		var ctx = this.canvas.getContext('2d')
		ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
	}

	init(gridStrokeStyle = 'rgb(125, 125, 125)', gridFillStyle = 'rgb(10, 10, 10)', labelFillStyle = 'rgb(255, 255, 255)', stroke1Style = 'rgba(255,0,0,1)',stroke1Fill = 'rgba(255,0,0,0.2)') {
		this.makeSmoothieChart(this.canvas, gridStrokeStyle, gridFillStyle, labelFillStyle, stroke1Style, stroke1Fill);
	}

	makeSmoothieChart( canvas = this.canvas, gridStrokeStyle = 'rgb(125, 125, 125)', gridFillStyle = 'rgb(10, 10, 10)', labelFillStyle = 'rgb(255, 255, 255)', stroke1Style = 'rgba(255,0,0,1)',stroke1Fill = 'rgba(255,0,0,0.2)')
	{
		this.chart = new SmoothieChart({
			responsive: true,
			grid: { strokeStyle:gridStrokeStyle, fillStyle:gridFillStyle,
			lineWidth: 1, millisPerLine: 250, verticalSections: 6, },
			labels: { fillStyle: labelFillStyle }
		});

		this.series.forEach((series, i) => {
			var stroke = ''; //Set the initial stroke and fill styles to be the same each time
			var fill = '';
			if(i === 0) 	 { stroke = stroke1Style; 	     fill = stroke1Fill;   }
			else if(i === 1) { stroke = 'orange';    fill = 'rgba(255,128,0,0.2)'; }
			else if(i === 2) { stroke = 'green';     fill = 'rgba(0,255,0,0.2)';   }
			else if(i === 3) { stroke = 'turquoise'; fill = 'rgba(0,255,150,0.2)'; }
			else if(i === 4) { stroke = 'rgba(50,50,255,1)';      fill = 'rgba(0,0,255,0.2)';   }
			else if(i === 5) { stroke = 'rgba(200,0,200,1)';    fill = 'rgba(128,0,128,0.2)'; }
			else {
				var r = Math.random()*255, g = Math.random()*255, b = Math.random()*255;
				stroke = 'rgb('+r+","+g+","+b+")"; fill = 'rgba('+r+','+g+','+b+","+"0.2)";
			}
			this.seriesColors.push(stroke); // For reference
			this.chart.addTimeSeries(series, {strokeStyle: stroke, fillStyle: fill, lineWidth: 2 });
		});

		if(canvas !== null){
			this.chart.streamTo(canvas, 100);
		}
	}

	streamTo(canvas = this.canvas){
		if(canvas !== null) {
			this.chart.streamTo(canvas, 100);
		}
		else { console.log("Needs a canvas id to stream the chart to");}
	}

	bulkAppend(dat = [0.5]){ //Append single values or arrays, appends to series by dat index, in order of series, set others to zero or the last datum if no new data
		var now = Date.now()
		dat.forEach((datum, i) => {
			this.series[i].append(now, datum);
		});
	}
}













export class uPlotMaker {
	constructor(divId = null) {
		if(uPlot === 'undefined') {
			console.log("uPlot not detected!");
			return false;
		}

		this.plotId = divId;
		this.plot = null;
		this.uPlotData = [];
	}

	deInit() {
		if(this.plot !== null){
			this.plot.destroy();
			this.plot = null;
		}
	}

	init() {

	}

	makeuPlot(series=[{}], data=[], width=1000, height=400, options = null, yScale=true) {
		if(series.length < 2) { console.log("Input valid series"); return false;}
		var uPlotOptions = {};

		let yOpts = {auto:true};
		if(yScale === true){
		}
		else{
			yOpts = {auto:false, range:yScale};
		}

		if(options === null){
			uPlotOptions = {
				width: width,
				height: height,
				series: series,
				legend: {
					show:false
				},
				scales: {
					x:{time:false},
					y:yOpts,
				},
				axes: [
				{
				scale: "Hz",
				values: (u, vals, space) => vals.map(v => +v.toFixed(2) + "Hz")
				},
			]}
		}
		else { uPlotOptions = options; }

		var uPlotData = data;

		if(uPlotData.length < series.length - 1){ //Append dummy data if none or not enough found
			while(uPlotData.length < series.length - 1){
				if(uPlotData.length > 0) {
					uPlotData.push([new Array(uPlotData[0].length).fill(Math.random())]);
				}
				else {
					uPlotData.push([new Array(100).fill(0)]);
				}
			}
		}
		else if (uPlotData.length > series.length) {
			uPlotData.splice(series.length, uPlotData.length - series.length);
		}

		//console.log(uPlotData);
		if(this.plot !== null){ this.plot.destroy(); }
		this.plot = new uPlot(uPlotOptions, uPlotData, document.getElementById(this.plotId));
		//console.log(this.plot)
	}

	//Pass this the channelTags object from your eeg32 instance.
	makeSeriesFromChannelTags(channelTags, taggedOnly=true, ch=null) {
		var newSeries = [{}];

		channelTags.forEach((row,i) => {
			if (taggedOnly === true){
				if(row.tag !== null && row.tag !== 'other') {
					if(ch===null || row.ch === ch) {
						newSeries.push({
							label:"A"+row.ch + ", Tag: "+row.tag,
							value: (u, v) => v == null ? "-" : v.toFixed(2),
							stroke: "rgb("+Math.random()*128+","+Math.random()*128+","+Math.random()*128+")"
						});
					}
				}
			}
			else{
				if(ch===null || row.ch === ch) {
					newSeries.push({
						label:"A"+row.ch + ", Tag: "+row.tag,
						value: (u, v) => v == null ? "-" : v.toFixed(2),
						stroke: "rgb("+Math.random()*128+","+Math.random()*128+","+Math.random()*128+")"
					});
				}
			}
			
		  });
		return newSeries;
	}

	updateData(data) { // [x,y0,y1,y2,etc]
		this.plot.setData(data);
	}

	//Stacked uplot with dynamic y scaling per series. Define either series or channelTags (from the eeg32 instance)
	makeStackeduPlot = (series=[{}], data=[], options = null, channelTags = null, width = 1000, height = 800, yScale=true) => {
		var newSeries = [{}];
		var serieslen = 0;
		//console.log(data)
		if(series === newSeries) {
			if(channelTags === null) { console.log("No series data!"); return; }
			serieslen = channelTags.length;
		}
		var yvalues;

		var windows = [];
		var maxs = [];
		var mins = [];

		var dat = data;

		if((dat.length === 0)) { //No data
			console.log("No data inputted!");
			return;
		}

		dat.forEach((row,i) => {
			if(i>0){
				windows.push(Math.ceil(Math.max(...row)) - Math.min(...row));
				mins.push(Math.min(...row));
				maxs.push(Math.max(...row));
		  	}
		});

		var max = Math.max(...windows);

		var mapidx=0;

		var ymapper = (t,j) => { //Pushes the y values up based on the max peak values of all the previous signals inputted
			var k = 0;
			var sum = 0;
			while(k < mapidx){
				sum += 1;
				k++;
			}
			if(t === 0 || maxs[k] === 0) return k;
			return (t/maxs[k]) + k; //+(Math.abs(min)/max); //+0.5

		}
		
		var uPlotData = [
			dat[0]
		];

		dat.forEach((row,i) => {
			if(i>0){
				uPlotData.push(row.map((t,j) => ymapper(t,j)));
				mapidx++;
			}
		  });

		var datidx = 1;

		if(channelTags !== null) {
			channelTags.forEach((row,i) => {

				var r = Math.random()*128; var g = Math.random()*128; var b = Math.random()*128;
				var newLineColor = "rgb("+r+","+g+","+b+")";
				var newFillColor = "rgba("+r+","+g+","+b+",0.1)"

				var valuemapper = (u,v,ser,i) => {
					if(v === null) {
						return "-";
					}
					else {
						//console.log(v)
						return dat[ser-1][i].toFixed(2);
					}
				}

				newSeries.push({
					label:"A"+row.ch + ", Tag: "+row.tag,
					stroke: newLineColor,
					value: valuemapper,
					fill: newFillColor,
					fillTo: (u,v) => v-1
				});

				datidx++;
				
			});
		}
		else{
			newSeries = series;
		}

		//console.log(newSeries)

		yvalues = (u, splits) => splits.map((v,i) => axmapper(v,i));

		var ax=-1;
		const axmapper = (v,i) => {
			if(v === Math.floor(v)){
			  if(v < this.plot?.series.length){
				ax++;
				if(this.plot.series[ax]) return this.plot.series[ax].label;
			  }
			}
			else { return undefined;}
		  }


		let yOpts = {auto:true};
		if(yScale === true){
		}
		else{
			yOpts = {auto:false, range:yScale};
		}


		var uPlotOptions;
		if(options === null){
		uPlotOptions = {
		  width: width,
		  height: height,
		  series: newSeries,
		  legend: {
			show:false
		  },
		  scales: {
			x:{time:false},
			y:yOpts,
		  },
		  axes: [
			{
			scale: "sec",
			values: (u, vals, space) => vals.map(v => +v.toFixed(2) + "s"),
			},
			{
			  size: 80,
			  values: yvalues
			}
		  ]
		}
		}
		else { uPlotOptions = options; }

		if(this.plot !== null) { this.plot.destroy(); }
		this.plot = new uPlot(uPlotOptions, uPlotData, document.getElementById(this.plotId));

	}

	updateStackedData(dat, updateYAxis=false) {

		var windows = [];
		var maxs = [];
		var mins = [];

		if((dat.length === 0)) { //No data
			console.error("uPlotMaker: No data inputted!");
			return;
		}

		dat.forEach((row,i) => {
			if(i>0){
				windows.push(Math.ceil(Math.max(...row)) - Math.min(...row));
				mins.push(Math.min(...row));
				maxs.push(Math.max(...row));
		  	}
		});

		var max = Math.max(...windows);

		var mapidx=0;

		/*
			let graphscalar = 1/nGraphs
			let graphrange = Math.abs(min[g]/max[g])
			
		*/

		var ymapper = (t,j) => { //Pushes the y values up based on the max peak values of all the previous signals inputted
			var k = 0;
			var sum = 0;
			while(k < mapidx){
				sum += 1;
				k++;
			}
			if(t === 0 || maxs[k] === 0) return k;
			return (t/maxs[k]) + k; //+(Math.abs(min)/max); //+0.5

		}

		var uPlotData = [
			dat[0]
		];

		dat.forEach((row,i) => {
			if(i>0){
				uPlotData.push(row.map((t,j) => ymapper(t,j)));
				mapidx++;
			}
		});

		if(updateYAxis){
			let ax=-1;
			const axmapper = (v,i) => {
				if(v === Math.floor(v)){
				  if(v < this.plot?.series.length){
					ax++;
					if(this.plot.series[ax]) return this.plot.series[ax].label;
				  }
				}
				else { return undefined;}
			  }
			let yvalues = (u, splits) => splits.map((v,i) => axmapper(v,i));
			this.plot.axes[1].values = yvalues;
		}
		//console.log(uPlotData)
		this.plot.setData(uPlotData);
	}

}






// export class TimeChartMaker {
// 	constructor(divId, maxpoints=20000){
// 		if(TimeChart === "undefined") {
// 			alert("timechart not found!");
// 			return;
// 		}

// 		this.divId = divId;
// 		this.timecharts = [];
// 		this.timechartsdata = [];
// 		this.lasttimeIdx = 0;

// 		this.maxpoints = maxpoints;
// 	}

// 	deInit() {
// 		this.timecharts.forEach((chart,i) => {
// 			chart.dispose(); //does not delete shadow root
// 		});
// 	}

// 	init() {

// 	}

// 	setEEGTimeCharts = (EEG, ATLAS, nSecAdcGraph=10) => { //Creates timecharts from the EEG class data
// 		console.log("run");
// 		ATLAS.channelTags.forEach((row,i) => { // Recycle or make new time charts
// 		  var chartname = 'timechart'+i;
// 		  var nsamples = Math.floor(EEG.sps*nSecAdcGraph);
// 		  var dat = EEG.data["A"+row.ch].slice(EEG.counter - nsamples, EEG.counter);
// 		  if(this.timecharts[i] === undefined){
// 			document.getElementById(this.divId).insertAdjacentHTML('beforeend',`<div id='`+chartname+`'></div>`);
// 			var elem = document.getElementById(chartname);
// 			this.timechartsdata.push(dat);
// 			//debugger;
// 			var timechart = new TimeChart(elem, {
// 			  series: [{ dat }],
// 			  lineWidth: 2,
// 			  xRange: { min: 0, max: 20 * 1000 },
// 			  realTime: true,
// 			  zoom: {
// 				  x: {
// 					  autoRange: true,
// 					  minDomainExtent: 50,
// 				  },
// 				  y: {
// 					  autoRange: true,
// 					  minDomainExtent: 1,
// 				  }
// 			  },
// 			});

// 			this.timecharts.push(timechart);
// 		  }
// 		  else {
// 			this.timecharts[i].dispose();
// 			this.timechartsdata[i] = dat;
// 			var elem = document.getElementById(chartname);
// 			var timechart = new TimeChart(elem, {
// 			  series: [{ dat }],
// 			  lineWidth: 2,
// 			  xRange: { min: 0, max: 20 * 1000 },
// 			  realTime: true,
// 			  zoom: {
// 				  x: {
// 					  autoRange: true,
// 					  minDomainExtent: 50,
// 				  },
// 				  y: {
// 					  autoRange: true,
// 					  minDomainExtent: 1,
// 				  }
// 			  },
// 			});
// 			this.timecharts[i] = timechart;
// 		  }
// 		});
// 	}

// 	updateTimeCharts = (EEG, ATLAS) => {
// 		if(this.timechartsdata[0].length > this.maxpoints) { //rebuild timecharts if the data array is too big to prevent slowdowns
// 		  this.setEEGTimeCharts(EEG);
// 		}
// 		var latestIdx = EEG.counter-1;
// 		ATLAS.channelTags.forEach((row,i) => {
// 		  var latestdat = EEG.data["A"+row.ch].slice(this.lasttimeIdx,latestIdx);
// 		  this.timechartsdata[i].push(latestdat);
// 		  this.timecharts[i].update();
// 		});
// 		this.lasttimeIdx = latestIdx;
// 	  }

// }








//heatmap-js based brain mapping with active channel markers (incl assigned ADC input), based on the atlas system in eeg32
export class BrainMap2D {
	constructor(heatmapCanvasId = null, pointsCanvasId = null) {
		if(typeof(createWebGLHeatmap) === 'undefined'){
			console.log("webgl-heatmap.js not found! Please include in your app correctly");
			return false;
		}

		this.heatmapCanvasId = heatmapCanvasId;
		this.pointsCanvasId = pointsCanvasId;
		this.anim = undefined;
		this.animationDelay = 20; //ms

		this.heatmap = null;
		this.pointsCanvas = null;
		this.pointsCtx = null;

		if((heatmapCanvasId !== null) && (pointsCanvasId !== null)) {
			this.heatmap = createWebGLHeatmap({canvas: document.getElementById(this.heatmapCanvasId), intensityToAlpha: true});
			this.pointsCanvas = document.getElementById(this.pointsCanvasId);
			this.pointsCtx = this.pointsCanvas.getContext("2d");
		}

		this.points = [{ x:100, y:100, size:100, intensity: 0.7 }];
		this.scale = 1.5; // heatmap scale

	}

	deInit() {
		if(this.anim) cancelAnimationFrame(this.anim);
		this.anim = "cancel";
		this.heatmap.clear();
	}

	init() {
		this.anim = requestAnimationFrame(draw);
	}

	genHeatMap(heatmapCanvasId=this.heatmapCanvasId, pointsCanvasId=this.pointsCanvasId) {
		this.heatmap = createWebGLHeatmap({canvas: document.getElementById(heatmapCanvasId), intensityToAlpha: true});
		this.pointsCanvas = document.getElementById(pointsCanvasId);
		this.pointsCanvas.width = this.heatmap.width;
		this.pointsCanvas.height = this.heatmap.height;
		this.pointsCtx = this.pointsCanvas.getContext("2d");
	}

	updateHeatmap(points=this.points) {
		this.heatmap.clear();
		this.heatmap.addPoints(points);
		this.heatmap.update();
		this.heatmap.display();
	}

	updateHeatmapFromAtlas(eegMap, channelTags, viewing, normalize=1) { //Normalize is the peak expected value
		var newpoints = [];

		var halfwidth = this.pointsCanvas.width*.5;
		var halfheight = this.pointsCanvas.height*.5;

		var sizeMul = 1/normalize;
		channelTags.forEach((row,i) => {
			let atlasCoord = eegMap.find((o, j) => {
			  if(o.tag === row.tag){
				    newpoints.push({x:o.position.x*this.scale+halfwidth, y:halfheight-o.position.y*this.scale, size:10, intensity:0.7});
				if(viewing === "scp"){
					newpoints[i].size = Math.max(...o.slices.scp[o.slices.scp.length-1])}//o.means.scp[o.means.scp.length - 1];}
				else if(viewing === "delta"){
					newpoints[i].size = Math.max(...o.slices.delta[o.slices.delta.length-1])}//o.means.delta[o.means.delta.length - 1];}
				else if(viewing === "theta"){
					newpoints[i].size = Math.max(...o.slices.theta[o.slices.theta.length-1])}//o.means.theta[o.means.theta.length - 1];}
				else if(viewing === "alpha1"){
					newpoints[i].size = Math.max(...o.slices.alpha1[o.slices.alpha1.length-1])}//o.means.alpha[o.means.alpha.length - 1];}
				else if(viewing === "alpha2"){
					newpoints[i].size = Math.max(...o.slices.alpha2[o.slices.alpha2.length-1])}//o.means.alpha[o.means.alpha.length - 1];}
				else if(viewing === "beta"){
					newpoints[i].size = Math.max(...o.slices.beta[o.slices.beta.length-1])}//o.means.beta[o.means.beta.length - 1];}
				else if(viewing === "lowgamma"){
					newpoints[i].size = Math.max(...o.slices.lowgamma[o.slices.lowgamma.length-1])}//o.means.gamma[o.means.gamma.length - 1];}
				else if(viewing === "highgamma"){
					newpoints[i].size = Math.max(...o.slices.highgamma[o.slices.highgamma.length-1])}//o.means.gamma[o.means.gamma.length - 1];}

					newpoints[i].size *= sizeMul; //Need a better method

				//simplecoherence *= points[points.length-1].size;
				if(newpoints[i].size > 90*this.scale){
					newpoints[i].size = 90*this.scale;
				}

			  }
			});
		  });
		this.points = newpoints;
		//console.log(newpoints);
		this.heatmap.clear();
		this.heatmap.addPoints(this.points); //update size and intensity
		this.heatmap.update();
		this.heatmap.display();
	}

	//pass this the atlas and channelTags from your eeg32 instance
	updatePointsFromAtlas(eegMap,channelTags,clear=true) {

		var halfwidth = this.pointsCanvas.width*.5;
		var halfheight = this.pointsCanvas.height*.5;

		if(clear === true){
			this.pointsCtx.fillStyle = "rgba(0,0,0,0)";
			this.pointsCtx.clearRect(0, 0, this.pointsCanvas.width, this.pointsCanvas.height);
		}

		eegMap.forEach((row,i) => {
			this.pointsCtx.beginPath();
			this.pointsCtx.fillStyle="rgba(0,0,255,1)";
			let tags = channelTags.find((o, i) => {
				if(o.tag === row.tag){
					this.pointsCtx.fillStyle = "rgba(0,0,0,0.7)";
					this.pointsCtx.fillText(o.ch,halfwidth-15+row.position.x*this.scale,halfheight+10-row.position.y*this.scale,14);
					//this.points[i] = { x: row.position.x*this.scale-halfwidth, y: halfheight+10-row.position.y, size: 10, intensity: 0.7 };
					this.pointsCtx.fillStyle="rgba(0,255,0,1)";
					//console.log("updating points")
				return true;
				}
			});
			// Draws a circle at the coordinates on the canvas
			this.pointsCtx.arc(halfwidth+row.position.x*this.scale, halfheight-row.position.y*this.scale, 4, 0, Math.PI*2, true);
			this.pointsCtx.closePath();
			this.pointsCtx.fill();

			this.pointsCtx.fillStyle = "rgba(0,0,0,0.7)";
			this.pointsCtx.fillText(row.tag,halfwidth+4+row.position.x*this.scale,halfheight+10-row.position.y*this.scale,14);
		});
	}

	updateConnectomeFromAtlas(coherenceMap, eegMap, channelTags, viewing, clear=true, alphaScalar=0.01) { //
		var halfwidth = this.pointsCanvas.width*.5;
		var halfheight = this.pointsCanvas.height*.5;
		var ctx = this.pointsCtx;

		if(clear === true){
			ctx.fillStyle = "rgba(0,0,0,0)";
			ctx.clearRect(0, 0, this.pointsCanvas.width, this.pointsCanvas.height);
		}

		var strokeStyle = "";
		//Set alpha based on intensity (needs testing)
		if(viewing === "scp") {
			strokeStyle = "rgba(0,0,0,";}
		else if(viewing === "delta") {
			strokeStyle = "rgba(255,0,0,";}
		else if(viewing === "theta") {
			strokeStyle = "rgba(0,255,200,";}
		else if(viewing === "alpha1") {
			strokeStyle = "rgba(0,100,255,";}
		else if(viewing === "alpha2") {
			strokeStyle = "rgba(0,200,255,";}
		else if(viewing === "beta") {
			strokeStyle = "rgba(255,0,255,";}
		else if(viewing === "lowgamma") {
			strokeStyle = "rgba(255,255,0,";}
		else if(viewing === "highgamma") {
			strokeStyle = "rgba(255,255,0,";}
			//console.log(strokeStyle);
		coherenceMap.forEach((row,i) => {
			if(viewing === "scp") {	 //TODO:: figure out a good transparency (or could do line thickness) upper bound based on actual results
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.scp[row.slices.scp.length-1])*alphaScalar + ")";}//(row.means.scp[row.means.scp.length-1]*alphaMul) + ")";}
			else if(viewing === "delta") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.delta[row.slices.delta.length-1])*alphaScalar + ")";}//(row.means.delta[row.means.delta.length-1]*alphaMul) + ")";}
			else if(viewing === "theta") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.theta[row.slices.theta.length-1])*alphaScalar + ")";}//(row.means.theta[row.means.theta.length-1]*alphaMul) + ")";}
			else if(viewing === "alpha1") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.alpha1[row.slices.alpha1.length-1])*alphaScalar + ")";}//(row.means.alpha[row.means.alpha.length-1]*alphaMul) + ")";}
			else if(viewing === "alpha2") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.alpha2[row.slices.alpha2.length-1])*alphaScalar + ")";}//(row.means.alpha[row.means.alpha.length-1]*alphaMul) + ")";}
			else if(viewing === "beta") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.beta[row.slices.beta.length-1])*alphaScalar + ")";}//(row.means.beta[row.means.beta.length-1]*alphaMul) + ")";}
			else if(viewing === "lowgamma") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.lowgamma[row.slices.lowgamma.length-1])*alphaScalar + ")";}//(row.means.gamma[row.means.gamma.length-1]*alphaMul) + ")";}
			else if(viewing === "highgamma") {
				ctx.strokeStyle = strokeStyle + Math.max(...row.slices.highgamma[row.slices.highgamma.length-1])*alphaScalar + ")";}//(row.means.gamma[row.means.gamma.length-1]*alphaMul) + ")";}
			//console.log(ctx.strokeStyle)
			//console.log(ctx.strokeStyle);
			ctx.beginPath();
			ctx.moveTo(halfwidth+row.x0*this.scale,halfheight-row.y0*this.scale);
			ctx.lineTo(halfwidth+row.x1*this.scale,halfheight-row.y1*this.scale);
			ctx.stroke();
		});

		//Now redraw points on top of connectome
		this.updatePointsFromAtlas(eegMap, channelTags, false);
	}

	draw = () => {
		this.heatmap.clear();
		this.heatmap.addPoints(this.points); //update size and intensity
		this.heatmap.update();
		this.heatmap.display();
	}

	animate = () => {
		this.draw();
		setTimeout(() => {if(this.anim !== "cancel") this.anim = requestAnimationFrame(animate)},this.animationDelay); // 50 FPS hard limit
	}
}











//Makes a color coded bar chart to apply frequency bins to for a classic visualization. Should upgrade this with smooth transitions in an animation loop
export class eegBarChart {
	constructor(canvasId = null, reversed=false, colors=['purple','violet','blue','green','chartreuse','gold','red']) {
		this.canvasId; this.canvas;
		if (typeof canvas == 'string'){
			this.canvasId = canvas;
			this.canvas = document.getElementById(canvas);
		} else {
			this.canvas = canvas
		}
		this.ctx = this.canvas.getContext("2d");
		this.anim = undefined;

		//combine and push the latest slices to this then call eegbarchart.draw() from the class instance
		this.slices = {scp: [0], delta: [0], theta: [0], alpha1: [0], alpha2:[0], beta: [0], lowgamma: [0], highgamma: [0]};
		this.reversed = reversed;
		this.colors = colors;
		this.allCapsReachBottom = false;
		this.meterWidth = 14; //relative width of the meters in the spectrum
		this.meterGap = 2; //relative gap between meters
		this.capHeight = 2; //relative cap height
		this.meterNum = 256;
		this.capStyle = '#fff';

		this.relativeWidth = this.meterNum*(this.meterWidth+this.meterGap); //Width of the meter (px)

		this.animationDelay = 15;

		this.showvalues = true;

	}

	deInit() {
		if(this.anim)
			cancelAnimationFrame(this.anim);
		this.anim = "cancel";
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	init() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	setData(slices,fft) {
		this.slices = slices;
		this.fftArr = fft;
	}

	draw = () => {
		var cwidth = this.canvas.width;
		var cheight = this.canvas.height;

		var nbins = 0;
		let keys = Object.keys(this.slices);
		if(typeof this.slices[Object.keys(this.slices)[0]] === 'object') {
			keys.forEach((k) => {
				nbins += this.slices[k].length;
			})
		}
		else nbins = Object.keys(this.slices).length; if (this.slices.highgamma) nbins-=1; //this option is if each key is a value instead of an array //-1 because we don't like you, high gamma

		this.meterNum = nbins;
		this.relativeWidth = this.meterNum*(this.meterWidth+this.meterGap); //Width of the meter (px)

		var wscale = cwidth / this.relativeWidth;
		var xoffset = (this.meterWidth+this.meterGap)*wscale;

		let slice = this.slices;
		let max = 0;
		for(const prop in slice) {
			if ( typeof slice[prop] === 'number') {if (slice[prop] > max) max = slice[prop];}
			else if ( typeof slice[prop] === 'object') {    
				let mx = Math.max(...slice[prop]);
				if (mx > max) max = mx;
			}
		} 

		let normalizer = 1/max;

		this.ctx.clearRect(0, 0, cwidth, cheight);
		
		let i = 0; if(this.reversed) i = nbins;
		let drawbar = (value) => {
			let v = value*normalizer*cheight;
			if(v > cheight) v = cheight;
			if(v < 0){ value = 0;}
			this.ctx.fillRect(i * xoffset /*meterWidth+gap*/ , (cheight - v + this.capHeight), this.meterWidth*wscale, cheight);

			if(this.showvalues) {
				let oldfill = this.ctx.fillStyle;
				this.ctx.fillStyle = 'white';
				this.ctx.fillText(value.toFixed(2),i*xoffset,cheight-20,xoffset);
				this.ctx.fillStyle = oldfill;
			}

			if(this.reversed) i--;
			else i++;
		}

		keys.forEach((key,i)=>{
			if(this.colors[i]) this.ctx.fillStyle = this.colors[i]; else this.ctx.fillStyle = 'white';
			slice[key].forEach((v) => {
				drawbar(v);
			});
		});
	}

	animate = () => {
		this.draw();
		setTimeout(() => {if(this.anim !== "cancel") this.anim = requestAnimationFrame(this.animate)},this.animationDelay);
	}
}

export class mirrorBarChart {
	constructor(leftcanvasId = null, rightcanvasId = null) {
		this.leftcanvasId - leftcanvasId;
		this.rightcanvasId = rightcanvasId;
		this.leftbars = new eegBarChart(leftcanvasId);
		this.rightbars = new eegBarChart(rightcanvasId,true);
	}

	deInit() {
		this.leftbars.deInit();
		this.rightbars.deInit();
	}

	init() {
		this.leftbars.init();
		this.rightbars.init();
		this.leftbars.ctx.rotate(90 * (Math.PI / 180));
		this.rightbars.ctx.rotate(90 * (Math.PI / 180));
		this.rightbars.ctx.scale(-1,1);
	}

	draw = () => {
		this.leftbars.draw();
		this.rightbars.draw();
	}

	animate = () => {
		this.leftbars.animate();
		this.rightbars.animate();
	}

}










export class thetaGamma2Octave { //Not finished
	constructor(canvasId = null, spectNormalizeFactor, scalingFactor) {
		this.canvasId = canvasId;
		this.spect = new Spectrogram(canvasId);
		this.anim = null;
		this.spect.normalizeFactor = spectNormalizeFactor;
		this.adcScalingFactor = scalingFactor;

		this.audio = null;

		try{ this.makeAudioCtx(); } //only works if activated on user input
		catch(err){ console.log(err); }
	}

	deInit() {
		this.audio = null;
		this.spect.deInit();
	}

	init() {
		this.makeAudioCtx();
		this.spect.init();
	}

	makeAudioCtx() {
		this.audio = new SoundJS();
	}

	getBandPowers(channelTags,atlas) {

		channelTags.forEach((row,i) => {
			atlas.map.forEach((o,j) => {
				if(o.tag === row.tag) {
					var thetaMax = Math.max(...o.slices.theta[o.slices.theta.length-1])*this.adcScalingFactor;
					var gammaMax = Math.max(...o.slices.lowgamma[o.slices.lowgamma.length-1])*this.adcScalingFactor;
					gammaMaxidx = o.slices.lowgamma.indexOf(gammaMax);
					gammaFreq = atlas.shared.bandFreqs.lowgamma[1][gammaMaxidx];
					if(thetaMax > 0.00005) { //Threshold in Volts
						this.audioctx.playFreq(450,0.1,'sine');
					}
					if((gammaMax > 0.00003) && (thetaMax > 0.000001)) { //Threshold in Volts, only use gamma when theta is over a certain threshold
						this.audioctx.playFreq(800,0.1,'sine');
					}
					return true;
				}
			});
		});
	}

	updateSpect(array){
		//var array = new Uint8Array(this.audio.analyser.frequencyBinCount);
      	//this.audio.analyser.getByteFrequencyData(array);

		this.spect.latestData = array;
		this.spect.draw();
	}
}













export class Spectrogram {
	constructor(canvas, peakAmp = 1){
		if (typeof canvas === 'string') {
			this.canvasId = canvas;
			this.canvas = document.getElementById(canvas);
		} else {
			this.canvas = canvas
		}

		this.ctx = this.canvas.getContext("2d");
		this.offscreen = null;
		this.offscreenctx = null;

		this.anim = undefined;
		this.reset = false;
		this.offset = true; //automatic DC offset based on mininum 

		//256 key Chromajs generated color scale from: https://vis4.net/labs/multihue/
		this.colorScale = ['#000000', '#030106', '#06010c', '#090211', '#0c0215', '#0e0318', '#10031b', '#12041f', '#130522', '#140525', '#150628', '#15072c', '#16082f', '#160832', '#160936', '#160939', '#17093d', '#170a40', '#170a44', '#170a48', '#17094b', '#17094f', '#170953', '#170956', '#16085a', '#16085e', '#150762', '#140766', '#140669', '#13066d', '#110571', '#100475', '#0e0479', '#0b037d', '#080281', '#050185', '#020089', '#00008d', '#000090', '#000093', '#000096', '#000099', '#00009c', '#00009f', '#0000a2', '#0000a5', '#0000a8', '#0000ab', '#0000ae', '#0000b2', '#0000b5', '#0000b8', '#0000bb', '#0000be', '#0000c1', '#0000c5', '#0000c8', '#0000cb', '#0000ce', '#0000d1', '#0000d5', '#0000d8', '#0000db', '#0000de', '#0000e2', '#0000e5', '#0000e8', '#0000ec', '#0000ef', '#0000f2', '#0000f5', '#0000f9', '#0000fc', '#0803fe', '#2615f9', '#3520f4', '#3f29ef', '#4830eb', '#4e37e6', '#543ee1', '#5944dc', '#5e49d7', '#614fd2', '#6554cd', '#6759c8', '#6a5ec3', '#6c63be', '#6e68b9', '#6f6db4', '#7072af', '#7177aa', '#717ba5', '#7180a0', '#71859b', '#718996', '#708e91', '#6f928b', '#6e9786', '#6c9b80', '#6aa07b', '#68a475', '#65a96f', '#62ad69', '#5eb163', '#5ab65d', '#55ba56', '#4fbf4f', '#48c347', '#40c73f', '#36cc35', '#34ce32', '#37cf31', '#3ad130', '#3cd230', '#3fd32f', '#41d52f', '#44d62e', '#46d72d', '#48d92c', '#4bda2c', '#4ddc2b', '#4fdd2a', '#51de29', '#53e029', '#55e128', '#58e227', '#5ae426', '#5ce525', '#5ee624', '#60e823', '#62e922', '#64eb20', '#66ec1f', '#67ed1e', '#69ef1d', '#6bf01b', '#6df11a', '#6ff318', '#71f416', '#73f614', '#75f712', '#76f810', '#78fa0d', '#7afb0a', '#7cfd06', '#7efe03', '#80ff00', '#85ff00', '#89ff00', '#8eff00', '#92ff00', '#96ff00', '#9aff00', '#9eff00', '#a2ff00', '#a6ff00', '#aaff00', '#adff00', '#b1ff00', '#b5ff00', '#b8ff00', '#bcff00', '#bfff00', '#c3ff00', '#c6ff00', '#c9ff00', '#cdff00', '#d0ff00', '#d3ff00', '#d6ff00', '#daff00', '#ddff00', '#e0ff00', '#e3ff00', '#e6ff00', '#e9ff00', '#ecff00', '#efff00', '#f3ff00', '#f6ff00', '#f9ff00', '#fcff00', '#ffff00', '#fffb00', '#fff600', '#fff100', '#ffec00', '#ffe700', '#ffe200', '#ffdd00', '#ffd800', '#ffd300', '#ffcd00', '#ffc800', '#ffc300', '#ffbe00', '#ffb900', '#ffb300', '#ffae00', '#ffa900', '#ffa300', '#ff9e00', '#ff9800', '#ff9300', '#ff8d00', '#ff8700', '#ff8100', '#ff7b00', '#ff7500', '#ff6f00', '#ff6800', '#ff6100', '#ff5a00', '#ff5200', '#ff4900', '#ff4000', '#ff3600', '#ff2800', '#ff1500', '#ff0004', '#ff000c', '#ff0013', '#ff0019', '#ff001e', '#ff0023', '#ff0027', '#ff002b', '#ff012f', '#ff0133', '#ff0137', '#ff013b', '#ff023e', '#ff0242', '#ff0246', '#ff0349', '#ff034d', '#ff0450', '#ff0454', '#ff0557', '#ff065b', '#ff065e', '#ff0762', '#ff0865', '#ff0969', '#ff0a6c', '#ff0a70', '#ff0b73', '#ff0c77', '#ff0d7a', '#ff0e7e', '#ff0f81', '#ff1085', '#ff1188', '#ff128c', '#ff138f', '#ff1493'];
		this.latestData = null;
		this.animationDelay = 15;
		this.normalizeFactor = 1/peakAmp; // This sets the scaling factor for the color scale. 0 = 0, 1 = 255, anything over or under 0 or 1 will trigger the min or max color
		this.dynNormalize = true;
	}

	//Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers
	interpolateArray(data, fitCount) {

		var norm = this.canvas.height/data.length;

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*norm;
		};

		var newData = new Array();
		var springFactor = new Number((data.length - 1) / (fitCount - 1));
		newData[0] = data[0]; // for new allocation
		for ( var i = 1; i < fitCount - 1; i++) {
			var tmp = i * springFactor;
			var before = new Number(Math.floor(tmp)).toFixed();
			var after = new Number(Math.ceil(tmp)).toFixed();
			var atPoint = tmp - before;
			newData[i] = linearInterpolate(data[before], data[after], atPoint);
		}
		newData[fitCount - 1] = data[data.length - 1]; // for new allocation
		return newData;
	};

	deInit() {
		if(this.anim) cancelAnimationFrame(this.anim);
		this.anim = "cancel";
	}

	clear() {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
	}

	init() {
		this.offscreen = new OffscreenCanvas(this.canvas.width,this.canvas.height);
		this.offscreenctx = this.offscreen.getContext("2d");
		this.latestData = new Array(this.canvas.height).fill(0);
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
		this.offscreenctx.fillStyle = "black";
		this.offscreenctx.fillRect(0,0,this.canvas.width,this.canvas.height);
	}

	//Adapted from Spectrogram.js by Miguel Mota https://github.com/miguelmota/spectrogram
	draw = () => {

		var width = this.canvas.width;
		var height = Math.floor(this.canvas.height);

		var tempCanvasContext = this.offscreenctx;
		var tempCanvas = tempCanvasContext.canvas;
		tempCanvasContext.drawImage(this.canvas, 0, 0, width, height);
		var data = [...this.latestData]; //set spectrogram.latestData = [...newdata]

		if(data.length !== height){ //Fit data to height
			var interp = data;
			data = this.interpolateArray(interp,height);
		}

		var offset = 0;
		if(this.offset === true) {
			offset = Math.pow(10,Math.floor(Math.log10(Math.min(...data))));
		}
		if(this.dynNormalize === true) {
			this.normalizeFactor = 1/Math.pow(10,Math.floor(Math.log10(Math.max(...data))+.5));
		}

		for (var i = 0; i < data.length; i++) {
			var value = Math.floor((data[i]-offset)*this.normalizeFactor*255);
			if(value > 255) { value = 255; }
			else if (value < 0) { value = 0;}
			this.ctx.fillStyle = this.colorScale[value];
			this.ctx.fillRect(width - 1, height - i, 1, 1);
		}
		if(this.reset === false){
			this.ctx.translate(-1, 0);
			// draw prev canvas before translation
			this.ctx.drawImage(tempCanvas, 0, 0, width, height);
			// reset transformation matrix
		  	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		else { this.reset = false; }
	}

	animate = () => {
		this.draw();
		setTimeout(()=>{if(this.anim !== "cancel") {this.anim = requestAnimationFrame(this.animate);}},this.animationDelay);
	}
}




//Simple dynamic triangle mesh generation of spectrogram data.
export class Spectrogram3D {
	constructor(canvas, peakAmp = 1) {
		if (typeof canvas === 'string') {
			this.canvasId = canvas;
			this.canvas = document.getElementById(canvas);
		} else {
			this.canvas = canvas
		}
		this.ctx = this.canvas.getContext("webgl");

		this.currentAmplitudes = []; //z-axis
		this.lastAmplitudes = [];
		this.frequencies = []; //x-axis

		this.peakAmp = peakAmp;

		this.triangleMesh = []; //Render with GL.TRIANGLES set
		this.colorMesh = [];
		this.nSegments = 0;
		this.meshMaxSegments = 50;

		this.animationDelay = 50;
	}

	setColorFromIntensity(intensity) {
		if(intensity < 0.3334) {
			return (0,intensity*765,intensity*255);
		}
		else if (intensity < 0.6664 && intensity > 0.3334) {
			return ((0.6664-intensity)*255,intensity*128,1.5*intensity*255);
		}
		else {
			return (intensity*255,0,(1-intensity)*255);
		}
	}

	//Input frequency domain amplitude spectrum of two time steps. Returns vertices and colors
	gen3DVerticesStep(frequencies, amplitudes1, amplitudes2, offset=0) {

		let Triangles = [];
		let Colors = [];

		for(let i=0; i<frequencies.length-1; i++) { //List of vec3's

			Triangles.push(
				frequencies[i],  offset,  amplitudes1[i],
				frequencies[i+1],offset,  amplitudes1[i+1],
				frequencies[i],  offset+1,amplitudes2[i],
				frequencies[i],  offset+1,amplitudes2[i],
				frequencies[i+1],offset+1,amplitudes2[i+1],
				frequencies[i+1],offset,  amplitudes1[i+1]
			);

			var peak1 = 	amplitudes1[i]/this.peakAmp;
			var peak1_2 = 	amplitudes1[i+1]/this.peakAmp;
			var peak2 = 	amplitudes2[i]/this.peakAmp;
			var peak2_2 = 	amplitudes2[i+1]/this.peakAmp;

			if(peak1 > 1) {peak1 = 1;} else if(peak1 < 0) {peak1 = 0;}
			if(peak1_2 > 1) {peak1_2 = 1;} else if(peak1_2 < 0) {peak1_2 = 0;}
			if(peak2 > 1) {peak2 = 1;} else if(peak2 < 0) {peak2 = 0;}
			if(peak2_2 > 1) {peak2_2 = 1;} else if(peak2_2 < 0) {peak2_2 = 0;}

			Colors.push(
				setColorFromIntensity(peak1),
				setColorFromIntensity(peak1_2),
				setColorFromIntensity(peak2),
				setColorFromIntensity(peak2),
				setColorFromIntensity(peak2_2),
				setColorFromIntensity(peak1_2)
			)
		}

		return [Triangles, Colors];
	}

	//Latest data at y=0, last data at y=this.nSegments+1
	step( newAmplitudes = this.currentAmplitudes, newFrequencies = this.frequencies ) {
		this.lastAmplitudes = this.currentAmplitudes
		this.currentAmplitudes = newAmplitudes;
		this.frequencies = newFrequencies;

		if(this.nSegments > 0) {
			this.triangleMesh.map((item, idx) => {if((idx-1) % 3 === 0) item = item+1;} ); //scroll the mesh along the y axis
		}

		var genStep = this.gen3DVerticesStep(this.frequencies,this.lastAmplitudes,this.currentAmplitudes)

		this.triangleMesh.push(...genStep[0]);
		this.colorMesh.push(...genStep[1]);

		if(this.nSegments === this.meshMaxSegments) {
			this.triangleMesh.splice(0,this.frequencies.length*6);
			this.colorMesh.splice(0,this.frequencies.length*6);
		}
		else {
			this.nSegments++;
		}
	}

	//Run this then
	animate = () => {
		setTimeout(() => {requestAnimationFrame(this.step);},this.animationDelay);
	}


}

