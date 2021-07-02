
//By Joshua Brewster (GPL3)
export class Particles { //Adapted from this great tutorial: https://modernweb.com/creating-particles-in-html5-canvas/
    constructor(maxParticles = 100, randomSeed = true, canvasId=undefined, velocityFunc = undefined) { //custom velocity function is allowed

      this.canvasId = canvasId;
      this.canvas = null; this.context = null; this.animationId = null;
      this.animating = false;
  
      this.lastFrame = 0;
      this.thisFrame = 0;
      this.frameRate = 1;

      this.randomSeed = randomSeed;
      // No longer setting velocites as they will be random
      // Set up object to contain particles and set some default values
      this.particles = [];
      this.particleIndex = 0;
      this.settings = {
        maxParticles: maxParticles,
        particleSize: 5,
        startingX: Math.random()*100, 
        startingY: Math.random()*100,
        maxSpeed: 1, 
        xBounce: -1,
        yBounce: -1,
        gravity: 0.0,
        maxLife: Infinity,
        groundLevel: 200 * 0.999,
        leftWall: 200 * 0.001,
        rightWall: 200 * 0.999,
        ceilingWall: 200 * 0.001,
        velocityFunc: velocityFunc
      };

      //for default anim
      // To optimise the previous script, generate some pseudo-random angles
      this.seedsX = [];
      this.seedsY = [];
      this.currentAngle = 0;
      if(this.randomSeed) {
        this.seedAngles();
      }

      if(this.canvasId) {
        this.canvas = document.getElementById(this.canvasId);
        this.context = this.canvas.getContext("2d");    
        this.settings.startingX = Math.random()*this.canvas.width;
        this.settings.startingY = Math.random()*this.canvas.height;
        this.settings.groundLevel = this.canvas.height*0.999;
        this.settings.ceilingLevel = this.canvas.height*0.001;
        this.settings.rightWall = this.canvas.width * 0.999;
        this.settings.leftWall = this.canvas.height * 0.001;
      }

      // Generate the particles
      if(this.particles.length < this.settings.maxParticles) {
        while (this.particles.length < this.settings.maxParticles) {
          this.genParticle();
          //console.log(this.particles[i]);
        }
      }

      if(canvasId){
        this.draw();
      }

    }

    seedAngles() {
      this.seedsX = [];
      this.seedsY = [];
      for (var i = 0; i < this.settings.maxParticles; i++) {
        this.seedsX.push(Math.random() * 20 - 10);
        this.seedsY.push(Math.random() * 30 - 10);
      }
    }

    // Set up a function to create multiple particles
    genParticle() {
      if (this.particleIndex !== this.settings.maxParticles) {
        var newParticle = {};
        
        newParticle.x = this.settings.startingX;
        newParticle.y = this.settings.startingY;
        newParticle.vx = 0;
        newParticle.vy = 0;
        // Establish starting positions and velocities
        if(this.randomSeed === true){
          newParticle.vx = this.seedsX[this.currentAngle];
          newParticle.vy = this.seedsY[this.currentAngle];
          this.currentAngle++;
        }

        // Add new particle to the index
        // Object used as it's simpler to manage that an array
      
        newParticle.id = this.particleIndex;
        newParticle.life = 0;
        newParticle.maxLife = this.settings.maxLife;

        this.particles[this.particleIndex] = newParticle;

        this.particleIndex++;
      } else {
        if(this.randomSeed === true){
          //console.log('Generating more seed angles');
          this.seedAngles();
          this.currentAngle = 0;
        }
        this.particleIndex = 0;
      }
    }

    normalize2D(vec2 = []) {
      var normal = Math.sqrt(Math.pow(vec2[0],2)+Math.pow(vec2[1],2));
      return [vec2[0]/normal,vec2[1]/normal];
    }

    // Update particle positions and velocities. Keep particles within walls
    updateParticle = (i) => {
      
      this.particles[i].x += this.particles[i].vx+this.particles[i].vx*this.frameRate;
      this.particles[i].y += this.particles[i].vy+this.particles[i].vx*this.frameRate;
    
      if((this.particles[i].vx > this.settings.maxSpeed) || (this.particles[i].vy > this.settings.maxSpeed) || (this.particles[i].vx < -this.settings.maxSpeed) || (this.particles[i].vy < -this.settings.maxSpeed)) {
        var normalized = this.normalize2D([this.particles[i].vx,this.particles[i].vy]);
        this.particles[i].vx = normalized[0]*this.settings.maxSpeed;
        this.particles[i].vy = normalized[1]*this.settings.maxSpeed;
      }
      
      // Give the particle some bounce
      if ((this.particles[i].y + this.settings.particleSize) > this.settings.groundLevel) {
        this.particles[i].vy *= this.settings.yBounce;
        this.particles[i].vx *= -this.settings.xBounce;
        this.particles[i].y = this.settings.groundLevel - this.settings.particleSize;
      }

      // Give the particle some bounce
      if ((this.particles[i].y - this.settings.particleSize) < this.settings.ceilingWall) {
        this.particles[i].vy *= this.settings.yBounce;
        this.particles[i].vx *= -this.settings.xBounce;
        this.particles[i].y = this.settings.ceilingWall + this.settings.particleSize;
      }

      // Determine whether to bounce the particle off a wall
      if (this.particles[i].x - (this.settings.particleSize) <= this.settings.leftWall) {
        this.particles[i].vx *= this.settings.xBounce;
        this.particles[i].x = this.settings.leftWall + (this.settings.particleSize);
      }

      if (this.particles[i].x + (this.settings.particleSize) >= this.settings.rightWall) {
        this.particles[i].vx *= this.settings.xBounce;
        this.particles[i].x = this.settings.rightWall - this.settings.particleSize;
      }

      // Adjust for gravity
      this.particles[i].vy += this.settings.gravity*this.frameRate;

      // Age the particle
      this.particles[i].life++;

      // If Particle is old, it goes in the chamber for renewal
      if (this.particles[i].life >= this.particles[i].maxLife) {
        this.particles.splice(i,1);
      }

    }

