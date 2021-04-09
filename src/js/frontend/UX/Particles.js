

export class Particles { //Adapted from this great tutorial: https://modernweb.com/creating-particles-in-html5-canvas/
    constructor(maxParticles = 100, randomSeed = true, canvasId=undefined) {

      this.canvasId = canvasId;
      this.canvas = null; this.context = null; this.animationId = null;
  
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
        maxSpeed: 3, 
        xBounce: -1,
        yBounce: -1,
        gravity: 0.0,
        maxLife: Infinity,
        groundLevel: 200 * 0.999,
        leftWall: 200 * 0.001,
        rightWall: 200 * 0.999,
        ceilingWall: 200 * 0.001
      };

      //for default anim
      // To optimise the previous script, generate some pseudo-random angles
      this.seedsX = [];
      this.seedsY = [];
      this.currentAngle = 0;

      // Generate the particles
      if(this.particles.length < this.settings.maxParticles) {
        for (var i = 0; i < (this.settings.maxParticles - this.particles.length); i++) {
          this.genParticle();
          //console.log(this.particles[i]);
        }
      }

      if(canvasId){
        this.canvas = document.getElementById(this.canvasId);
        this.context = this.canvas.getContext("2d");    
        //this.settings.startingX = Math.random()*this.canvas.width;
        //this.settings.startingY = Math.random()*this.canvas.height;
        this.settings.groundLevel = this.canvas.height*0.999;
        this.settings.ceilingLevel = this.canvas.height*0.001;
        this.settings.rightWall = this.canvas.width * 0.999;
        this.settings.leftWall = this.canvas.height * 0.001;

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
      this.particles[i].vy += this.settings.gravity;

      // Age the particle
      this.particles[i].life++;

      // If Particle is old, it goes in the chamber for renewal
      if (this.particles[i].life >= this.particles[i].maxLife) {
        this.particles.splice(i,1);
      }

    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }

    animate = () => {
        this.draw();
        setTimeout(() => { this.animationId = requestAnimationFrame(this.draw); }, 16);
    }

    draw = () => {
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
      
      
      // Draw the particles
      if(this.particles.length < this.settings.maxParticles) {
        for (var i = 0; i < (this.settings.maxParticles - this.particles.length); i++) {
          this.genParticle();
          //console.log(this.particles[i]);
        }
      }


      for (var i in this.particles) {
        this.updateParticle( i );
        // Create the shapes
        //context.fillStyle = "red";
        //context.fillRect(this.x, this.y, settings.particleSize, settings.particleSize);
        this.context.clearRect(this.settings.leftWall, this.settings.groundLevel, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        this.context.fillStyle="rgb("+String(Math.abs(this.particles[i].vx)*75)+","+String(Math.abs(this.particles[i].vx)*25)+","+String(255 - Math.abs(this.particles[i].vx)*75)+")";
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

      this.dragMul = 0.1;
      this.cohesionMul = 0.01; //Force toward mean position of group
      this.alignmentMul = 0.5; //Force perpendicular to mean direction of group
      this.separationMul = 3; //Force away from other boids group members, multiplied by closeness.
      this.swirlMul = 0.0005; //Positive = Clockwise rotation about an anchor point
      this.attractorMul = 0.003;

      this.useAttractor = true;
      this.useSwirl = true;
      
      this.attractorAnchor = [0.5,0.5,0];
      this.swirlAnchor = [0.5,0.5,0]; //Swirl anchor point
      this.boundingBox; //Bounds boids to 3D box, good for shaping swirls

      //Could add: leaders (negate cohesion and alignment), predators (negate separation), goals (some trig or averaging to bias velocity toward goal post)

      this.animationId = null;
      this.lastFrame = 0;
      this.thisFrame = 0;
      this.frameRate = 0;

      this.canvasId = canvasId;
      this.particleClass = new Particles(boidsCount,true,canvasId);
      
      console.log(this.particleClass.particles);
      if(this.canvasId) {
          this.particleClass.animate();
          this.animate();
      }

    }

    start = () => {
        if(this.canvasId) {
            this.particleClass.animate();
        }
        this.animate();
    }

    stop = () => {
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
        else if(this.swirlMul > 0.001){
          this.swirlMul = 0.01;
        }
    }

    animate = () => {
        this.updateParticles();
        setTimeout(()=>{this.animationId = requestAnimationFrame(this.animate);},20);
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