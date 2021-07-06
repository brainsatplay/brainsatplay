//By Joshua Brewster (MIT License)
export class DynamicParticles {
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

        this.rules = [
            {type:'default',groupRuleGen:this.defaultGroupRule, timestepFunc:this.defaultTimestepFunc,animateParticle:this.defaultAnimation},
            {type:'boids',groupRuleGen:this.defaultBoidGroupRule, timestepFunc:this.boidsTimestepFunc, animateParticle:this.defaultAnimation }
        ]

        this.prototype = {
            position:{x:0,y:0,z:0},
            velocity:{x:0,y:0,z:0},
            acceleration:{x:0,y:0,z:0},
            force:{x:0,y:0,z:0},
            type:"boids", //Behavior trees: boids, predators, plant cell, animal cell, algae, bacteria, atom, proton, neutron, electron, conway, can combine
            particleSize: 5,
            startingX: 0.5, 
            startingY: 0.5,
            maxSpeed: 40, 
            xBounce: -1,
            yBounce: -1,
            gravity: 0.0, //Downward z acceleration (9.81m/s^2 = Earth gravity)
            mass:1,
            attraction: 0.00000000006674, //Newton's gravitational constant by default
            useAttraction:false, //particles can attract each other on a curve
            drag:0.033, //Drag coefficient applied to v(t-1)
            life:0, //Seconds since spawn
            lifeTime: 100000000, //Number of seconds before the particle despawns
            boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
            boid:{
                boundingBox:{left:0,right:1,bot:1,top:0,front:0,back:1}, //bounding box, 1 = max height/width of render window
                cohesion:0.01,
                separation:0.01,
                alignment:0.006,
                swirl:{x:0.5,y:0.5,z:0.5,mul:0.002},
                attractor:{x:0.5,y:0.5,z:0.5,mul:0.003},
                useCohesion:true,
                useSeparation:true,
                useAlignment:true,
                useSwirl:true,
                useAttractor:true,
                groupRadius:200,
                groupSize:10,
                searchLimit:25
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
        };

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
        
        var value = Math.floor(magnitude*255/(particle.maxSpeed*1.2));
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

    //Assign new properties to a group by index
    updateGroupProperties=(groupIdx,properties={},key=undefined,subkey=undefined)=>{
        if(key) {
            if(subkey)
            this.particles[groupIdx].particles.map(p=>Object.assign(p[key][subkey],properties));
            else
                this.particles[groupIdx].particles.map(p=>Object.assign(p[key],properties));
        
        }    else
            this.particles[groupIdx].particles.map(p=>Object.assign(p,properties));
    }

    defaultGroupRule = (particle,rule) =>{
        particle.type = rule[0];
        particle.startingX = Math.random();
        particle.startingY = Math.random();
        particle.startingZ = Math.random();
    } //can dynamically allocate particle group properties


    defaultBoidGroupRule = (particle,rule) => {

        particle.rule = rule[0];
        if(rule[1] > 3000 && rule[1] < 5000) {particle.boid.searchLimit = 5;}
        else if (rule[1]>=5000) {particle.boid.searchLimit = 1;}

        if(rule[2]){
            let h = rule[2][0];
            let w = rule[2][1];
            let d = rule[2][2];
            let startX =  Math.random()*w;
            let startY =  Math.random()*h;
            let startZ =  Math.random()*d;
            particle.boid.separation *= (h+w+d)/3;
            particle.startingX = startX;
            particle.startingY = startY;
            particle.startingZ = startZ;
            particle.position = {x:startX,y:startY,z:startZ};
            particle.boundingBox = {
                left:particle.boundingBox.left*w,
                right:particle.boundingBox.right*w,
                bot:particle.boundingBox.bot*h,
                top:particle.boundingBox.top*h,
                front:particle.boundingBox.front*d,
                back:particle.boundingBox.back*d
            };
            particle.boid.boundingBox = {
                left:particle.boid.boundingBox.left*w,
                right:particle.boid.boundingBox.right*w,
                bot:particle.boid.boundingBox.bot*h,
                top:particle.boid.boundingBox.top*h,
                front:particle.boid.boundingBox.front*d,
                back:particle.boid.boundingBox.back*d
            };
            particle.boid.attractor = {
                x:0.5*w,
                y:0.5*h,
                z:0.5*d,
                mul:particle.boid.attractor.mul
            };
            particle.boid.swirl = {
                x:0.5*w,
                y:0.5*h,
                z:0.5*d,
                mul:particle.boid.swirl.mul
            };
        }
        else if(this.canvas) {
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
            particle.boid.separation *= (h+w)/3;
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
        } else {
            let h = 1;
            let w = 1;
            let startX =  Math.random();
            let startY =  Math.random();
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

    calcAttraction = (particle1,particle2,distance,timeStep) => { 
        let deltax = particle2.position.x-particle1.position.x,
            deltay = particle2.position.y-particle1.position.y,
            deltaz = particle2.position.z-particle1.position.z;

        let Fg =  particle1.attraction * particle1.mass*particle2.mass/(distance*distance);

        let FgOnBody1x = Fg*deltax,
            FgOnBody1y = Fg*deltay,
            FgOnBody1z = Fg*deltaz;

        let v1x = timeStep*FgOnBody1x/particle1.mass,
            v1y = timeStep*FgOnBody1y/particle1.mass,
            v1z = timeStep*FgOnBody1z/particle1.mass;

        particle1.velocity.x += v1x;
        particle1.velocity.y += v1y;
        particle1.velocity.z += v1z;

        let v2x = -timeStep*FgOnBody1x/particle2.mass,
            v2y = -timeStep*FgOnBody1y/particle2.mass,
            v2z = -timeStep*FgOnBody1z/particle2.mass;

        particle2.velocity.x += v2x;
        particle2.velocity.y += v2y;
        particle2.velocity.z += v2z;

        return v1x, v1y, v1z, v2x, v2y, v2z;

    }

    //pass a particle group in, will add to particle velocities and return true if successful
    calcBoids = (particles=[],timeStep) => {
        
        const newVelocities = [];
        outer:
        for(var i = 0; i < particles.length; i++) {
            let p0 = particles[i];
            const inRange = []; //indices of in-range boids
            const distances = []; //Distances of in-range boids
            const cohesionVec = [p0.position.x,p0.position.y,p0.position.z]; //Mean position of all boids for cohesion multiplier
            const separationVec = [0,0,0]; //Sum of a-b vectors, weighted by 1/x to make closer boids push harder.
            const alignmentVec = [p0.velocity.x,p0.velocity.y,p0.velocity.z]; //Perpendicular vector from average of boids velocity vectors. Higher velocities have more alignment pull.
            const attractionVec = [0,0,0];
            let groupCount = 1;
    
            nested:
            for(let j = 0; j < particles.length; j++) {
                let p = particles[j];
                if(distances.length > p0.boid.groupSize || j >= p0.boid.searchLimit) { break nested; }

                let randj = Math.floor(Math.random()*particles.length); // Get random index
                if(j===i || randj === i || inRange.indexOf(randj) > -1) {  } else {
                    let pr = particles[randj];
                    let disttemp = this.distance3D(p0.position,pr.position);
                    
                    if(disttemp > p0.boid.groupRadius) { } else {
                        distances.push(disttemp);
                        inRange.push(randj);
                
                        if(p0.boid.useCohesion){
                            cohesionVec[0] = cohesionVec[0] + pr.position.x;
                            cohesionVec[1] = cohesionVec[1] + pr.position.y;
                            cohesionVec[2] = cohesionVec[2] + pr.position.z;
                        }

                        if(isNaN(disttemp) || isNaN(cohesionVec[0]) || isNaN(pr.position.x)) {
                            console.log(disttemp, i, randj, p0.position, pr.position, cohesionVec); p0.position.x = NaN; 
                            return;
                        }

                        if(p0.boid.useSeparation){
                            let distInv = (1/(disttemp*disttemp));
                            if(distInv == Infinity) distInv = p.maxSpeed;
                            else if (distInv == -Infinity) distInv = -p.maxSpeed;
                            separationVec[0] = separationVec[0] + (p0.position.x-pr.position.x)*distInv;
                            separationVec[1] = separationVec[1] + (p0.position.y-pr.position.y)*distInv; 
                            separationVec[2] = separationVec[2] + (p0.position.z-pr.position.z)*distInv;
                        }

                        if(p0.useAttraction) {
                            this.calcAttraction(p0,pr,disttemp,timeStep);
                        }

                        if(p0.boid.useAlignment){
                            //console.log(separationVec);
                            alignmentVec[0] = alignmentVec[0] + pr.velocity.x; 
                            alignmentVec[1] = alignmentVec[1] + pr.velocity.y;
                            alignmentVec[2] = alignmentVec[2] + pr.velocity.z;
                        }

                        groupCount++;
                    }
                }
            }    


            let _groupCount = 1/groupCount;
    
            if(p0.boid.useCohesion){
                cohesionVec[0] = p0.boid.cohesion*(cohesionVec[0]*_groupCount-p0.position.x);
                cohesionVec[1] = p0.boid.cohesion*(cohesionVec[1]*_groupCount-p0.position.y);
                cohesionVec[2] = p0.boid.cohesion*(cohesionVec[2]*_groupCount-p0.position.z);
            } else { cohesionVec[0] = 0; cohesionVec[1] = 0; cohesionVec[2] = 0; }

            if(p0.boid.useCohesion){
                alignmentVec[0] = -(p0.boid.alignment*alignmentVec[1]*_groupCount);
                alignmentVec[1] = p0.boid.alignment*alignmentVec[0]*_groupCount;
                alignmentVec[2] = p0.boid.alignment*alignmentVec[2]*_groupCount;//Use a perpendicular vector [-y,x,z]
            } else { alignmentVec[0] = 0; alignmentVec[1] = 0; alignmentVec[2] = 0; }    

            if(p0.boid.useCohesion){
                separationVec[0] = p0.boid.separation*separationVec[0];
                separationVec[1] = p0.boid.separation*separationVec[1];
                separationVec[2] = p0.boid.separation*separationVec[2];
            } else { separationVec[0] = 0; separationVec[1] = 0; separationVec[2] = 0; }

            const swirlVec = [0,0,0];
            if(p0.boid.useSwirl == true){
                swirlVec[0] = -(p0.position.z-p0.boid.swirl.z)*p0.boid.swirl.mul;
                swirlVec[1] = (p0.position.y-p0.boid.swirl.y)*p0.boid.swirl.mul;
                swirlVec[2] = (p0.position.x-p0.boid.swirl.x)*p0.boid.swirl.mul
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
        let success = this.calcBoids(group.particles, timeStep);
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

    addRule(
        type='',
        groupRuleGen=(particle,rule)=>{},
        timestepFunc=(group,timestep)=>{},
        animateParticle=(particle)=>{}
    ) {
        if(type.length > 0 && typeof groupRuleGen === 'function' && typeof timestepFunc === 'function' && typeof animateParticle === 'function'){
            this.rules.push({
                type:type,
                groupRuleGen:groupRuleGen,
                timestepFunc:timestepFunc,
                animateParticle:animateParticle
            });
        } else return false;
    }

    addGroup(
        rule=['boids',50]
    ) 
        {
        
        if(!Array.isArray(rule)) return false;
        
        let type = rule[0];
        let count = rule[1];

        if(!rule[0] || !rule[1]) return false;

        let timestepFunc, groupRuleGen, animateParticle;
        
        this.rules.forEach((rule)=> {
            if(type === rule.type) {
                timestepFunc = rule.timestepFunc;
                groupRuleGen = rule.groupRuleGen;
                animateParticle = rule.animateParticle;
            }
        });

        if(!timestepFunc || !groupRuleGen || (this.defaultCanvas && !animateParticle)) return false;

        let newGroup = new Array(count).fill(0);

        let attractorx = Math.random()*0.5+0.25;
        let attractory = Math.random()*0.5+0.25;
        let attractorz = Math.random()*0.5+0.25;

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

    removeGroup = (idx) => {
        this.particles.splice(idx,1);
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

                this.canvas.style.width = this.canvas.parentNode.clientWidth;
                this.canvas.style.height = this.canvas.parentNode.clientHeight;
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