    stop() {
      this.animating = false;
      cancelAnimationFrame(this.animationId);
    }

    start() {
      this.animating = true;
      this.animate();
    }

    animate = () => {
      if(this.animating) {
        if(this.settings.velocityFunc !== undefined) this.settings.velocityFunc();
        this.draw();
        setTimeout(() => { this.animationId = requestAnimationFrame(this.animate); }, 16);
      }
    }

    draw = () => {

  
      this.settings.startingX = Math.random()*this.canvas.width;
      this.settings.startingY = Math.random()*this.canvas.height;
      this.settings.groundLevel = this.canvas.height*0.999;
      this.settings.ceilingLevel = this.canvas.height*0.001;
      this.settings.rightWall = this.canvas.width * 0.999;
      this.settings.leftWall = this.canvas.height * 0.001;
      

      this.lastFrame = this.thisFrame;
      this.thisFrame = performance.now();
      this.frameRate = (this.thisFrame - this.lastFrame) * 0.001; //Framerate in seconds

      this.context.fillStyle = "rgba(10,10,10,0.8)";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw a left, right walls and floor
      this.context.fillStyle = "red";
      this.context.fillRect(0, 0, this.settings.leftWall, this.canvas.height);
      this.context.fillRect(this.settings.rightWall, 0, this.canvas.width, this.canvas.height);
      this.context.fillRect(0, this.settings.groundLevel, this.canvas.width, this.canvas.height);
      this.context.fillRect(0, 0, this.canvas.width, this.settings.ceilingWall);
      
      
      // Generate the particles
      if(this.particles.length < this.settings.maxParticles) {
        while (this.particles.length < this.settings.maxParticles) {
          this.genParticle();
          //console.log(this.particles[i]);
        }
      }

      // Draw the particles
      for (var i in this.particles) {
        this.updateParticle( i );
        // Create the shapes
        //context.fillStyle = "red";
        //context.fillRect(this.x, this.y, settings.particleSize, settings.particleSize);
        this.context.clearRect(this.settings.leftWall, this.settings.groundLevel, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        let magnitude = Math.sqrt(this.particles[i].vx*this.particles[i].vx + this.particles[i].vy*this.particles[i].vy)
        let red,green,blue;

        red = Math.sin(magnitude+this.particles[i].vx)*255;
        green = 10*(1-magnitude);
        blue = Math.cos(magnitude+this.particles[i].vy)*125+75;

        this.context.fillStyle="rgb("+red+","+green+","+blue+")";
        // Draws a circle of radius 20 at the coordinates 100,100 on the canvas
        this.context.arc(this.particles[i].x, this.particles[i].y, this.settings.particleSize, 0, Math.PI*2, true); 
        this.context.closePath();
        this.context.fill();
      }

    }
}


export class Boids {
    constructor(boidsCount = 200, canvasId=undefined) {
      this.boidsCount = boidsCount;
      this.boidsPos = new Array(boidsCount).fill([0,0,0]); //vec3 list
      this.boidsVel = new Array(boidsCount).fill([0,0,0]);
      
      this.groupingSize = 10; //Max # that a boid will reference.
      this.groupingRadius = 10000; //Max radius for a boid to check for flocking

      this.boidsMul = 1; // Global modifier on boids velocity change for particles. 

      this.dragMul = 0.033;
      this.cohesionMul = 0.001; //Force toward mean position of group
      this.alignmentMul = 0.5; //Force perpendicular to mean direction of group
      this.separationMul = 1; //Force away from other boids group members, multiplied by closeness.
      this.swirlMul = 0.0001; //Positive = Clockwise rotation about an anchor point
      this.attractorMul = 0.003;

      this.useAttractor = true;
      this.useSwirl = true;
      
      this.attractorAnchor = [0.5,0.5,0];
      this.swirlAnchor = [0.5,0.5,0]; //Swirl anchor point
      this.boundingBox; //Bounds boids to 3D box, good for shaping swirls

      //Could add: leaders (negate cohesion and alignment), predators (negate separation), goals (some trig or averaging to bias velocity toward goal post)

      this.animating = false;
      this.animationId = null;
      this.lastFrame = 0;
      this.thisFrame = 0;
      this.frameRate = 0;

      this.canvasId = canvasId;
      this.particleClass = null;

      this.init();
    }

    init = () => {
      this.particleClass = new Particles(this.boidsCount,true,this.canvasId);
      if(this.canvasId !== undefined) {
          this.swirlAnchor = [this.particleClass.canvas.width*0.45, this.particleClass.canvas.height*0.5, 0];
          this.attractorAnchor = this.swirlAnchor;

          for(var i = 0; i < this.boidsCount; i++){
            this.boidsPos[i] = [this.particleClass.particles[i].x,this.particleClass.particles[i].y,Math.random()]; //Random starting positions;
            this.boidsVel[i] = [Math.random()*0.01,Math.random()*0.01,Math.random()*0.01]; //Random starting velocities;
          }

          this.start();
      }

    }

