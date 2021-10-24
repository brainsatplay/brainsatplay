//By Joshua Brewster (AGPL)


/**
 * Math2 Contains All Static Methods
 * We'll add more useful static things like filter kernels etc. as we get to making them.
 * 
 * //Just type these and the variable inputs that pop up should be easy to follow. Everything is commented otherwise till we document it
 * genSineWave() //generate a sine wave
 * getSineAmplitude() //get amplitude of a sine at time t
 * mean() //array mean
 * mode() //array mode
 * std() //standard dev
 * relError() //relative error
 * informationEntropy() //trying to build a maxent distribution off of this stuff
 * zscore() //array z score
 * variance() //variance
 * dot() //dot product
 * cross3D() //3d cross product
 * magnitude() //vector magnitude
 * distance() //distance function p1-p2
 * normalize() //array normalization
 * newtonsMethod() //root approximation
 * integral() //1d integral
 * dintegral() //2d integral
 * tintegral() //3d integral
 * pintegral() //2d path integral
 * makeVec() 
 * transpose(mat) //2d mat transpose
 * matmul(a,b) 
 * matscale(mat,scalar)
 * matadd(a,b)
 * matsub(a,b)
 * normalDistribution(samples=[], normalize=true) //create a norall (gaussian) distribution
 * expectedValue(samples=[],probabilities=this.normalDistribution(samples)) //get expected value of an array
 * originMoment(samples=[],probabilities=this.normalDistribution(samples),order=1) //statistical moment about origin
 * centralMoment(samples=[],probabilities=this.normalDistribution(samples),order=1) //statistical moment about mean
 * linearDiscriminantAnalysis(samples=[], classifier=[]) //LDA
 * conv1D(arr=[],kern=[],pad=0) //1d convolution //1d convolution
 * conv2D(mat=[[],[],[]],kern=[[],[],[]],pad=0) //2d convolution
 * cov2d(mat) //2d covariance
 * cov1d(arr1=[],arr2=[]) //1d covariance
 * cov3d(x=[],y=[],z=[]) //3d covariance
 * covNd(dimensionalData=[]) //nd covariance
 * eigens2x2(mat=[[1,2],[3,4]]) //fast 2x2 eigenvalue 
 * eigenvectors2x2(mat=[[1,2],[3,4]], eigens=[1,2]) //fast 2x2 eigenvector 
 * fastpca2d(xarr,yarr) //fast 2d pca
 * crosscorrelation(arr1,arr2) //crosscor
 * autocorrelation(arr1) //autocor
 * correlograms(dat=[[],[]]) //return cross correlations of many signals
 * sma(arr=[], window) //simple moving average 
 * sum(arr=[]) //array sum
 * reduceArrByFactor(arr,factor=2) //reduce array sizes
 * makeArr(startValue, stopValue, nSteps) //linspace
 * interpolateArray(data, fitCount, scalar=1) 
 * isExtrema(arr,critical='peak') //peak or valley
 * isCriticalPoint(arr,critical='peak') //peak, valley
 * peakDetect = (smoothedArray,type='peak',window=49) //wider window to find less peaks
 * getPeakThreshold(arr, peakIndices, thresholdVar)
 * 
 * eigens(M=[[],[]], tolerance=0.0001, max_iterations=1000)
 * pca(mat=[[],[]],tolerance = 0.00001) //power iteration method PCA
 * eigenvalue_of_vector(mat, eigenvector)
 * power_iteration(mat, tolerance=0.00001, max_iterations=1000)
 * squared_difference(v1, v2)
 * flatten_vector(v) //column to row
 * column(mat, x) //row to column
 * 
 */



export class Math2 {
	constructor() {

	}

	//----------------------------------------------------------------
	//-------------------- Static Variables---------------------------
	//----------------------------------------------------------------

	//Throwing a bunch in here for the hell of it
	static TWO_PI = Math.PI*2; 			//2PI
	static C = 299792458; 				//speed of light m/s
	static G = 6.67430e-11; 			//Newton's gravitation constant N*m^2 / kg^2
	static h = 6.62607015e-34; 			//Planck constant J*s
	static R = 8.31432e3; 				//Universal gas constant J / kg*mol*K
	static Ra = 287; 					//Air gas constant J / kg*K
	static H = 69.3; 					//Hubble constant km/s/Mpc 
	static kbar = 1.054571817e-34; 		//Dirac constant J*s
	static kB = 1.380649e-23; 			//Boltzmann constant J/K
	static ke = 8.9875517923e9; 		//Coulomb constant kg * m^3 * s^-2 * C^-2
	static me = 9.1093837015e-31; 		//electron mass kg
	static mp = 1.67262192369e-27; 		//proton mass kg
	static mn =	1.67492749804e-27; 		//neutron mass kg
	static P0 = 1.01325e5; 				//Sea level pressure N/m^2
	static T0 = 288.15; 				//Sea level room temperature K
	static p0 = 1.225; 					//Sea level air density kg/m^3
	static Na = 6.0220978e23; 			//Avogadro's number 1 / kg*mol
	static y = 1.405; 					//Adiabatic constant
	static M0 = 28.96643; 				//Sea level molecular weight
	static g0 = 9.80665; 				//Sea level gravity m/s^2
	static Re = 6.3781e6; 				//Earth radius m
	static B = 1.458e-6; 				//Thermal constant Kg / m*s*sqrt(kg)
	static S = 110.4; 					//Sutherland's constant K
	static Sigma = 3.65e-10; 			//Collision diameter of air m

