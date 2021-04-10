class Math3D{constructor(){}static dot(t,i){for(var o=0,a=0;a<vec.length;a++)o+=t[a]*i[a]}static cross3D(t,i){return[t[1]*i[2]-t[2]*i[1],t[2]*i[0]-t[0]*i[2],t[0]*i[1]-t[1]*i[0]]}static magnitude(t){var i=0;return t.forEach(o=>{i+=o*o}),Math.sqrt(i)}static distance(t,i){var o=0;return t.forEach((a,e)=>{o+=(i[e]-a)*(i[e]-a)}),Math.sqrt(o)}static makeVec(t,i){var o=[];return t.forEach((a,e)=>{o.push(i[e]-a)}),o}static calcNormal(t,i,o,a=!0){var e=makeVec(t,i),s=makeVec(t,o);return a===!0?this.cross3D(e,s):this.cross3D(s,e)}static calcNormalMesh(t){for(var i=[...t],o=0;o<t.length;o+=9){var a=this.calcNormal([t[o],t[o+1],t[o+2]],[t[o+3],t[o+4],t[o+5]],[t[o+6],t[o+7],t[o+8]]);i[o]=a[0],i[o+1]=a[1],i[o+2]=a[2],i[o+3]=a[0],i[o+4]=a[1],i[o+5]=a[2],i[o+6]=a[0],i[o+7]=a[1],i[o+8]=a[2]}return i}static normalize(t){var i=0;i=this.magnitude(t);var o=[];return t.forEach((a,e)=>{o.push(a*i)}),o}static rotateMesh(t,i,o,a){for(var e=Math.cos(a),s=Math.sin(a),r=Math.cos(i),l=Math.sin(i),c=Math.cos(o),n=Math.sin(o),u=e*r,m=e*l*n-s*c,g=e*l*c+s*n,P=s*r,_=s*l*n+e*c,R=s*l*c-e*n,b=-l,z=r*n,D=r*c,T=[...t],f=0;f<t.length;f+=3){var B=t[f],w=t[f+1],y=t[f+2];T[f]=u*B+m*w+g*y,T[f+1]=P*B+_*w+R*y,T[f+2]=b*B+z*w+D*y}return T}static translateMesh(t,i,o,a){for(var e=[...t],s=0;s<t.length;s+=3)e[s]=t[s]+i,e[s+1]=t[s+1]+o,e[s+2]=t[s+2]+a}static scaleMesh(t,i,o,a){for(var e=[...t],s=0;s<t.length;s+=3)e[s]=t[s]*i,e[s+1]=t[s+1]*o,e[s+2]=t[s+2]*a}static transposeMat2D(t){return t[0].map((i,o)=>mat2.map(a=>a[o]))}static matmul2D(t,i){for(var o=t.length,a=t[0].length,e=i.length,s=i[0].length,r=new Array(o),l=0;l<o;++l){r[l]=new Array(s);for(var c=0;c<s;++c){r[l][c]=0;for(var n=0;n<a;++n)r[l][c]+=t[l][n]*i[n][c]}}return r}static makeIdentityM4(){return[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]}static makeTranslationM4(t,i,o){return[[1,0,0,0],[0,1,0,0],[0,0,1,0],[t,i,o,1]]}static translateM4(t,i,o,a){var e=this.makeTranslationM4(i,o,a);return Math3D.matmul2D(t,e)}static makeScaleM4(t,i,o){return[[t,0,0,0],[0,i,0,0],[0,0,o,0],[0,0,0,1]]}static scaleM4(t,i,o,a){var e=this.makeScaleM4(i,o,a);return Math3D.matmul2Dtiply(t,e)}static xRotationM4(t){var i=Math.cos(t),o=Math.sin(t);return[[1,0,0,0],[0,i,o,0],[0,-o,i,0],[0,0,0,1]]}static yRotationM4(t){var i=Math.cos(t),o=Math.sin(t);return[[i,0,-o,0],[0,1,0,0],[o,0,i,0],[0,0,0,1]]}static zRotationM4(t){var i=Math.cos(t),o=Math.sin(t);return[[i,o,0,0],[-o,i,0,0],[0,0,1,0],[0,0,0,1]]}static lookAtM4(t=[0,0,0],i=[1,1,1],o=[0,1,0]){var a=this.normalize([t[0]-i[0],t[1]-i[1],t[2]-i[2]]),e=this.normalize(this.cross3D(o,a)),s=this.normalize(this.cross3D(a,e));return[[e[0],e[1],e[2],0],[s[0],s[1],s[2],0],[a[0],a[1],a[2],0],[t[0],t[1],t[2],1]]}static rotateM4(t,i,o,a){var e=[...t];return i!==0&&(e=Math3D.matmul2D(e,this.xRotationM4(i))),o!==0&&(e=Math3D.matmul2D(e,this.yRotationM4(o))),a!==0&&(e=Math3D.matmul2D(e,this.zRotationM4(a))),e}static rotatePoint1AboutPoint2(t,i,o,a,e){let s=Math3D.matmul2D(this.translateM4(this.rotateM4(this.makeTranslationM4(i[0],i[1],i[2]),o,a,e),-i[0],-i[1],-i[2]),[...t,1]);return[s[0][3],s[1][3],s[2][3]]}static invertM4(t){var i=t,o=[...t];return o[0][0]=i[1][1]*i[2][2]*i[3][3]-i[1][1]*i[2][3]*i[3][2]-i[2][1]*i[1][2]*i[3][3]+i[2][1]*i[1][3]*i[3][2]+i[3][1]*i[1][2]*i[2][3]-i[3][1]*i[1][3]*i[2][2],o[1][0]=-i[1][0]*i[2][2]*i[3][3]+i[1][0]*i[2][3]*i[3][2]+i[2][0]*i[1][2]*i[3][3]-i[2][0]*i[1][3]*i[3][2]-i[3][0]*i[1][2]*i[2][3]+i[3][0]*i[1][3]*i[2][2],o[2][0]=i[1][0]*i[2][1]*i[3][3]-i[1][0]*i[2][3]*i[3][1]-i[2][0]*i[1][1]*i[3][3]+i[2][0]*i[1][3]*i[3][1]+i[3][0]*i[1][1]*i[2][3]-i[3][0]*i[1][3]*i[2][1],o[3][0]=-i[1][0]*i[2][1]*i[3][2]+i[1][0]*i[2][2]*i[3][1]+i[2][0]*i[1][1]*i[3][2]-i[2][0]*i[1][2]*i[3][1]-i[3][0]*i[1][1]*i[2][2]+i[3][0]*i[1][2]*i[2][1],o[0][1]=-i[0][1]*i[2][2]*i[3][3]+i[0][1]*i[2][3]*i[3][2]+i[2][1]*i[0][2]*i[3][3]-i[2][1]*i[0][3]*i[3][2]-i[3][1]*i[0][2]*i[2][3]+i[3][1]*i[0][3]*i[2][2],o[1][1]=i[0][0]*i[2][2]*i[3][3]-i[0][0]*i[2][3]*i[3][2]-i[2][0]*i[0][2]*i[3][3]+i[2][0]*i[0][3]*i[3][2]+i[3][0]*i[0][2]*i[2][3]-i[3][0]*i[0][3]*i[2][2],o[2][1]=-i[0][0]*i[2][1]*i[3][3]+i[0][0]*i[2][3]*i[3][1]+i[2][0]*i[0][1]*i[3][3]-i[2][0]*i[0][3]*i[3][1]-i[3][0]*i[0][1]*i[2][3]+i[3][0]*i[0][3]*i[2][1],o[3][1]=i[0][0]*i[2][1]*i[3][2]-i[0][0]*i[2][2]*i[3][1]-i[2][0]*i[0][1]*i[3][2]+i[2][0]*i[0][2]*i[3][1]+i[3][0]*i[0][1]*i[2][2]-i[3][0]*i[0][2]*i[2][1],o[0][2]=i[0][1]*i[1][2]*i[3][3]-i[0][1]*i[1][3]*i[3][2]-i[1][1]*i[0][2]*i[3][3]+i[1][1]*i[0][3]*i[3][2]+i[3][1]*i[0][2]*i[1][3]-i[3][1]*i[0][3]*i[1][2],o[1][2]=-i[0][0]*i[1][2]*i[3][3]+i[0][0]*i[1][3]*i[3][2]+i[1][0]*i[0][2]*i[3][3]-i[1][0]*i[0][3]*i[3][2]-i[3][0]*i[0][2]*i[1][3]+i[3][0]*i[0][3]*i[1][2],o[2][2]=i[0][0]*i[1][1]*i[3][3]-i[0][0]*i[1][3]*i[3][1]-i[1][0]*i[0][1]*i[3][3]+i[1][0]*i[0][3]*i[3][1]+i[3][0]*i[0][1]*i[1][3]-i[3][0]*i[0][3]*i[1][1],o[3][2]=-i[0][0]*i[1][1]*i[3][2]+i[0][0]*i[1][2]*i[3][1]+i[1][0]*i[0][1]*i[3][2]-i[1][0]*i[0][2]*i[3][1]-i[3][0]*i[0][1]*i[1][2]+i[3][0]*i[0][2]*i[1][1],o[0][3]=-i[0][1]*i[1][2]*i[2][3]+i[0][1]*i[1][3]*i[2][2]+i[1][1]*i[0][2]*i[2][3]-i[1][1]*i[0][3]*i[2][2]-i[2][1]*i[0][2]*i[1][3]+i[2][1]*i[0][3]*i[1][2],o[1][3]=i[0][0]*i[1][2]*i[2][3]-i[0][0]*i[1][3]*i[2][2]-i[1][0]*i[0][2]*i[2][3]+i[1][0]*i[0][3]*i[2][2]+i[2][0]*i[0][2]*i[1][3]-i[2][0]*i[0][3]*i[1][2],o[2][3]=-i[0][0]*i[1][1]*i[2][3]+i[0][0]*i[1][3]*i[2][1]+i[1][0]*i[0][1]*i[2][3]-i[1][0]*i[0][3]*i[2][1]-i[2][0]*i[0][1]*i[1][3]+i[2][0]*i[0][3]*i[1][1],o[3][3]=i[0][0]*i[1][1]*i[2][2]-i[0][0]*i[1][2]*i[2][1]-i[1][0]*i[0][1]*i[2][2]+i[1][0]*i[0][2]*i[2][1]+i[2][0]*i[0][1]*i[1][2]-i[2][0]*i[0][2]*i[1][1],o}static bufferMat2D(t){var i=[];return t.forEach((o,a)=>{i.push(...o)}),new Float32Array(i)}static nearestNeighborSearch(t,i){let o={idx:null,position:[0,0,0],neighbors:[]},a={idx:null,position:[0,0,0],dist:null};for(var e=[],s=0;s<t.length;s++){let u=JSON.parse(JSON.stringify(o));u.idx=s,u.position=t[s],e.push(u)}for(var s=0;s<t.length;s++){for(var r=s;r<t.length;r++){var l=Math3D.distance(t[s],t[r]);if(l<i){var c=JSON.parse(JSON.stringify(a));c.position=t[r],c.dist=l,c.idx=e[r].idx,e[s].neighbors.push(c);var n=JSON.parse(JSON.stringify(a));n.position=t[s],n.dist=l,n.idx=t[r]}}e[s].neighbors.sort(function(m,g){return m.dist-g.dist})}return e}}class graphNode{constructor(t=null,i=[null],o=null){this.id=o,this.parent=t,this.children=i,this.globalPos={x:0,y:0,z:0},this.localPos={x:0,y:0,z:0},this.globalRot={x:0,y:0,z:0},this.localRot={x:0,y:0,z:0},this.globalScale={x:1,y:1,z:1},this.localScale={x:1,y:1,z:1},this.functions=[],this.model=null,this.mesh=[0,0,0,1,1,1,1,0,0,0,0,0],this.normals=[],this.colors=[0,0,0,255,255,255,255,0,0,0,0,0],this.materials=[],this.textures=[],t!==null&&this.inherit(t)}inherit(t){this.parent=t,this.globalPos=t.globalPos,this.globalRot=t.globalRot,this.globalScale=t.globalScale,this.functions.concat(t.functions),this.children.forEach(i=>{i.inherit(t)})}addChild(t){this.children.push(t)}removeChild(t){this.children.forEach((i,o)=>{i.id==t&&this.children.splice(o,1)})}translateMeshGlobal(t=[0,0,0]){this.globalPos.x+=t[0],this.globalPos.y+=t[1],this.globalPos.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.translateMesh(this.mesh,this.globalPos.x,this.globalPos.y,this.globalPos.z)),this.normals.length>0&&(this.normals=Math3D.translateMesh(this.normals,this.globalPos.x,this.globalPos.y,this.globalPos.z)),this.children.forEach(i=>{i.translateMeshGlobal(t)})}rotateMeshGlobal(t=[0,0,0]){this.globalRot.x+=t[0],this.globalRot.y+=t[1],this.globalRot.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.rotateMesh(this.mesh,this.globalRot.x,this.globalRot.y,this.globalRot.z)),this.normals.length>0&&(this.normals=Math3D.rotateMesh(this.normals,this.globalRot.x,this.globalRot.y,this.globalRot.z)),this.children.forEach(i=>{i.rotateMeshGlobal(t)})}translateMeshLocal(t=[0,0,0]){this.localPos.x+=t[0],this.localPos.y+=t[1],this.localPos.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.translateMesh(this.mesh,this.localPos.x,this.localPos.y,this.localPos.z)),this.normals.length>0&&(this.normals=Math3D.translateMesh(this.normals,this.localPos.x,this.localPos.y,this.localPos.z)),this.children.forEach(i=>{i.translateMeshLocal(t)})}translateMeshGlobal(t=[0,0,0]){this.localRot.x+=t[0],this.localRot.y+=t[1],this.localRot.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.rotateMesh(this.mesh,this.globalPos.x,this.globalPos.y,this.globalPos.z)),this.normals.length>0&&(this.normals=Math3D.rotateMesh(this.normals,this.globalPos.x,this.globalPos.y,this.globalPos.z)),this.children.forEach(i=>{i.translateMeshGlobal(t)})}scaleMeshLocal(t=[1,1,1]){this.localScale.x+=t[0],this.localScale.y+=t[1],this.localScale.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.scaleMesh(this.mesh,this.localScale.x,this.localScale.y,this.localScale.z)),this.normals.length>0&&(this.normals=Math3D.scaleMesh(this.normals,this.localScale.x,this.localScale.y,this.localScale.z)),this.children.forEach(i=>{i.scaleMeshLocal(offset)})}scaleMeshGlobal(t=[1,1,1]){this.globalScale.x+=t[0],this.globalScale.y+=t[1],this.globalScale.z+=t[2],this.mesh.length>0&&(this.mesh=Math3D.scaleMesh(this.mesh,this.globalScale.x,this.globalScale.y,this.globalScale.z)),this.normals.length>0&&(this.normals=Math3D.scaleMesh(this.normals,this.globalScale.x,this.globalScale.y,this.globalScale.z)),this.children.forEach(i=>{i.scaleMeshGlobal(offset)})}applyMeshTransforms(){var t=Math3D.rotateMesh(this.mesh,this.globalRot.x+this.localRot.x,this.globalRot.y+this.localRot.y,this.globalRot.z+this.localRot.z),i=Math3D.translateMesh(t,this.globalPos.x+this.localPos.x,this.globalPos.y+this.localPos.y,this.globalPos.z+this.localPos.z),o=Math3D.scaleMesh(i,this.globalScale.x+this.localScale.x,this.globalScale.y+this.localScale.y,this.globalScale.z+this.localScale.z);return o}}class Camera{constructor(t=[0,0,0],i=[0,100,0],o=[0,1,0],a=window.innerWidth,e=window.innerHeight){this.position={x:t[0],y:t[1],z:t[2]},this.target={x:i[0],y:i[1],z:i[2]},this.up={x:o[0],y:o[1],z:o[2]},this.fov=90,this.aspect=a/e,this.near=0,this.far=1e3,this.fx=1,this.fy=1,this.cx=a*.5,this.cy=e*.5,this.cameraMat=this.getLookAtViewProjectionMatrix(t,i,o)}getPerspectiveMatrix(t=this.fov,i=this.aspect,o=this.near,a=this.far){var e=1/Math.tan(t/2),s=1/(o-a);return[[e/i,0,0,0],[0,e,0,0],[0,0,(o+a)*s,-1],[0,0,o*a*s*2,0]]}getProjectionMatrix(t,i,o){return[[2/t,0,0,0],[0,-2/i,0,0],[0,0,2/o,0],[-1,1,0,1]]}getCameraMatrix(t=this.fx,i=this.fy,o=this.cx,a=this.cx){return[[t,0,o,0],[0,i,a,0],[0,0,1,0]]}getCameraViewProjectionMatrix(t=this.position.x,i=this.position.y,o=this.position.z,a=0,e=0,s=0){var r=this.getCameraMatrix(this.fx,this.fy);r=Math3D.rotateM4(r,a,e,s),r=Math3D.translateM4(r,t,i,o);var l=Math3D.invertM4(r);return Math3D.matmul2D(this.getPerspectiveMatrix(),l)}getLookAtViewProjectionMatrix(t,i,o){var a=Math3D.lookAtM4(t,i,o),e=Math3D.invertM4(a);return Math3D.matmul2D(this.getPerspectiveMatrix(),e)}getCameraTransform(){return Float32Array(Math3D.bufferMat2D(this.cameraMat))}updateRotation(t=0,i=0,o=0){this.cameraMat=Math3D.rotateM4(this.cameraMat,t,i,o)}updateTranslation(t=this.position.x,i=this.position.y,o=this.position.z){this.cameraMat=Math3D.translateM4(this.cameraMat,t,i,o)}rotateCameraAboutPoint(t=0,i=0,o=0,a,e,s){var r=[t,i,o],l=Math3D.rotatePoint1AboutPoint2(this.position,r,a,e,s);this.position={x:l[0],y:l[1],z:l[2]},this.updateTranslation(),this.updateRotation(-a,-e,-s)}moveCamera(t=0,i=0,o=0){this.position={x:t,y:i,z:o},this.updateTranslation()}}class Physics{constructor(t=10){this.physicsBodies=[],this.globalSettings={maxDistCheck:1e3,gravity:9.81},this.bodySettings={index:null,collisionEnabled:!0,collisionType:"Sphere",collisionRadius:1,collisionBoundsScale:[1,1,1],dynamic:!0,position:[0,0,0],velocity:[0,0,0],acceleration:[0,0,0],forceImpulse:[0,0,0],mass:1,drag:0,restitution:1,friction:0,attractor:!1,attractionAccel:9.81,trigger:!1,triggerFunc:null,child:null};for(let i=0;i<t;i++)this.physicsBodies.push(JSON.parse(JSON.stringify(this.bodySettings))),this.physicsBodies[i].index=i}timeStep(t){this.physicsBodies.forEach((i,o)=>{for(var a=o+1;a<this.physicsBodies.length;a++){var e=this.physicsBodies[a],s=this.collisionCheck(i,e);s===!0&&(this.resolveCollision(i,e),this.resolveCollision(e,i)),i.attractor===!0&&e.attractor===!0&&this.resolveAttractor(i,e)}i.acceleration[0]+=forceImpulse[0]/i.mass-i.acceleration[0]*drag,i.acceleration[0]+=forceImpulse[1]/i.mass-i.acceleration[1]*drag,i.acceleration[0]+=forceImpulse[2]/i.mass-i.acceleration[2]*drag-this.globalSettings.gravity*t,i.forceImpulse=[0,0,0],i.velocity[0]+=i.acceleration[0]*t,i.velocity[1]+=i.acceleration[1]*t,i.velocity[2]+=i.acceleration[2]*t,i.position[0]+=i.velocity[0]*t,i.position[1]+=i.velocity[1]*t,i.position[2]+=i.velocity[2]*t})}addBody(t=null){this.physicsBodies.push(new this.bodySettings),this.physicsBodies[this.physicsBodies.length-1].index=this.physicsBodies.length-1,this.physicsBodies[this.physicsBodies.length-1].child=t}removeBody(t){this.physicsBodies.splice(t,1),this.physicsBodies.forEach((i,o)=>{i.index=o})}calcVelocityStep(t=[0,0,0],i=[0,0,0],o){return[t[0]*o+i[0]*o*o,t[1]*o+i[1]*o*o,t[2]*o+i[2]*o*o]}calcForce(t,i=[0,0,0]){return[t*i[0],t*i[1],t*i[2]]}calcAccelFromForce(t=[0,0,0],i=0){return[t[0]/i,t[1]/i,t[2]/i]}resolveCollision(t,i){var o=Math3D.makeVec(t.position,i.position),a=Math3D.normalize(o);if(i.collisionType==="Sphere"||i.collisionType==="Point"){var e=Math3D.magnitude(t.velocity),s=Math3D.magnitude(i.acceleration),r=Math3D.normalize(i.acceleration);t.velocity=[-a[0]*e*t.restitution,-a[1]*e*t.restitution,-a[2]*e*t.restitution],t.forceImpulse[0]-=s*r[0]*i.mass,t.forceImpulse[1]-=s*r[1]*i.mass,t.forceImpulse[2]-=s*r[2]*i.mass}else if(i.collisionType==="Box"){var l=Math.max(...o),c=Math.min(...o),n=l;Math.abs(c)>l&&(n=c);var u=o.indexOf(n);t.velocity[u]=-t.velocity[u]*t.restitution;var s=Math3D.magnitude(i.acceleration),r=Math3D.normalize(i.acceleration);t.forceImpulse[u]=-r[u]*s*i.mass}}resolveAttractor(t,i){var o=Math3D.distance(t.position,i.position),a=Math3D.normalize(Math3D.makeVec(t.position,i.position)),e=Math3D.normalize(Math3D.makeVec(i.position,t.position)),s=6674e-14*t.mass*i.mass/(o*o);FgOnBody1=[a[0]*s,a[1]*s,a[2]*s],FgOnBody2=[e[0]*s,e[1]*s,e[2]*s],t.forceImpulse[0]+=FgOnBody1[0],t.forceImpulse[1]+=FgOnBody1[1],t.forceImpulse[2]+=FgOnBody1[2],i.forceImpulse[0]+=FgOnBody2[0],i.forceImpulse[1]+=FgOnBody2[1],i.forceImpulse[2]+=FgOnBody2[2]}collisionCheck(t,i){if(t.collisionEnabled===!1||i.collisionEnabled===!1)return!1;if(Math3D.distance(t.position,i.position)<Math.max(...t.scale)*t.collisionRadius+Math.max(...i.scale)*i.collisionRadius){let o=!1;return t.collisionType==="Sphere"?(i.collisionType==="Sphere"&&(o=this.sphericalCollisionCheck(t.idx,i.idx)),i.collisionType==="Box"&&(o=this.sphereBoxCollisionCheck(body1Idx,body2Idx)),i.collisionType==="Point"&&(o=this.isPointInsideSphere(i.position,t.idx))):t.collisionType==="Box"?(i.collisionType==="Sphere"&&(o=this.sphereBoxCollisionCheck(i.idx,t.idx)),i.collisionType==="Box"&&(o=this.boxCollisionCheck(t.idx,i.idx)),i.collisionType==="Point"&&(o=this.isPointInsideBox(t.position,t.idx))):t.collisionType==="Point"&&(i.collisionType==="Sphere"&&(o=this.isPointInsideSphere(t.position,i.idx)),i.collisionType==="Box"&&(o=this.isPointInsideBox(t.position,i.idx))),o}else return!1}isPointInsideSphere(t,i){let o=this.physicsBodies[bodyIdx];return Math3D.distance(point1,o.position)<o.collisionRadius}sphericalCollisionCheck(t,i){let o=this.physicsBodies[t],a=this.physicsBodies[i];return Math3D.distance(o.position,a.position)<o.collisionRadius+a.collisionRadius}isPointInsideBox(t,i){let o=this.physicsBodies[i],a=(o.position[0]-o.collisionRadius)*o.collisionBoundsScale[0],e=(o.position[0]+o.collisionRadius)*o.collisionBoundsScale[0],s=(o.position[1]-o.collisionRadius)*o.collisionBoundsScale[0],r=(o.position[1]+o.collisionRadius)*o.collisionBoundsScale[0],l=(o.position[2]-o.collisionRadius)*o.collisionBoundsScale[0],c=(o.position[2]+o.collisionRadius)*o.collisionBoundsScale[0];return t[0]>=a&&t[0]<=e&&t[1]>=s&&t[1]<=r&&t[2]>=l&&t[2]<=c}boxCollisionCheck(t,i){let o=this.physicsBodies[t],a=this.physicsBodies[i],e=(o.position[0]-o.collisionRadius)*o.collisionBoundsScale[0],s=(o.position[0]+o.collisionRadius)*o.collisionBoundsScale[0],r=(o.position[1]-o.collisionRadius)*o.collisionBoundsScale[1],l=(o.position[1]+o.collisionRadius)*o.collisionBoundsScale[1],c=(o.position[2]-o.collisionRadius)*o.collisionBoundsScale[2],n=(o.position[2]+o.collisionRadius)*o.collisionBoundsScale[2],u=(a.position[0]-a.collisionRadius)*o.collisionBoundsScale[0],m=(a.position[0]+a.collisionRadius)*o.collisionBoundsScale[0],g=(a.position[1]-a.collisionRadius)*o.collisionBoundsScale[1],P=(a.position[1]+a.collisionRadius)*o.collisionBoundsScale[1],_=(a.position[2]-a.collisionRadius)*o.collisionBoundsScale[2],R=(a.position[2]+a.collisionRadius)*o.collisionBoundsScale[2];return(s<=m&&s>=u||e<=m&&e>=u)&&(l<=P&&l>=g||r<=P&&r>=g)&&(n<=R&&n>=_||c<=R&&c>=_)}sphereBoxCollisionCheck(t,i){let o=this.physicsBodyIdx[t],a=this.physicsBodyIdx[i],e=(a.position[0]-a.collisionRadius)*a.collisionBoundsScale[0],s=(a.position[0]+a.collisionRadius)*a.collisionBoundsScale[0],r=(a.position[1]-a.collisionRadius)*a.collisionBoundsScale[1],l=(a.position[1]+a.collisionRadius)*a.collisionBoundsScale[1],c=(a.position[2]-a.collisionRadius)*a.collisionBoundsScale[2],n=(a.position[2]+a.collisionRadius)*a.collisionBoundsScale[2],u=[Math.max(e,Math.min(o.position[0],s)),Math.max(r,Math.min(o.position[1],l)),Math.max(c,Math.min(o.position[2],n))];return Math3D.distance(o.position,u)>o.collisionRadius}}class Primitives{constructor(){}static FibSphere(t){for(var i=(1+Math.sqrt(5))*.5,o=(2-i)*(2*Math.PI),a=[],e=0;e<t;e++){var s=e/t,r=Math.acos(1-2*s),l=o*e,c=Math.sin(r)*Math.cos(l),n=Math.sin(r)*Math.sin(l),u=Math.cos(r);a.push(c,n,u)}return a}static Sphere(t=10){}static Cube(t=1,i=1,o=1){}static Pyramid(t=1,i=1,o=1){}static Cone(t=1,i=1,o=20){}static Cylinder(t=1,i=1,o=20){}static Torus(t=1,i=.1,o=20){}}class WebGLHelper{constructor(t){this.canvas=document.getElementById(t),this.gl=canvas.getContext("webgl"),!!gl&&(this.vertexShader=null,this.fragmentShader=null,this.program=null,this.shaders=[])}genBasicShaders(t="vertex-shader",i="fragment-shader"){var o=`
            <script id="`+t+`" type="x-shader/x-vertex">

                attribute vec4 a_position; 

                attribute vec3 a_normal; 


                uniform vec3 u_lightWorldPosition; 

                uniform vec3 u_viewWorldPosition; 


                uniform mat4 u_world; 

                uniform mat4 u_worldViewProjection; 

                uniform mat4 u_worldInverseTranspose; 


                varying vec3 v_normal; 


                varying vec3 v_surfaceToLight; 

                varying vec3 v_surfaceToView; 


                void main() { 

                    gl_Position = u_worldViewProjection * a_position; 


                    v_normal = mat3(u_worldInverseTranspose) * a_normal; 


                    vec3 surfaceWorldPosition = (u_world * a_position).xyz; 


                    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition; 


                    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition; 

                }

            </script>`,a=`
            <script id="`+i+`" type="x-shader/x-fragment"> 


                precision mediump float; 


                varying vec3 v_normal; 

                varying vec3 v_surfaceToLight; 

                varying vec3 v_surfaceToView; 


                uniform vec4 u_color; 

                uniform float u_shininess; 

                uniform vec3 u_lightDirection; 

                uniform float u_innerLimit; 

                uniform float u_outerLimit; 


                void main() { 

                    vec3 normal = normalize(v_normal); 


                    vec3 surfaceToLightDirection = normalize(v_surfaceToLight); 

                    vec3 surfaceToViewDirection = normalize(v_surfaceToView); 

                    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); 


                    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection); 

                    float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection); 

                    float light = inLight * dot(normal, surfaceToLightDirection); 

                    float specular = inLight * pow(dot(normal, halfVector), u_shininess); 


                    gl_FragColor = u_color; 

                    gl_FragColor.rgb *= light; 

                    gl_FragColor.rgb += specular; 

                }

            </script>`;this.canvas.insertAdjacentHTML("beforebegin",o),this.canvas.insertAdjacentHTML("beforebegin",a),this.vertexShader=document.getElementById(t).text,this.fragmentShader=document.getElementById(i).text}static createShader(t,i,o){var a=t.createShader(i);t.shaderSource(a,o),t.compileShader(a);var e=t.getShaderParameter(a,t.COMPILE_STATUS);if(e)return this.shaders.push(a),a;console.log(t.getShaderInfoLog(a)),t.deleteShader(a)}static createProgram(t,i,o){var a=t.createProgram();t.attachShader(a,i),t.attachShader(a,o),t.linkProgram(a);var e=t.getProgramParameter(a,t.LINK_STATUS);if(e)return this.program=a,a;console.log(t.getProgramInfoLog(a)),t.deleteProgram(a)}resizeCanvas(t,i){this.canvas.width=t,this.canvas.height=i}}function testWebGLRender(S){var t=document.getElementById(S),i=t.getContext("webgl");if(!i)return;var o=`
            <script id="`+vId+`" type="x-shader/x-vertex">

                attribute vec4 a_position; 

                attribute vec3 a_normal; 


                uniform vec3 u_lightWorldPosition; 

                uniform vec3 u_viewWorldPosition; 


                uniform mat4 u_world; 

                uniform mat4 u_worldViewProjection; 

                uniform mat4 u_worldInverseTranspose; 


                varying vec3 v_normal; 


                varying vec3 v_surfaceToLight; 

                varying vec3 v_surfaceToView; 


                void main() { 

                    gl_Position = u_worldViewProjection * a_position; 


                    v_normal = mat3(u_worldInverseTranspose) * a_normal; 


                    vec3 surfaceWorldPosition = (u_world * a_position).xyz; 


                    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition; 


                    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition; 

                }

            </script>`,a=`
            <script id="`+fId+`" type="x-shader/x-fragment"> 


                precision mediump float; 


                varying vec3 v_normal; 

                varying vec3 v_surfaceToLight; 

                varying vec3 v_surfaceToView; 


                uniform vec4 u_color; 

                uniform float u_shininess; 

                uniform vec3 u_lightDirection; 

                uniform float u_innerLimit; 

                uniform float u_outerLimit; 


                void main() { 

                    vec3 normal = normalize(v_normal); 


                    vec3 surfaceToLightDirection = normalize(v_surfaceToLight); 

                    vec3 surfaceToViewDirection = normalize(v_surfaceToView); 

                    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); 


                    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection); 

                    float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection); 

                    float light = inLight * dot(normal, surfaceToLightDirection); 

                    float specular = inLight * pow(dot(normal, halfVector), u_shininess); 


                    gl_FragColor = u_color; 

                    gl_FragColor.rgb *= light; 

                    gl_FragColor.rgb += specular; 

                }

            </script>`;document.body.insertAdjacentHTML("afterbegin",o),document.body.insertAdjacentHTML("afterbegin",a);function e(h,p,x){var v=h.createShader(p);h.shaderSource(v,x),h.compileShader(v);var d=h.getShaderParameter(v,h.COMPILE_STATUS);if(d)return v;console.log(h.getShaderInfoLog(v)),h.deleteShader(v)}function s(h,p,x){var v=h.createProgram();h.attachShader(v,p),h.attachShader(v,x),h.linkProgram(v);var d=h.getProgramParameter(v,h.LINK_STATUS);if(d)return v;console.log(h.getProgramInfoLog(v)),h.deleteProgram(v)}var r=document.querySelector("#vertex-shader-3d").text,l=document.querySelector("#fragment-shader-3d").text,o=e(i,i.VERTEX_SHADER,r),c=e(i,i.FRAGMENT_SHADER,l),n=s(i,o,c),u=i.getAttribLocation(n,"a_position"),m=i.getAttribLocation(n,"a_normal"),g=i.getUniformLocation(n,"u_worldViewProjection"),P=i.getUniformLocation(n,"u_worldInverseTranspose"),_=i.getUniformLocation(n,"u_color"),R=i.getUniformLocation(n,"u_shininess"),b=i.getUniformLocation(n,"u_lightDirection"),z=i.getUniformLocation(n,"u_innerLimit"),D=i.getUniformLocation(n,"u_outerLimit"),T=i.getUniformLocation(n,"u_lightWorldPosition"),f=i.getUniformLocation(n,"u_viewWorldPosition"),B=i.getUniformLocation(n,"u_world");function w(h){return h*180/Math.PI}function y(h){return h*Math.PI/180}var Y=0,O=150,N=0,X=0,I=[0,0,1],Z=y(10),G=y(20),F=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,F);var L=Primitives.FibSphere(1e3),H=new Uint8Array(new Array(L.length).fill(255));i.bufferData(i.ARRAY_BUFFER,new Float32Array(L),i.STATIC_DRAW);var E=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,E),i.bufferData(i.ARRAY_BUFFER,new Float32Array(Math3D.calcNormalMesh(L)),i.STATIC_DRAW);for(var A=0;A<L.length;A+=3)fibSphereColors[A]=200,fibSphereColors[A+1]=70,fibSphereColors[A+2]=120;var J=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,J),i.bufferData(i.ARRAY_BUFFER,H,i.STATIC_DRAW);var q=[0,0,300],V=[0,1,0],k=[0,0,0],U=new Camera(q,k,V,i.canvas.clientWidth*.5,i.canvas.clientHeight*.5);j();function j(){webglUtils.resizeCanvasToDisplaySize(i.canvas),i.viewport(0,0,i.canvas.width,i.canvas.height),i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),i.enable(i.CULL_FACE),i.enable(i.DEPTH_TEST),i.useProgram(n),i.enableVertexAttribArray(u),i.bindBuffer(i.ARRAY_BUFFER,F);var h=3,p=i.FLOAT,x=!1,v=0,d=0;i.vertexAttribPointer(u,h,p,x,v,d),i.enableVertexAttribArray(m),i.bindBuffer(i.ARRAY_BUFFER,E);var h=3,p=i.FLOAT,x=!1,v=0,d=0;i.vertexAttribPointer(m,h,p,x,v,d);var C=Math3D.yRotationM4(Y),K=Math3D.matmul2D(U.cameraMat,C),Q=Math3D.invertM4(C),$=Math3D.transposeMat2D(Q);i.uniformMatrix4fv(g,!1,Math3D.bufferMat2D(K)),i.uniformMatrix4fv(P,!1,Math3D.bufferMat2D($)),i.uniformMatrix4fv(B,!1,Math3D.bufferMat2D(C)),i.uniform4fv(_,[.2,1,.2,1]);const W=[40,60,120];i.uniform3fv(T,W),i.uniform3fv(f,U),i.uniform1f(R,O);{var M=Math3D.lookAtM4(W,k,V);M=Math3D.matmul2D(Math3D.xRotationM4(N),M),M=Math3D.bufferMat2D(Math3D.matmul2D(Math3D.yRotationM4(X),M)),I=[-M[8],-M[9],-M[10]]}i.uniform3fv(b,I),i.uniform1f(z,Math.cos(Z)),i.uniform1f(D,Math.cos(G));var ii=i.TRIANGLES,d=0,ti=L.length;i.drawArrays(ii,d,ti)}}