    reinit = () => {
      this.stop();
      this.init();
    }

    start = () => {
        if(this.canvasId !== undefined) {
            this.particleClass.start();
        }
        this.animating = true;
        this.animate();
    }

    stop = () => {
      this.animating = false;
      cancelAnimationFrame(this.animationId);
      this.particleClass.stop();
    }

    //Run a boids calculation to update velocities
    calcBoids = () => { 

        //Simple recursive boids, does not scale up well without limiting group sizes
        var newVelocities = [];
        //console.time("boid")
        for(var i = 0; i < this.boidsCount; i++) {
        var inRange = []; //indices of in-range boids
        var distances = []; //Distances of in-range boids
        var cohesionVec = this.boidsPos[i]; //Mean position of all boids for cohesion multiplier
        var separationVec = [0,0,0]; //Sum of a-b vectors, weighted by 1/x to make closer boids push harder.
        var alignmentVec = this.boidsVel[i]; //Perpendicular vector from average of boids velocity vectors. Higher velocities have more alignment pull.
        var groupCount = 0;
        nested:
        for(var j = 0; j < this.boidsCount; j++) {

            var randj = Math.floor(Math.random()*this.boidsCount); // Get random index
            if(randj === i) { continue; }

            if(distances.length > this.groupingSize) { break nested; }
            var disttemp = this.distance3D(this.boidsPos[i],this.boidsPos[randj]);
            if(disttemp > this.groupingRadius) { continue; }
            distances.push(disttemp);
            inRange.push(randj);

            cohesionVec   = [cohesionVec[0] + this.boidsPos[randj][0], cohesionVec[1] + this.boidsPos[randj][1], cohesionVec[2] + this.boidsPos[randj][2]];
            
            separationVec = [separationVec[0] + (this.boidsPos[i][0]-this.boidsPos[randj][0])*(1/disttemp), separationVec[1] + this.boidsPos[i][1]-this.boidsPos[randj][1]*(1/disttemp), separationVec[2] + (this.boidsPos[i][2]-this.boidsPos[randj][2] + 1)*(1/disttemp)];
            if((separationVec[0] == Infinity) || (separationVec[0] == -Infinity) || (separationVec[0] > 3) || (separationVec[0] < -3) || (separationVec[1] == Infinity) || (separationVec[1] == -Infinity) || (separationVec[1] > 3) || (separationVec[1] < -3) || (separationVec[2] == Infinity) || (separationVec[2] == -Infinity) || (separationVec[2] > 3) || (separationVec[2] < -3) ) {
            separationVec = [Math.random()*4-2,Math.random()*4-2,Math.random()*4-2]; //Special case for when particles overlap and cause infinities
            //console.log("Infinity!")
            }
            //console.log(separationVec);
            alignmentVec  = [alignmentVec[0] + this.boidsVel[randj][0], alignmentVec[1] + this.boidsVel[randj][1], alignmentVec[2] + this.boidsVel[randj][2]];
            
            groupCount++;
            
        }
        cohesionVec = [this.cohesionMul*(cohesionVec[0]/groupCount -this.boidsPos[i][0] ),this.cohesionMul*(cohesionVec[1]/groupCount-this.boidsPos[i][1]),this.cohesionMul*(cohesionVec[2]/groupCount-this.boidsPos[i][2])];
        alignmentVec = [-(this.alignmentMul*alignmentVec[1]/groupCount),this.alignmentMul*alignmentVec[0]/groupCount,this.alignmentMul*alignmentVec[2]/groupCount];//Use a perpendicular vector [-y,x,z]
        separationVec = [this.separationMul*separationVec[0],this.separationMul*separationVec[1],this.separationMul*separationVec[2]];
        
        var swirlVec = [0,0,0];
        if(this.useSwirl == true){
            swirlVec = [-(this.boidsPos[i][1]-this.swirlAnchor[1])*this.swirlMul,(this.boidsPos[i][0]-this.swirlAnchor[0])*this.swirlMul,(this.boidsPos[i][2]-this.swirlAnchor[2])*this.swirlMul];
        }
        var attractorVec = [0,0,0]
        if(this.useAttractor == true){
            attractorVec = [(this.attractorAnchor[0]-this.boidsPos[i][0])*this.attractorMul,(this.attractorAnchor[1]-this.boidsPos[i][1])*this.attractorMul,(this.attractorAnchor[2]-this.boidsPos[i][2])*this.attractorMul];
        }
        
        //console.log(cohesionVec);
        //console.log(alignmentVec);
        //console.log(separationVec);
        //console.log(swirlVec);

        newVelocities.push([
            this.boidsVel[i][0]*this.dragMul+cohesionVec[0]+alignmentVec[0]+separationVec[0]+swirlVec[0]+attractorVec[0],
            this.boidsVel[i][1]*this.dragMul+cohesionVec[1]+alignmentVec[1]+separationVec[1]+swirlVec[1]+attractorVec[1],
            this.boidsVel[i][2]*this.dragMul+cohesionVec[2]+alignmentVec[2]+separationVec[2]+swirlVec[2]+attractorVec[1]
            ]);
        }
        if(newVelocities.length == this.boidsCount){ // If newVelocities updated completely, else there was likely an error
            //console.log(newVelocities);
            this.boidsVel = newVelocities; //Set new velocities. This will update positions in the draw function which keeps the frame timing
            //console.timeEnd("boid");
            return true;
        }
        else { return false; }
        
    }