	static imgkernels = {
		edgeDetection: [
		  [-1, -1, -1],
		  [-1,  8, -1],
		  [-1, -1, -1]
		], boxBlur: [
		  [1/9, 1/9, 1/9],
		  [1/9, 1/9, 1/9],
		  [1/9, 1/9, 1/9]
		], sobelLeft: [
		  [1,  0, -1],
		  [2,  0, -2],
		  [1,  0, -1]
		], sobelRight: [
		  [-1, 0, 1],
		  [-2, 0, 2],
		  [-1, 0, 1]
		], sobelTop: [
		  [1,  2,   1],
		  [0,  0,   0],
		  [-1, -2, -1] 
		], sobelBottom: [
		  [-1, 2, 1],
		  [0,  0, 0],
		  [1,  2, 1]
		], identity: [
		  [0, 0, 0],
		  [0, 1, 0], 
		  [0, 0, 0]
		], gaussian3x3: [
		  [1,  2,  1],
		  [2,  4,  2], 
		  [1,  2,  1]
		], guassian7x7: [
		  [0, 0,  0,   5,   0,   0,  0],
		  [0, 5,  18,  32,  18,  5,  0],
		  [0, 18, 64,  100, 64,  18, 0],
		  [5, 32, 100, 100, 100, 32, 5],
		  [0, 18, 64,  100, 64,  18, 0],
		  [0, 5,  18,  32,  18,  5,  0],
		  [0, 0,  0,   5,   0,   0,  0],
		], emboss: [
		  [-2, -1,  0],
		  [-1,  1,  1], 
		  [ 0,  1,  2]
		], sharpen: [
		  [0, -1,   0],
		  [-1,  5, -1],
		  [0, -1,   0]
		]
	  };

	//----------------------------------------------------------------
	//-------------------- Static Functions --------------------------
	//----------------------------------------------------------------

	//Generate sinewave, you can add a noise frequency in too. Array length will be Math.ceil(fs*nSec)
	static genSineWave(freq=20,peakAmp=1,nSec=1,fs=512,freq2=0,peakAmp2=1){
		var sineWave = [];
		var t = [];
		var increment = 1/fs; //x-axis time increment based on sample rate
		for (var ti = 0; ti < nSec; ti+=increment){
			var amplitude = Math.sin(2*Math.PI*freq*ti)*peakAmp;
			amplitude += Math.sin(2*Math.PI*freq2*ti)*peakAmp2; //Add interference
			sineWave.push(amplitude);
			t.push(ti);
		}
		return [t,sineWave]; // [[times],[amplitudes]]
	}

	//get the sine amplitude at a particular time (seconds)
	static getSineAmplitude(frequency=20,peakAmplitude=1,ti=0, tOffset=0) {
		return Math.sin(this.TWO_PI*frequency*ti+tOffset)*peakAmplitude;
	}

	//average value of array
	static mean(arr){
		var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum / arr.length;
	}

	//array mode (most commonly occurring number)
	static mode(arr){
		return arr.sort((a,b) =>
			  arr.filter(v => v===a).length
			- arr.filter(v => v===b).length
		).pop();
	}

	//standard deviation
	static std(arr,mean=undefined){
		let avg = mean; 
		if(!mean) avg = this.mean(arr);
		let summed = 0;
		for(let i = 0; i<arr.length; i++) {
			let subbed = arr[i] - avg;
			summed += subbed*subbed;
		}
		
		return Math.sqrt(summed/arr.length);
	}

	//find the relative error of predicted results
	static relError(actual=[],forecast=[],abs=true) {
		if(actual.length !== forecast.length) throw new Error('Input arrays of same length!');
		let i = actual.length;
		let d = []; //relative errors
		for(let j = 0; j<i; j++) {
			let dd = (actual[j] - forecast[j])/actual[j];
			if(abs) dd = Math.abs(dd);
			d.push(dd);
		}
		return d;
	}

	//returns information entropy in natural units (base e)
	static informationEntropy(probabilities=[]) {
		let entropy = [];
		let len = probabilities.length;
		for(let i = 0; i < len; i++) {
			let ent = probabilities[i]*Math.log(probabilities[i]);
			if(isNaN(ent)) ent = 0;
			entropy.push(ent);
		}

		return entropy;
	}

	//array zscore (probabilities)
	static zscore(arr){
		let mean = this.mean(arr);
		let std = this.std(arr,mean);
		let z = [];
		for (let i = 0; i<arr.length; i++) {
			z.push((arr[i]-mean) / std);
		}

		return z;
	}

	static variance(arr) { //Variance of 1D input arrays of length n
		var mean = this.mean(arr);
		return arr.reduce((a,b) => a + ((b - mean)**2), 0)/arr.length;
	}

	static dot(vec1,vec2) { //nDimensional vector dot product
        var dot=0;
        for(var i=0; i<vec1.length; i++) {
            dot += vec1[i]*vec2[i];
        }
		return dot;
    }