    distance3D(a,b) //assumes you're passing two Array(3) i.e. [x,y,z]
    {
        return Math.sqrt(Math.pow(b[0]-a[0],2) + Math.pow(b[1]-a[1],2) + Math.pow(b[2]-a[2],2));
    }

    //returns a shuffled array 
    shuffleArr(arr) {
        var randArr = [];
        while(arr.length > 0) {
        var randIdx = Math.floor(Math.random()*arr.length);
        randArr.push(arr[randIdx]);
        }
        return randArr;
    }

    onData(score){
        this.swirlMul += score*0.0003;
        if(this.swirlMul < 0) {
          this.swirlMul = 0;
        }
        else if(this.swirlMul > 0.01){
          this.swirlMul = 0.01;
        }
    }

    animate = () => {
      if(this.animating) {
        this.updateParticles();
        setTimeout(()=>{this.animationId = requestAnimationFrame(this.animate);},20);
      }
    }

    updateParticles = () => {
        var success = this.calcBoids();
        if(success == true){
              //Moving anchor
          var anchorTick = performance.now()*0.00005;
          if(this.canvasId) {
            var newAnchor = [Math.sin(anchorTick)*Math.sin(anchorTick)*this.particleClass.canvas.width*0.3+this.particleClass.canvas.width*0.2, this.particleClass.canvas.height*0.3, 0];
          }
          this.swirlAnchor = newAnchor;
          this.attractorAnchor = newAnchor;
    
          this.lastFrame = this.thisFrame;
          this.thisFrame = performance.now();
          this.frameRate = (this.thisFrame - this.lastFrame) * 0.001; //Framerate in seconds
          this.boidsPos.forEach((item,idx) => {
            //this.boidsPos[idx] = [item[0]+(this.boidsVel[idx][0]*this.frameRate),item[1]+(this.boidsVel[idx][1]*this.frameRate),item[2]+(this.boidsVel[idx][2]*this.frameRate)];
            if(idx <= this.particleClass.particles.length){
              this.particleClass.particles[idx].vx += this.boidsVel[idx][0]*this.frameRate*this.boidsMul;
              this.particleClass.particles[idx].vy += this.boidsVel[idx][1]*this.frameRate*this.boidsMul;
              if(this.particleClass.animationId === null) this.particleClass.updateParticle(idx);
              //console.log(this.renderer.particles[idx].vx)
            }

            this.boidsPos[idx][0] = this.particleClass.particles[idx].x;
            this.boidsPos[idx][1] = this.particleClass.particles[idx].y;
            //console.log(this.renderer.particles[idx].x)
          });
        }
    
        //Now feed the position data into the visual as a list of vec3 data or update canvas
    }


}



export  class ParticleDynamics {
    constructor(
        rules=[
        ['boids',100],
        ['boids',50]
        ], 
        canvas=undefined,
        defaultCanvas=true
    ) {
        
        this.canvas = canvas;
        this.defaultCanvas=defaultCanvas;
        this.ctx = undefined;
        this.looping = false;

        this.startingRules = rules;
        this.nGroups = this.startingRules.length;

        this.particles = [];

        this.colorScale = ['#000000', '#030106', '#06010c', '#090211', '#0c0215', '#0e0318', '#10031b', '#12041f', '#130522', '#140525', '#150628', '#15072c', '#16082f', '#160832', '#160936', '#160939', '#17093d', '#170a40', '#170a44', '#170a48', '#17094b', '#17094f', '#170953', '#170956', '#16085a', '#16085e', '#150762', '#140766', '#140669', '#13066d', '#110571', '#100475', '#0e0479', '#0b037d', '#080281', '#050185', '#020089', '#00008d', '#000090', '#000093', '#000096', '#000099', '#00009c', '#00009f', '#0000a2', '#0000a5', '#0000a8', '#0000ab', '#0000ae', '#0000b2', '#0000b5', '#0000b8', '#0000bb', '#0000be', '#0000c1', '#0000c5', '#0000c8', '#0000cb', '#0000ce', '#0000d1', '#0000d5', '#0000d8', '#0000db', '#0000de', '#0000e2', '#0000e5', '#0000e8', '#0000ec', '#0000ef', '#0000f2', '#0000f5', '#0000f9', '#0000fc', '#0803fe', '#2615f9', '#3520f4', '#3f29ef', '#4830eb', '#4e37e6', '#543ee1', '#5944dc', '#5e49d7', '#614fd2', '#6554cd', '#6759c8', '#6a5ec3', '#6c63be', '#6e68b9', '#6f6db4', '#7072af', '#7177aa', '#717ba5', '#7180a0', '#71859b', '#718996', '#708e91', '#6f928b', '#6e9786', '#6c9b80', '#6aa07b', '#68a475', '#65a96f', '#62ad69', '#5eb163', '#5ab65d', '#55ba56', '#4fbf4f', '#48c347', '#40c73f', '#36cc35', '#34ce32', '#37cf31', '#3ad130', '#3cd230', '#3fd32f', '#41d52f', '#44d62e', '#46d72d', '#48d92c', '#4bda2c', '#4ddc2b', '#4fdd2a', '#51de29', '#53e029', '#55e128', '#58e227', '#5ae426', '#5ce525', '#5ee624', '#60e823', '#62e922', '#64eb20', '#66ec1f', '#67ed1e', '#69ef1d', '#6bf01b', '#6df11a', '#6ff318', '#71f416', '#73f614', '#75f712', '#76f810', '#78fa0d', '#7afb0a', '#7cfd06', '#7efe03', '#80ff00', '#85ff00', '#89ff00', '#8eff00', '#92ff00', '#96ff00', '#9aff00', '#9eff00', '#a2ff00', '#a6ff00', '#aaff00', '#adff00', '#b1ff00', '#b5ff00', '#b8ff00', '#bcff00', '#bfff00', '#c3ff00', '#c6ff00', '#c9ff00', '#cdff00', '#d0ff00', '#d3ff00', '#d6ff00', '#daff00', '#ddff00', '#e0ff00', '#e3ff00', '#e6ff00', '#e9ff00', '#ecff00', '#efff00', '#f3ff00', '#f6ff00', '#f9ff00', '#fcff00', '#ffff00', '#fffb00', '#fff600', '#fff100', '#ffec00', '#ffe700', '#ffe200', '#ffdd00', '#ffd800', '#ffd300', '#ffcd00', '#ffc800', '#ffc300', '#ffbe00', '#ffb900', '#ffb300', '#ffae00', '#ffa900', '#ffa300', '#ff9e00', '#ff9800', '#ff9300', '#ff8d00', '#ff8700', '#ff8100', '#ff7b00', '#ff7500', '#ff6f00', '#ff6800', '#ff6100', '#ff5a00', '#ff5200', '#ff4900', '#ff4000', '#ff3600', '#ff2800', '#ff1500', '#ff0004', '#ff000c', '#ff0013', '#ff0019', '#ff001e', '#ff0023', '#ff0027', '#ff002b', '#ff012f', '#ff0133', '#ff0137', '#ff013b', '#ff023e', '#ff0242', '#ff0246', '#ff0349', '#ff034d', '#ff0450', '#ff0454', '#ff0557', '#ff065b', '#ff065e', '#ff0762', '#ff0865', '#ff0969', '#ff0a6c', '#ff0a70', '#ff0b73', '#ff0c77', '#ff0d7a', '#ff0e7e', '#ff0f81', '#ff1085', '#ff1188', '#ff128c', '#ff138f', '#ff1493'];

        this.prototype = {
        position:{x:0,y:0,z:0},
        velocity:{x:0,y:0,z:0},
        type:"boids", //Behavior trees: boids, predators, plant cell, animal cell, algae, bacteria, atom, proton, neutron, electron, conway, can combine
        particleSize: 5,
        startingX: 0.5, 
        startingY: 0.5,
        maxSpeed: 100, 
        xBounce: -1,
        yBounce: -1,
        gravity: 0.0,
        drag:0.033,
        life:0, //Seconds since spawn
        lifeTime: 100000000, //Number of seconds before the particle despawns
        boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
        boid:{
            boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
            cohesion:0.02,
            separation:0.05,
            alignment:0.002,
            useSwirl:true,
            swirl:{x:0.5,y:0.5,z:0.5,mul:0.003},
            useAttractor:true,
            attractor:{x:0.5,y:0.5,z:0.5,mul:0.01},
            groupRadius:200,
            groupSize:10,
        },
        plant:{
            diet:"photosynthetic", //if plant or animal cell: herbivore, carnivore, omnivore, photosynthetic, dead, dead_animal, dead_plant. Determines what other particles they will consume/trend toward
        },
        animal:{
            diet:"omnivore", //if plant or animal cell: herbivore, carnivore, omnivore, photosynthetic, dead, dead_animal, dead_plant. Determines what other particles they will consume/trend toward
        },
        bacteria:{},
        atom:{},
        proton:{},
        neutron:{},
        electron:{},
        conway:{
            survivalRange:[2,3], //nCell neighbors range for survival & reproduction
            reproductionRange:[3,3], //nCell neighbors range required to produce a living cell
            groupRadius:10 //pixel distance for grouping 
        }
        
        }

        this.init();
        
    }

    init = (rules=this.startingRules) => {
        if(this.canvas && this.defaultCanvas) {
            this.ctx = this.canvas.getContext("2d");
            window.addEventListener('resize',this.onresize());
        }

        rules.forEach((rule,i) => {
            //console.log(rule)
            let group = this.addGroup(rule);
        });

        if(!this.looping) {
            this.looping = true;
            this.loop();
        }
    }

    deinit = () => {
        this.looping = false;
        if(this.canvas) {
         window.removeEventListener('resize',this.onresize());
        } 
    }
    
    defaultAnimation = (particle) => {
        this.ctx.beginPath();
        let magnitude = Math.sqrt(particle.velocity.x*particle.velocity.x + particle.velocity.y*particle.velocity.y + particle.velocity.z*particle.velocity.z)
        
        var value = Math.floor(magnitude*255/particle.maxSpeed);
        if(value > 255) { value = 255; }
        else if (value < 0) { value = 0; }
        this.ctx.fillStyle = this.colorScale[value];

        // Draws a circle of radius 20 at the coordinates 100,100 on the canvas
        this.ctx.arc(particle.position.x, particle.position.y, particle.particleSize, 0, Math.PI*2, true); 
        this.ctx.closePath();
        this.ctx.fill();

    }

    distance3D(a,b) //assumes you're passing two Array(3) i.e. [x,y,z]
    {
        if(Array.isArray(a)) { 
            return Math.sqrt((b[0]-a[0])*(b[0]-a[0]) + (b[1]-a[1])*(b[1]-a[1]) + (b[2]-a[2])*(b[2]-a[2]));
        }
        else {
            return Math.sqrt((b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y) + (b.z-a.z)*(b.z-a.z));
        }
    }  