    static cross3D(vec1,vec2) { //3D vector cross product
        return [
            vec1[1]*vec2[2]-vec1[2]*vec2[1], //x
            vec1[2]*vec2[0]-vec1[0]*vec2[2], //y
            vec1[0]*vec2[1]-vec1[1]*vec2[0]  //z
		];
    }

    static magnitude(vec) { //nDimensional magnitude
        var sqrd = 0;
        vec.forEach((c) => {
            sqrd+=c*c;
        })
        return Math.sqrt(sqrd)
    }

    static distance(point1, point2) { //nDimensional vector distance function
        var dsqrd = 0;
        point1.forEach((c,i) => {
            dsqrd += (point2[i] - c)*(point2[i] - c);
        })
        return Math.sqrt(dsqrd);
    }
	static normalize(vec) { //nDimensional vector normalization
        var norm = 0;
        norm = this.magnitude(vec);
        var vecn = [];
        vec.forEach((c,i) => {
            vecn.push(c*norm);
        })
        return vecn;
    }

	//return the quadratic roots based on your input ax^2 + bx + c = 0
	static quadraticFormula(a,b,c) {
		let bbmac4 = Math.sqrt(b*b-4*a*c);
		if(!isNaN(bbmac4)) return ['complex','complex'];
		let _a2 = 1/(2*a);
		if(bbmac4 === 0) return [b*_a2];
		let nb = -b;
		return [(nb + bbmac4)*_a2,((nb - bbmac4)*_a2)];
	}

	//approximation of function roots. Provide a function (1d), window, and precision and it will return approximate roots along that window
	static newtonsMethod(foo=(x)=>{return Math.pow(x,5) + x*x - x - 0.2}, start=0,end=1, precision=0.01, attempts=10) {
		let roots = [];

		for(let i = 0; i < attempts; i++) {
			let seedx = Math.random()*(end-start);	
			let guess = foo(seedx);
			let guess2 = foo(seedx + precision);
			let slope = (guess2 - guess)/precision;

			let xn = seedx+precision;
			while((Math.abs(slope) > precision)) {
				let step = -guess/slope;
				let xn1 = xn+step;
				guess = guess2;
				guess2 = foo(xn1);
				let slope = (guess2 - guess)/(xn1-xn);
			}

			let idx;
			let f = roots.find((root,i) => {
				if(Math.abs(xn1 - root) < precision) {
					idx = i;
					return true;
				}
			});
			if(f) roots[idx] = (xn1 + f)*0.5;
			else roots.push(xn1);
		}
		return roots;
	}

	//2D integral approximation using rectangular area under the curve. If you need absolute values be sure to return that.
    static integral = (func=(x)=>{ let y=x; return y;}, range=[], stepx=0.01) => {
        let area = 0;
        for(let i = range[0]; i<range[1]; i+=stepx) {
            let y=func(i);
            area += y*stepx;
        }
        return area;
    }

    //3D double integral approximation
    static dintegral = (func=(x,y)=>{ let z = x+y; return z;}, range=[[],[]], stepx=0.01,stepy=stepx) => {
        let volume = 0;
        for(let i = range[0][0]+stepx; i<range[0][1]; i+=stepx) {
            for(let j = range[1][0]+stepy; j<range[1][1]; j+=stepy) {
                let z=func(i,j);
                volume += z*stepx*stepy;
            }
        }
        return volume;
    }

    //4D triple integral approximation
    static tintegral = (func=(x,y,z)=>{ let w=x+y+z; return w;}, range=[[],[],[]], stepx=0.01, stepy=stepx, stepz=stepx) => {
        let volume = 0;
        for(let i = range[0][0]+stepx; i<range[0][1]; i+=stepx) {
            for(let j = range[1][0]+stepy; j<range[1][1]; j+=stepy) {
                for(let k = range[2][0]+stepz; k<range[2][1]; k+=stepz) {
                    let w=func(i,j,k);
                    volume += w*stepx*stepy*stepz;
                }
            }
        }
        return volume;
    }

    //2D path integral approximation (the length of a curve)
    static pintegral = (func=(x)=>{ let y=x; return y; }, range=[], stepx=0.01) => {
        let length = 0;
        let y0 = undefined;
        let yi = undefined;
        for(let i = range[0]; i<range[1]; i+=stepx) {
            y0 = yi;
            yi = func(i);
            if(y0)
                length += this.distance([0,y0],[stepx,yi]);
        }
        return length;
    }

    static makeVec(point1,point2) {  //Make vector from two nDimensional points (arrays)
        var vec = [];
        point1.forEach((c,i) => {
            vec.push(point2[i]-c);
        })
        return vec;
    }

	static transpose(mat){
		return mat[0].map((_, colIndex) => mat.map(row => row[colIndex]));
	}

	//2D Matrix multiplication from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
	static matmul(a, b) {
		var aNumRows = a.length, aNumCols = a[0].length,
			bNumRows = b.length, bNumCols = b[0].length,
			m = new Array(aNumRows);  // initialize array of rows
		for (var r = 0; r < aNumRows; ++r) {
		  m[r] = new Array(bNumCols); // initialize the current row
		  for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
			  m[r][c] += a[r][i] * b[i][c];
			}
		  }
		}
		return m;
	}

	//Apply scalar to 2D matrix 
	static matscale(mat,scalar) {
		let m = [];
		for (var i = 0; i < mat.length; i++) {
			m[i] = [];
			for (let j = 0; j < mat[0].length; j++) {
				m[i][j] = mat[i][j] * scalar;
			}
		}
		return m;
	}

	//2d matrix addition
	static matadd(a,b) {
		let m = [];
		for (let i = 0; i < a.length; i++) {
			m[i] = [];
			for (var j = 0; j < a[0].length; j++) {
				m[i][j] = a[i][j] + b[i][j];
			}
		}
		return m;
	}

	//2d matrix subtraction
	static matsub(a,b) {
		let m = [];
		for (let i = 0; i < a.length; i++) {
			m[i] = [];
			for (var j = 0; j < a[0].length; j++) {
				m[i][j] = a[i][j] - b[i][j];
			}
		}
		return m;
	}

	//return a histogram of the array, use nBins to override binSize
	static histogram(arr=[], binSize=1, nBins=undefined) {  
		let copy = [...arr]; 
		copy.sort(function(a, b){return a - b}); //ascending sort
		let binStart = Math.min(...copy);
		if(typeof nBins === 'number') {
			let binEnd = Math.max(...copy);
			binSize = Math.abs((binEnd - binStart) / (nBins-1));
		} 
		let j = binStart;
		let binx = [];
		let biny = [];
		for(let i = 0; i < copy.length; i++) {
			let binidx = binSize*j;
			if(copy[i] > binStart+binidx) { 
				j++; 
				binidx+=binSize; 
				let binmin = binStart+binidx;
				let binmid = binmin + binidx*0.5;
				binx.push(binmid);
				biny.push(0);
			}
			biny[biny.length-1]++;
		}

		return [binx,biny];
	}


	//Get probability densities for the samples, set a cutoff to avoid obscenely small numbers
	static normalDistribution(samples=[], normalize=true, cutoff = 0.0001) {
		let m = this.mean(samples);
		let vari = this.variance(samples);
		let nSamples = samples.length;

		let probabilities = [];

		let denom = 1/(this.TWO_PI*vari);
		let _variance = 1/vari;
		let sum = 0; //for normalization
		for (let i = 0; i < nSamples; i++) {
			let px = Math.exp(-0.5*Math.pow((samples[i]-m)*_variance,2))*denom
			if(px < cutoff) px = 0;
			probabilities.push(px);
			sum += px;
		}
		if(normalize) {
			let _sum = 1/sum;
			probabilities = probabilities.map(x => x*_sum);
		}
	
		return probabilities;
	}

	static expectedValue(samples=[],probabilities=this.normalDistribution(samples)) {
		return samples.reduce((sum,item,idx) => sum + item*probabilities[idx]);
	}

	//moment about the origin (statistics)
	static originMoment(samples=[],probabilities=this.normalDistribution(samples),order=1) {
		return samples.reduce((sum,item,idx) => sum + Math.pow(item,order)*probabilities[idx]);
	}

	//moment about the population mean (statistics)
	static centralMoment(samples=[],probabilities=this.normalDistribution(samples),order=1) {
		let m = this.mean(samples);
		return samples.reduce((sum,item,idx) => sum + Math.pow((item-m),order)*probabilities[idx]/samples.length);
	}

	static linearDiscriminantAnalysis(samples=[], classifier=[]) {
		let mean = this.mean(samples);
		let meank = this.mean(classifier);
		let covariance = this.cov1d(samples,classifier);
		let probs = this.normalDistribution(samples);

		let dk = [];
		for(let i = 0; i < samples.length; i++){ 
			dk.push(x[i]*covariance*meank - .5*mean*covariance*meank + Math.log10(probs[i]));
		}

		return dk;
	}

	//1D convolution (filtering)
	static conv1D(arr=[],kern=[1/3,1/3,1/3],pad=Math.floor(kern.length*0.5)) {
		let result = [];
		let _n = 1/kern.length;

		if(pad > 0) {
			let pads = new Array(pad).fill(0);
			arr = [...pads,...arr,...pads];
		}

		let start = Math.floor(kern.length*0.5); //offset since kernel will reduce size of array
		let end = arr.length - kern.length + start; //end index

		for(let i = start; i < end; i++) {
			let acc = 0;
			for(let j = 0; j < kern.length; j++) {
				acc += arr[i-start] * kern[j];
			}
			result.push(acc* _n);
		}

		return result;
	}	

	//2D convolution (filtering), input 2d mat and 2d kernel 
	static conv2D(mat=[[],[],[]],kern=[[],[],[]],pad=0) {
		let result = new Array(mat.length - Math.ceil(kern.length*0.5)).fill([]);
		
		let mat_t;
		let kern_t = Math2.transpose(kern_t);

		if(pad > 0) {
			let pads = new Array(pad).fill(0);

			//transpose to col/row
			mat_t = Math2.transpose(mat); //hard copy
			for(let i = 0; i < mat_t.length; i++) {
				mat_t[i] = [...pads,...mat_t[i],...pads];
			}

			//transpose back
			mat = Math2.transpose(mat_t);
			for(let j = 0; j < mat.length; j++) {
				mat[j] = [...pads,...mat[j],...pads];
			}
 
		}

		
		let startr = Math.floor(kern[0].length*0.5); //offset since kernel will reduce size of array
		let startl = Math.floor(kern_t[0].length*0.5); //offset since kernel will reduce size of array

		let endr = mat[0].length - kern[0].length + startr; //row end
		let endl = mat_t[0].length - kern_t[0].length + startl; //column end

		let _n = 1/(kern[0].length*kern_t[0].length);

		let iters = endr*endl; //number of convolutions to perform

		let i = startr;
		let x; let y=startl;
		while(i < iters) {
			let acc = 0;
			x = i % mat[0].length;
			if(x === 0) {
				y++;
			}

			for(let j = 0; j < kern[0].length; j++) {
				for(let k = 0; k < kern_t[0].length; j++) {
					acc += mat[y-startl+k][x-startr+j] * kern[k][j];
				}

				result[y].push(acc*_n);
			}
			
			i++;
		}
		
		return result;

	}	

	//2D matrix covariance (e.g. for lists of signals). Pretty fast!!!
	static cov2d(mat) { //[[x,y,z,w],[x,y,z,w],...] input list of vectors of the same length
		//Get variance of rows and columns
		//console.time("cov2d");
		var mattransposed = this.transpose(mat);
		//console.log(mattransposed)
		var matproducts = [];

		var rowmeans = [];
		var colmeans = [];

		mat.forEach((row, idx) => {
			rowmeans.push(this.mean(row));
		});

		mattransposed.forEach((col,idx) => {
			colmeans.push(this.mean(col));
		});

		mat.forEach((row,idx) => {
			matproducts.push([]);
			for(var col = 0; col < row.length; col++){
				matproducts[idx].push((mat[idx][col]-rowmeans[idx])*(mat[idx][col]-colmeans[col])/(row.length - 1));
			}
		});

		/*
			mat[y][x] = (x - rowAvg)*(x - colAvg) / (mat[y].length - 1);
		*/

		//console.log(matproducts);
		//Transpose matrix
		var matproductstransposed = this.transpose(matproducts);

		//Matrix multiplication, stolen from: https://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
		var aNumRows = matproducts.length, aNumCols = matproducts[0].length,
			bNumRows = matproductstransposed.length, bNumCols = matproductstransposed[0].length,
			m = new Array(aNumRows);  // initialize array of rows
		for (var r = 0; r < aNumRows; ++r) {
		  m[r] = new Array(bNumCols); // initialize the current row
		  for (var c = 0; c < bNumCols; ++c) {
			m[r][c] = 0;             // initialize the current cell
			for (var i = 0; i < aNumCols; ++i) {
			  m[r][c] += matproducts[r][i] * matproductstransposed[i][c] / (mat[0].length - 1); //divide by row length - 1
			}
		  }
		}
		//console.timeEnd("cov2d");
		return m; //Covariance matrix
	}


	//Covariance between two 1D arrays
	static cov1d(arr1=[],arr2=[]) {
		return this.cov2d([arr1,arr2]);
	}

	//3d covariance
	static cov3d(x=[],y=[],z=[]) {
		return [
			[this.cov1d(x,x),this.cov1d(x,y),this.cov1d(x,z)],
			[this.cov1d(y,x),this.cov1d(y,y),this.cov1d(y,z)],
			[this.cov1d(z,x),this.cov1d(z,y),this.cov1d(z,z)]
		];
	}

	//n-dimensional covariance matrix
	static covNd(dimensionalData=[]) {
		let covariance = [];
		dimensionalData.forEach((arr,i)=>{
			covariance.push([]);
			dimensionalData.forEach((arr2,j)=>{
				covariance[i].push(this.cov1d(arr,arr2));
			});
		});
	}

	//fast 2x2 eigenvalue calculator: https://www.youtube.com/watch?v=e50Bj7jn9IQ
	static eigens2x2(mat=[[1,2],[3,4]]) {
		let det = mat[0][0]*mat[1][1] - mat[0][1]*mat[1][0];
		let mean = (mat[0][0]+mat[1][1])*.5;

		let sqrt = Math.sqrt(mean*mean - det);
		let eig1 = mean + sqrt;
		let eig2 = mean - sqrt;

		return [eig1, eig2];
	}

	//http://math.colgate.edu/~wweckesser/math312Spring06/handouts/IMM_2x2linalg.pdf
	static eigenvectors2x2(mat=[[1,2],[3,4]], eigens=[1,2]) {
		let v1 = [-mat[0][1], mat[0][0]-eigens[0]];
		if(v1[0] === 0 && v1[1] === 0) {
			v1[0] = mat[1][1]-eigens[0];
			v1[1] = -mat[1][0];
		}
		let v2 = [-mat[0][1], mat[0][0]-eigens[1]];
		if(v2[0] === 0 && v2[1] === 0) {
			v2[0] = mat[1][1]-eigens[1];
			v2[1] = -mat[1][0];
		}
		return [v1, v2];
	}

	//Fast PCA for 2D datasets https://towardsdatascience.com/a-one-stop-shop-for-principal-component-analysis-5582fb7e0a9c
	static fastpca2d(xarr,yarr){
		let cov1d = this.cov1d(xarr,yarr); //yields a 2x2 matrix
		let eigs = this.eigens2x2(cov1d);
		if(eigs[1] > eigs[0]) eigs.reverse();
		let evs = this.eigenvectors2x2(cov1d,eigs);

		console.log(eigs,evs)
		return [eigs,evs];
	}

	//Simple cross correlation.
	static crosscorrelation(arr1,arr2) {

		//console.time("crosscorrelation");
		var arr2buf = [...arr2,...Array(arr2.length).fill(0)];
		var mean1 = this.mean(arr1);
		var mean2 = this.mean(arr2);

		//Estimators
		var arr1Est = arr1.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr1Est = Math.sqrt(arr1Est);
		var arr2Est = arr2.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr2Est = Math.sqrt(arr2Est);

		var _arrEstsMul = 1/(arr1Est * arr2Est);
		var correlations = new Array(arr1.length).fill(0);

		for(var delay = 0; delay < arr1.length; delay++) {
			var r = arr1.reduce((sum,item,i) => sum += (item - mean1)*(arr2buf[delay+i]-mean2));
			correlations[delay] = r*_arrEstsMul;
		}

		//console.timeEnd("crosscorrelation");
		return correlations;
	}

	//Simple autocorrelation. Better method for long series: FFT[x1] .* FFT[x2]
	static autocorrelation(arr1) {
		var delaybuf = [...arr1,...Array(arr1.length).fill(0)];
		var mean1 = this.mean(arr1);

		//Estimators
		var arr1Est = arr1.reduce((sum,item) => sum += Math.pow(item-mean1,2));
		arr1Est = Math.sqrt(arr1Est);

		var _arr1estsqrd = 1/(arr1Est * arr1Est);
		var correlations = new Array(arr1.length).fill(0);

		for(var delay = 0; delay < arr1.length; delay++) {
			var r = arr1.reduce((sum,item,i) => sum += (item - mean1)*(delaybuf[delay+i]-mean1));
			correlations[delay] = r*_arr1estsqrd;
		}

		return correlations;
	}

	//Compute correlograms of the given array of arrays (of equal length). Input array of equal length arrays of latest raw data (use dat = eeg32instance.getTaggedRawData())
	static correlograms(dat=[[],[]]) {//Coherence network math for data pushed to the atlas
		var correlograms = []; //auto and cross correlations for each channel
		dat.forEach((row1,i) => {
			dat.forEach((row2,j) => {
				if(j >= i) {
					correlograms.push(Math2.crosscorrelation(row1,row2));
				}
			})
		});
		return correlograms; //Output ordered like (tag1:tag1, tag1:tag2 ... tag2:tag2, tag2:tag3 ... tagn:tagn) where autocorrelograms are also included
	}

	//Input data and averaging window, output array of moving averages (should be same size as input array, initial values not fully averaged due to window)
	static sma(arr=[], window) {
		var smaArr = []; //console.log(arr);
		for(var i = 0; i < arr.length; i++) {
			if((i == 0)) {
				smaArr.push(arr[0]);
			}
			else if(i < window) { //average partial window (prevents delays on screen)
				var arrslice = arr.slice(0,i+1);
				smaArr.push(arrslice.reduce((previous,current) => current += previous ) / (i+1));
			}
			else { //average windows
				var arrslice = arr.slice(i-window,i);
				smaArr.push(arrslice.reduce((previous,current) => current += previous) / window);
			}
		}
		//console.log(temp);
		return smaArr;
	}

	static sum(arr=[]){
		if (arr.length > 0){
			var sum = arr.reduce((prev,curr)=> curr += prev);
		return sum;
		} else {
			return 0;
		}
	}

	static reduceArrByFactor(arr,factor=2) { //faster than interpolating
        let x = arr.filter((element, index) => {
            return index % factor === 0;
        });
        return x;
    }

	//Make an array of size n from a to b 
    static makeArr(startValue, stopValue, nSteps) {
        var arr = [];
        var step = (stopValue - startValue) / (nSteps - 1);
        for (var i = 0; i < nSteps; i++) {
          arr.push(startValue + (step * i));
        }
        return arr;
    }

	//Linear interpolation from https://stackoverflow.com/questions/26941168/javascript-interpolate-an-array-of-numbers. Input array and number of samples to fit the data to
	static interpolateArray(data, fitCount, scalar=1) {

		var linearInterpolate = function (before, after, atPoint) {
			return (before + (after - before) * atPoint)*scalar;
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

	static isExtrema(arr,critical='peak') { //Checks if the middle point of the (odd-numbered) array is a local extrema. options: 'peak','valley','tangent'. Even numbered arrays are popped
        let ref = [...arr];
		if(ref.length%2 === 0) ref.pop();
        if(arr.length > 1) { 
            let pass = true;
            for(let i = 0; i < ref.length; i++) {
                let val = ref[i];
                if(critical === 'peak') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                        break;
                    } else if (i > Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                        break;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] ) {
                        pass = false;
                        break;
                    } else if (i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)]) {
                        pass = false;
                        break;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                        break;
                    } else if ((i > Math.floor(ref.length*.5) && val <= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                        break;
                    }
                } //|| (i < ref.length*.5 && val <= 0 ) || (i > ref.length*.5 && val > 0)
            }
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                for(let i = 0; i < ref.length; i++) {
                    let val = ref[i];
                    if((i <  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)] )) {
                        pass = false;
                        break;
                    } else if ((i >  Math.floor(ref.length*.5) && val >= ref[Math.floor(ref.length*.5)])) {
                        pass = false;
                        break;
                    }
                }
            }
            return pass;
        } else return undefined;
    }

    static isCriticalPoint(arr,critical='peak') { //Checks if the middle point of the (odd-numbered) array is a critical point. options: 'peak','valley','tangent'. Even numbered arrays are popped
        let ref = [...arr];
		if(ref.length%2 === 0) ref.pop();
        if(arr.length > 1) { 
            let pass = true;
            for(let i = 0; i < ref.length; i++) {
                let val = ref[i];
                if(critical === 'peak') { //search first derivative
                    if(i < ref.length*.5 && val <= 0 ) {
                        pass = false;
                        break;
                    } else if (i > ref.length*.5 && val > 0) {
                        pass = false;
                        break;
                    }
                } else if (critical === 'valley') { //search first derivative
                    if(i < ref.length*.5 && val >= 0 ) {
                        pass = false;
                        break;
                    } else if (i > ref.length*.5 && val < 0) {
                        pass = false;
                        break;
                    }
                } else { //look for tangents (best with 2nd derivative usually)
                    if((i < ref.length*.5 && val >= 0 )) {
                        pass = false;
                        break;
                    } else if ((i > ref.length*.5 && val < 0)) {
                        pass = false;
                        break;
                    }
                }
            }
            if(critical !== 'peak' && critical !== 'valley' && pass === false) {
                pass = true;
                for(let i = 0; i < ref.length; i++) {
                    let val = ref[i];
                    if((i < ref.length*.5 && val <= 0 )) {
                        pass = false;
                        break;
                    } else if ((i > ref.length*.5 && val > 0)) {
                        pass = false;
                        break;
                    }
                }
            }
            return pass;
        } else return undefined;
    }

	//returns array of indices of detected peaks/valleys
    static peakDetect = (smoothedArray,type='peak',window=49) => {
        let mid = Math.floor(window*.5);
        let peaks = [];
        //console.log(smoothedArray.length-window)
        for(let i = 0; i<smoothedArray.length-window; i++) {
            let isPeak = this.isExtrema(smoothedArray.slice(i,i+window),type);
            if(isPeak) {
                peaks.push(i+mid-1);
            }
        }
        return peaks;
    }

	//gets a mean threshold based on peaks in an array
    static getPeakThreshold(arr,peakIndices, thresholdVar) {
        let threshold;
        let filtered = arr.filter((o,i)=>{if(peakIndices.indexOf(i)>-1) return true;});
        if(thresholdVar === 0) {
            threshold = this.mean(filtered); 
        } else threshold = (thresholdVar+this.mean(filtered))*0.5;  
        
        return threshold;
    }

	//-------------------------------------------------------------



	//The following n-dimensional Eigenvalue/PCA Math was adapted from: https://github.com/johnmihalik/eigenvector/blob/master/pca.js
	static column(mat, x) {
		let col = new Array(mat.length).fill(0).map(() => new Array(1).fill(0));
		for (let i = 0; i < mat.length; i ++) {
			col[i][0] = mat[i][x];
		}
		return col;
	}

	//flatten a vector of 1-value vectors
	static flatten_vector(v) {
		let v_new = [];
		for (let i = 0; i < v.length; i++) {
			v_new[i] = v[i][0];
		}
		return v_new;
	}

	static squared_difference(v1, v2) {
		let sum = 0.0;
		for (let i = 0; i < v1.length; i ++) {
			sum = sum + Math.pow( v1[i] - v2[i], 2 );
		}
		return sum;
	}

	// See: https://math.stackexchange.com/questions/768882/power-method-for-finding-all-eigenvectors
	static shift_deflate(mat, eigenvalue, eigenvector)  {
		let len = Math.sqrt( this.matmul(this.transpose(eigenvector), eigenvector)  );
		let U = this.matscale(eigenvector, 1.0/len);
		let delta = this.matscale( this.matmul(U, this.transpose(U)) , eigenvalue);
		let M_new = this.matsub(mat, delta);
		return M_new;
	}

	static eigenvalue_of_vector(mat, eigenvector) {
		// Xt * M * x
		ev = this.matmul( this.matmul(this.transpose(eigenvector), mat ), eigenvector);
		return ev;
	}

	//Input square 2D matrix
	static power_iteration(mat, tolerance=0.00001, max_iterations=1000) {

		let rank = mat.length;
	
		// Initialize the first guess pf the eigenvector to a row vector of the sqrt of the rank
		let eigenvector = new Array(rank).fill(0).map(() => new Array(1).fill(Math.sqrt(rank)));
	
		// Compute the corresponding eigenvalue
		let eigenvalue = this.eigenvalue_of_vector(mat, eigenvector);
	
		let epsilon = 1.0;
		let iter = 0;
		while (epsilon > tolerance && iter < max_iterations) {
	
			let old_eigenvalue = JSON.parse(JSON.stringify(eigenvalue));
	
			// Multiply the Matrix M by the guessed eigenveector
			let Mv = this.matmul(mat,eigenvector);
	
			// Normalize the eigenvector to unit length
			eigenvector = this.normalize(Mv);
	
			// Calculate the associated eigenvalue with the eigenvector (transpose(v) * M * v)
			eigenvalue = this.eigenvalue_of_vector(mat, eigenvector);
	
			// Calculate the epsilon of the differences
			epsilon = Math.abs( eigenvalue - old_eigenvalue);
			iter++;
	
		};
	
		return [eigenvalue, eigenvector];
	}
	
	//Input square 2D matrix
	static eigens(mat, tolerance=0.0001, max_iterations=1000) {

		let eigenvalues = [];
		let eigenvectors = [];
	
		for (let i = 0; i < mat.length; i++ ) {
	
			// Compute the remaining most prominent eigenvector of the matrix M
			let result = this.power_iteration(mat, tolerance, max_iterations);
	
			// Separate the eigenvalue and vector from the return array
			let eigenvalue = result[0];
			let eigenvector = result[1];
	
			eigenvalues[i] = eigenvalue;
			eigenvectors[i] = this.flatten_vector(eigenvector);
	
			// Now remove or peel off the last eigenvector
			mat = this.shift_deflate(mat, eigenvalue, eigenvector);
		}
	
		return [eigenvalues, eigenvectors];
	}

	//Input square 2D matrix. For eeg data you input a square covariance matrix of the signal data (or the z-scores of the signal data)
	static pca(mat,tolerance = 0.00001) {
		let dims = mat.length;
		
		let t = new Array(dims);
		let p = new Array(dims);

		let mat_t = this.transpose(mat);
		t[0] = this.column(mat,0);
		let epsilon = 1.0;
		let iter = 0;

		while(espilon > tolerance) {
			iter++;
			p[0] = this.matmul(mat_t,t[0]);
			let tp = this.matmul(this.transpose(t[0]),t[0]);
			p[0] = this.matscale(p[0], 1.0 / tp);

			// Normalize p
			let p_length = Math.sqrt(this.matmul(this.transpose(p[0]), p[0]));
			p[0] = this.matscale(p[0], 1.0 / p_length);
	
			let t_new = this.matmul(mat, p[0]);
			let pp = this.matmul(this.transpose(p[0]), p[0]);
			t_new = this.matscale(t_new, 1.0 / pp);
	
			epsilon = this.squared_difference(t[0], t_new);
	
			t[0] = JSON.parse(JSON.stringify(t_new));
		}

		let components = this.matmul(this.transpose(t[0]),t[0]);

		return components;
	}	

	//-------------------------------------------------------------

	//pass in 1 second of raw data ish recommended, desired event timestamps and signals are ordered from least current to most current 
	static p300(event_timestamps=[],raw_signal=[],signal_timestamps=[], sps=256) {
		let smoothingstep = Math.floor(sps/10); //300ms width peak, 1/10th sec smoothing for filtering
		let smoothed = this.sma(raw_signal,smoothingstep);
		let peaks = this.peakDetect(smoothed,'peak',smoothingstep); //returns indices of peaks
		let mean = this.mean(smoothed);
		let std = this.std(smoothed,mean);

		let p_idx = 0;
		let candidates = [];
		if(peaks.length > 0) {
			event_timestamps.forEach((t,j) => {
				while(signal_timestamps[peaks[p_idx]] < t + 200) { //roll over peaks that are behind of the latest event + 200ms
					p_idx++;
					if(!peaks[p_idx]) break;
				}
				
				let tempi = 0;
				let tempcandidates = [];
				while(signal_timestamps[peaks[p_idx+tempi]] < t + 600 ) { //get peaks that are behind the latest event + (200ms-600ms)
					tempcandidates.push(p_idx+tempi);
					tempi++;
					if(!peaks[p_idx+tempi]) break;
				}
				if(tempcandidates.length > 1) { //if multiple peaks found choose the biggest one for the main p300 peak (not worrying about p1,p2,n1,n2 yet)
					let peakvals = [];
					tempcandidates.forEach((tc) => {
						peakvals.push(smoothed[peaks[tc]]);
					});
					let max = Math.max(...peakvals);
					let maxi = tempcandidates[peakvals.indexOf(max)];

					candidates.push({
						event_timestamp:t, 
						event_index:j, 
						peak_timestamp:signal_timestamps[[peaks[maxi]]],
						signal_index:[peaks[maxi]], 
						signal_amplitude:raw_signal[[peaks[maxi]]], 
						zscore:(smoothed[peaks[maxi]]-mean)/std //significance measure
					});
				} else if (tempcandidates.length === 1) candidates.push({
					event_timestamp:t, 
					event_index:j, 
					peak_timestamp:signal_timestamps[peaks[tempcandidates[0]]],
					signal_index:peaks[tempcandidates[0]],
					signal_amplitude:raw_signal[[peaks[tempcandidates[0]]]],
					zscore:(smoothed[peaks[tempcandidates[0]]]-mean)/std //significance measure

				});
			});
		} return candidates;
	}

}