    normalize3D(vec3 = []) {
        let normal;
        if(Array.isArray(vec3)) {
            normal = Math.sqrt(vec3[0]*vec3[0]+vec3[1]*vec3[1]+vec3[2]*vec3[2]);
            return [vec3[0]/normal,vec3[1]/normal,vec3[2]/normal];
        }
        else  {
            normal = Math.sqrt(vec3.x*vec3.x+vec3.y*vec3.y+vec3.z*vec3.z);
            return {x:vec3.x/normal,y:vec3.y/normal,z:vec3.z/normal};
        }
            
    }

    defaultGroupRule = (particle,rule) =>{
        particle.type = rule[0];
        particle.startingX = Math.random();
        particle.startingY = Math.random();
        particle.startingZ = Math.random();
    } //can dynamically allocate particle group properties


    defaultBoidGroupRule = (particle,rule) => {

        particle.rule = rule[0];
        if(this.canvas) {
            let h = this.canvas.height;
            let w = this.canvas.width;
            let startX =  Math.random()*w;
            let startY =  Math.random()*h;
            particle.startingX = startX;
            particle.startingY = startY;
            particle.startingZ = startY;
            particle.position = {x:startX,y:startY,z:startY};
            particle.boundingBox = {
                left:particle.boundingBox.left*w,
                right:particle.boundingBox.right*w,
                bot:particle.boundingBox.bot*h,
                top:particle.boundingBox.top*h,
                front:particle.boundingBox.front*h,
                back:particle.boundingBox.back*h
            };
            particle.boid.boundingBox = {
                left:particle.boid.boundingBox.left*w,
                right:particle.boid.boundingBox.right*w,
                bot:particle.boid.boundingBox.bot*h,
                top:particle.boid.boundingBox.top*h,
                front:particle.boid.boundingBox.front*h,
                back:particle.boid.boundingBox.back*h
            };
            particle.boid.attractor = {
                x:0.5*w,
                y:0.5*h,
                z:0.5*w,
                mul:particle.boid.attractor.mul
            };
            particle.boid.swirl = {
                x:0.5*w,
                y:0.5*h,
                z:0.5*w,
                mul:particle.boid.swirl.mul
            };
        }

    }

    checkParticleBounds = (particle) => {
        
        if((particle.velocity.x > particle.maxSpeed) || (particle.velocity.y > particle.maxSpeed) || (particle.velocity.z > particle.maxSpeed) || (particle.velocity.x < -particle.maxSpeed) || (particle.velocity.y < -particle.maxSpeed) || (particle.velocity.z < -particle.maxSpeed)) {
            let normalized = this.normalize3D([particle.velocity.x,particle.velocity.y,particle.velocity.z]);
            particle.velocity.x = normalized[0]*particle.maxSpeed;
            particle.velocity.y = normalized[1]*particle.maxSpeed;
            particle.velocity.z = normalized[2]*particle.maxSpeed;
        }
        
        // Give the particle some bounce
        if ((particle.position.y - particle.particleSize) <= particle.boundingBox.top) {
            particle.velocity.y *= particle.yBounce;
            particle.position.y = particle.boundingBox.top + particle.particleSize;
        }
        if ((particle.position.y + particle.particleSize) >= particle.boundingBox.bot) {
            particle.velocity.y *= particle.yBounce;
            particle.position.y = particle.boundingBox.bot - particle.particleSize;
        }

        if (particle.position.x - (particle.particleSize) <= particle.boundingBox.left) {
            particle.velocity.x *= particle.xBounce;
            particle.position.x = particle.boundingBox.left + (particle.particleSize);
        }

        if (particle.position.x + (particle.particleSize) >= particle.boundingBox.right) {
            particle.velocity.x *= particle.xBounce;
            particle.position.x = particle.boundingBox.right - particle.particleSize;
        }

        if (particle.position.z - (particle.particleSize) <= particle.boundingBox.front) {
            particle.velocity.z *= particle.xBounce;
            particle.position.z = particle.boundingBox.front + (particle.particleSize);
        }

        if (particle.position.z + (particle.particleSize) >= particle.boundingBox.back) {
            particle.velocity.z *= particle.xBounce;
            particle.position.z = particle.boundingBox.back - particle.particleSize;
        }
    }


    defaultTimestepFunc = (group,timeStep)=>{ //what happens on each time step?

        if(group.particles.length < group.max) {
            //add a new particle
            group.particles.push(this.newParticle());
            group.groupRuleGen(group.particles[group.particles.length-1],rule);
        }

        let expiredidx = [];
        group.particles.forEach((p,i) => {
            
            // Adjust for gravity
            p.velocity.y += p.gravity*timeStep;
            
            p.position.x += p.velocity.x*timeStep;
            p.position.y += p.velocity.x*timeStep;
            p.position.y += p.velocity.x*timeStep;

            this.checkParticleBounds(p);

            // Age the particle
            p.life+=timeStep;

            if(this.defaultCanvas) {
                group.animateParticle(p);
            }

            // If Particle is old, it goes in the chamber for renewal
            if (p.life >= p.lifeTime) {
                expiredidx.push(i);
            }

        });

        expiredidx.reverse().forEach((x)=>{
          group.particles.splice(x,1);
        });
    
    }

    //pass a particle group in, will add to particle velocities and return true if successful
    calcBoids = (particles=[]) => {
        
        const newVelocities = [];
        outer:
        for(var i = 0; i < particles.length; i++) {
            let p0 = particles[i];
            const inRange = []; //indices of in-range boids
            const distances = []; //Distances of in-range boids
            const cohesionVec = [p0.position.x,p0.position.y,p0.position.z]; //Mean position of all boids for cohesion multiplier
            const separationVec = [0,0,0]; //Sum of a-b vectors, weighted by 1/x to make closer boids push harder.
            const alignmentVec = [p0.velocity.x,p0.velocity.y,p0.velocity.z]; //Perpendicular vector from average of boids velocity vectors. Higher velocities have more alignment pull.
            let groupCount = 1;
    
            nested:
            for(let j = 0; j < particles.length; j++) {
                let p = particles[j];
                if(distances.length > p.boid.groupSize) { break nested; }

                let randj = Math.floor(Math.random()*particles.length); // Get random index
                if(j===i || randj === i || inRange.indexOf(randj) > -1) {  } else {
                    let pr = particles[randj];
                    let disttemp = this.distance3D(p0.position,pr.position);
                    
                    if(disttemp > p0.boid.groupRadius) { } else {
                        distances.push(disttemp);
                        inRange.push(randj);
                
                        cohesionVec[0] = cohesionVec[0] + pr.position.x;
                        cohesionVec[1] = cohesionVec[1] + pr.position.y;
                        cohesionVec[2] = cohesionVec[2] + pr.position.z;

                        if(isNaN(disttemp) || isNaN(cohesionVec[0]) || isNaN(pr.position.x)) {
                            console.log(disttemp, i, randj, p0.position, pr.position, cohesionVec); p0.position.x = NaN; 
                            return;
                        }

                        let distInv = (1/disttemp);
                        if(distInv == Infinity) distInv = p.maxSpeed;
                        else if (distInv == -Infinity) distInv = -p.maxSpeed;
                        separationVec[0] = separationVec[0] + (p0.position.x-pr.position.x)*distInv;
                        separationVec[1] = separationVec[1] + (p0.position.y-pr.position.y)*distInv; 
                        separationVec[2] = separationVec[2] + (p0.position.z-pr.position.z)*distInv;
            
                        //console.log(separationVec);
                        alignmentVec[0] = alignmentVec[0] + pr.velocity.x; 
                        alignmentVec[1] = alignmentVec[1] + pr.velocity.y;
                        alignmentVec[2] = alignmentVec[2] + pr.velocity.z;
                        
                        groupCount++;
                    }
                }
            }    
     
            cohesionVec[0] = p0.boid.cohesion*(cohesionVec[0]/groupCount-p0.position.x);
            cohesionVec[1] = p0.boid.cohesion*(cohesionVec[1]/groupCount-p0.position.y);
            cohesionVec[2] = p0.boid.cohesion*(cohesionVec[2]/groupCount-p0.position.z);
            
            alignmentVec[0] = -(p0.boid.alignment*alignmentVec[1]/groupCount);
            alignmentVec[1] = p0.boid.alignment*alignmentVec[0]/groupCount;
            alignmentVec[2] = p0.boid.alignment*alignmentVec[2]/groupCount;//Use a perpendicular vector [-y,x,z]
    
            separationVec[0] = p0.boid.separation*separationVec[0];
            separationVec[1] = p0.boid.separation*separationVec[1];
            separationVec[2] = p0.boid.separation*separationVec[2];
            
            const swirlVec = [0,0,0];
            if(p0.boid.useSwirl == true){
                swirlVec[0] = -(p0.position.y-p0.boid.swirl.y)*p0.boid.swirl.mul;
                swirlVec[1] = (p0.position.x-p0.boid.swirl.x)*p0.boid.swirl.mul;
                swirlVec[2] = (p0.position.z-p0.boid.swirl.z)*p0.boid.swirl.mul;
            }
            const attractorVec = [0,0,0];

            if(p0.boid.useAttractor == true){
                attractorVec[0] = (p0.boid.attractor.x-p0.position.x)*p0.boid.attractor.mul;
                attractorVec[1] = (p0.boid.attractor.y-p0.position.y)*p0.boid.attractor.mul;
                attractorVec[2] = (p0.boid.attractor.z-p0.position.z)*p0.boid.attractor.mul;
            }
            //console.log(attractorVec)

            //if(i===0) console.log(p0, p0.position, p0.velocity, cohesionVec,separationVec,alignmentVec,swirlVec,attractorVec)

            newVelocities.push([
                p0.velocity.x*p0.drag+cohesionVec[0]+alignmentVec[0]+separationVec[0]+swirlVec[0]+attractorVec[0],
                p0.velocity.y*p0.drag+cohesionVec[1]+alignmentVec[1]+separationVec[1]+swirlVec[1]+attractorVec[1],
                p0.velocity.z*p0.drag+cohesionVec[2]+alignmentVec[2]+separationVec[2]+swirlVec[2]+attractorVec[2]
            ]);
            //console.log(i,groupCount)
            if(isNaN(newVelocities[newVelocities.length-1][0])) console.log(p0, i, groupCount, p0.position, p0.velocity, cohesionVec,separationVec,alignmentVec,swirlVec,attractorVec)
        }
    
        if(newVelocities.length === particles.length){ // Update particle velocities if newVelocities updated completely, else there was likely an error
            //console.log(newVelocities);
            
            
            particles.forEach((p,i) => {
                p.velocity.x += newVelocities[i][0];
                p.velocity.y += newVelocities[i][1];
                p.velocity.z += newVelocities[i][2];
            })
            //console.timeEnd("boid");
            return true;
        }
        else { console.error("Boids error"); return false; }
    
        }
    
        

    boidsTimestepFunc = (group,timeStep) => {
        let success = this.calcBoids(group.particles);
        if(success) {
            let expiredidx = [];
            let anchorTick = timeStep*0.05;

            if(group.particles.length < group.max) {
                //add a new particle
                group.particles.push(this.newParticle());
                group.groupRuleGen(group.particles[group.particles.length-1],group.rule);
            }

            group.particles.forEach((p,i) => {
                
                p.position.x += p.velocity.x*timeStep;
                p.position.y += p.velocity.y*timeStep;
                p.position.z += p.velocity.z*timeStep;

                if(isNaN(p.position.x)) {console.log("after check",p.position,p.velocity,i);};

                this.checkParticleBounds(p);
                // Adjust for gravity
                p.velocity.y += p.gravity*timeStep;

                // Age the particle
                p.life+=timeStep;
                //if(i==0) console.log(p.life,p)

                if(this.defaultCanvas) {
                    group.animateParticle(p);
                }

                // If Particle is old, it goes in the chamber for renewal
                if (p.life >= p.lifeTime) {
                    expiredidx.push(i);
                }
            });

            expiredidx.reverse().forEach((x)=>{
                group.particles.splice(x,1);
            });
            
        }
    }

    addGroup(
        rule=['boids',50], 
        groupRuleGen=this.defaultGroupRule,
        timestepFunc=this.defautTimestepFunc,
        animateParticle=this.defaultAnimation
    ) 
        {
        
        if(!Array.isArray(rule)) return false;
        
        let type = rule[0];
        let count = rule[1];

        if(!rule[0] || !rule[1]) return false;
        
        if(type === 'boids') {
            timestepFunc = this.boidsTimestepFunc;
            groupRuleGen = this.defaultBoidGroupRule;
        } else if (timestepFunc === undefined) {
            timestepFunc = this.defautTimestepFunc;
        }

        let newGroup = new Array(count).fill(0);

        let attractorx = Math.random();
        let attractory = Math.random();
        let attractorz = Math.random();

        newGroup.forEach((p,i)=>{
            newGroup[i] = this.newParticle();
            groupRuleGen(newGroup[i],rule);
            newGroup[i].boid.attractor.x = newGroup[i].boid.boundingBox.right*attractorx;
            newGroup[i].boid.attractor.y = newGroup[i].boid.boundingBox.bot*attractory;
            newGroup[i].boid.attractor.z = newGroup[i].boid.boundingBox.back*attractorz;
            if(attractorx < 0.5) newGroup[i].boid.swirl.mul = -newGroup[i].boid.swirl.mul;
        });

        this.particles.push(
        {
            rule:rule,
            type:type, 
            max:count, 
            particles:newGroup, 
            timestepFunc:timestepFunc, 
            groupRuleGen:groupRuleGen,
            animateParticle:animateParticle
        });

        return newGroup;

    }

    newParticle(assignments=undefined) {
        let proto = JSON.parse(JSON.stringify(this.prototype));
        if(assignments) Object.assign(proto,assignments);
        return proto;
    }

    setParticle(particle,assignments={}) {
        Object.assign(particle,assignments);
        return particle;
    }

    onresize = () => {
        if(this.canvas) {
            if(this.defaultCanvas) {
                this.canvas.width = this.canvas.parentNode.clientWidth;
                this.canvas.height = this.canvas.parentNode.clientHeight;
            }
            let proto = JSON.parse(JSON.stringify(this.prototype));
            this.particles.forEach((p) => {
                let h = this.canvas.height;
                let w = this.canvas.width;
                p.boundingBox = { //Auto resize based on default bounding box settings
                    left:proto.boundingBox.left*w,
                    right:proto.boundingBox.right*w,
                    bot:proto.boundingBox.bot*h,
                    top:proto.boundingBox.top*h,
                    front:proto.boundingBox.front*h,
                    back:proto.boundingBox.back*h
                };
                p.boid.boundingBox = {
                    left:proto.boid.boundingBox.left*w,
                    right:proto.boid.boundingBox.right*w,
                    bot:proto.boid.boundingBox.bot*h,
                    top:proto.boid.boundingBox.top*h,
                    front:proto.boid.boundingBox.front*h,
                    back:proto.boid.boundingBox.back*h
                };
            });
        }
    }

    loop = (lastFrame=performance.now()*0.001,ticks=0) => {
        if(this.looping === false) return; 
        
        let currFrame = performance.now()*0.001;
        let timeStep = currFrame - lastFrame;
        //console.log(timeStep,);
        if(this.defaultCanvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.particles.forEach((group) => {
            group.timestepFunc(group,timeStep);
            
            if(isNaN(group.particles[0].position.x)) {
                console.log(timeStep,ticks,group.particles[0]);
                this.looping = false;
                return;
            }
        });

        // console.log(
        //     timeStep,
        //     this.particles[0].particles[0].position,
        //     this.particles[0].particles[0].velocity
        //     );

        let tick = ticks+1;
        setTimeout(()=>{requestAnimationFrame(()=>{this.loop(currFrame,tick)})},15);
    }

    }