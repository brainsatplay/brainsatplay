//Utilities for WebGL render prep. Contains graphnodes and projection matrices. For super optimal matrix math use glMatrix (https://github.com/toji/gl-matrix) or some other math utility
//TODO: lighting, quick geometry buffering functions, demonstrate physics, maybe scrap the 2D matrix math for typical quicker 1D array based matrix math.

class Math3D { //some stuff for doing math in 3D
    constructor() {

    }

    static dot(vec1,vec2) { //nDimensional vector dot product
        var dot=0;
        for(var i=0; i<vec.length; i++) {
            dot+= vec1[i]*vec2[i];
        }
    }

    static cross3D(vec1,vec2) { //3D vector cross product
        return [
            vec1[1]*vec2[2]-vec1[2]*vec2[1],
            vec1[2]*vec2[0]-vec1[0]*vec2[2],
            vec1[0]*vec2[1]-vec1[1]*vec2[0]]
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

    static makeVec(point1,point2) {  //Make vector from two nDimensional points (arrays)
        var vec = [];
        point1.forEach((c,i) => {
            vec.push(point2[i]-c);
        })
        return vec;
    }

    //Find normal to a plane define by points (v(1to2) cross v(1to3)), can set to return the reverse normal (v(1to3) cross v(1to2)). Use to calculate triangle normals
    static calcNormal(point1,point2,point3,pos=true) {
        var QR = makeVec(point1,point2);
        var QS = makeVec(point1,point3);

        if(pos === true){
            return this.cross3D(QR,QS);
        }
        else {
            return this.cross3D(QS,QR);
        }
    }

    static calcNormalMesh(mesh){
        var normalMesh = [...mesh];
        for(var i = 0; i<mesh.length; i+=9){
            var normal = this.calcNormal([mesh[i],mesh[i+1],mesh[i+2]],[mesh[i+3],mesh[i+4],mesh[i+5]],[mesh[i+6],mesh[i+7],mesh[i+8]]);
            normalMesh[ i ] = normal[0];
            normalMesh[i+1] = normal[1];
            normalMesh[i+2] = normal[2];
            normalMesh[i+3] = normal[0];
            normalMesh[i+4] = normal[1];
            normalMesh[i+5] = normal[2];
            normalMesh[i+6] = normal[0];
            normalMesh[i+7] = normal[1];
            normalMesh[i+8] = normal[2];
        }

        return normalMesh;
    }

    static normalize(vec) { //nDimensional normalization
        var norm = 0;
        norm = this.magnitude(vec);
        var vecn = [];
        vec.forEach((c,i) => {
            vecn.push(c*norm);
        })
        return vecn;
    }


    //Rotates a list of 3D vectors about the origin. Usually better to supply transforms as matrices for the GPU to multiply
    static rotateMesh(mesh, pitch, roll, yaw) {
        var cosa = Math.cos(yaw);
        var sina = Math.sin(yaw);

        var cosb = Math.cos(pitch);
        var sinb = Math.sin(pitch);

        var cosc = Math.cos(roll);
        var sinc = Math.sin(roll);

        var Axx = cosa*cosb;
        var Axy = cosa*sinb*sinc - sina*cosc;
        var Axz = cosa*sinb*cosc + sina*sinc;

        var Ayx = sina*cosb;
        var Ayy = sina*sinb*sinc + cosa*cosc;
        var Ayz = sina*sinb*cosc - cosa*sinc;

        var Azx = -sinb;
        var Azy = cosb*sinc;
        var Azz = cosb*cosc;

        var result = [...mesh];

        for (var i = 0; i < mesh.length; i+=3) {
            var px = mesh[i];
            var py = mesh[i+1];
            var pz = mesh[i+2];

            result[i] = Axx*px + Axy*py + Axz*pz;
            result[i+1] = Ayx*px + Ayy*py + Ayz*pz;
            result[i+2] = Azx*px + Azy*py + Azz*pz;
        }

        return result;
    }

    //Mesh is an array of vec3's offset by idx+=3
    static translateMesh(mesh, xOffset, yOffset, zOffset) {
        var result = [...mesh];
        for(var i = 0; i < mesh.length; i+=3) {
            result[i]   = mesh[i]+xOffset
            result[i+1] = mesh[i+1]+yOffset;
            result[i+2] = mesh[i+2]+zOffset;
        }
    }

    //Scale about origin
    static scaleMesh(mesh, xScalar, yScalar, zScalar) {
        var result = [...mesh];
        for(var i = 0; i < mesh.length; i+=3) {
            result[i]   = mesh[i]*xScalar
            result[i+1] = mesh[i+1]*yScalar;
            result[i+2] = mesh[i+2]*zScalar;
        }
    }

    static transposeMat2D(mat2D){
		return mat2D[0].map((_, colIndex) => mat2.map(row => row[colIndex]));
    }

    static matmul2D(a, b) { //matmul2Dtiply two 2D matrices (array of arrays)
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

    static makeIdentityM4() {
        return [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1]
        ];
    }

    static makeTranslationM4(tx,ty,tz){
        return [
            [1,   0,  0, 0],
            [0,   1,  0, 0],
            [0,   0,  1, 0],
            [tx, ty, tz, 1]
        ];
    }

    static translateM4(mat4, tx, ty, tz) {
        var translate = this.makeTranslationM4(tx,ty,tz)

        return Math3D.matmul2D(mat4, translate);
    }

    static makeScaleM4(scaleX,scaleY,scaleZ){
        return [
            [scaleX, 0, 0, 0],
            [0, scaleY, 0, 0],
            [0, 0, scaleZ, 0],
            [0, 0,      0, 1]
        ];

    }

    static scaleM4(mat4,scaleX,scaleY,scaleZ){
        var scale = this.makeScaleM4(scaleX,scaleY,scaleZ);
        return Math3D.matmul2Dtiply(mat4, scale);
    }


    static xRotationM4(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
          [1, 0, 0, 0],
          [0, c, s, 0],
          [0,-s, c, 0],
          [0, 0, 0, 1],
        ];
    }

    static yRotationM4(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
          [c, 0,-s, 0],
          [0, 1, 0, 0],
          [s, 0, c, 0],
          [0, 0, 0, 1]
        ];
    }

    static zRotationM4(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
           [c, s, 0, 0],
          [-s, c, 0, 0],
           [0, 0, 1, 0],
           [0, 0, 0, 1]
        ];
    }

    static lookAtM4(source=[0,0,0], target=[1,1,1], up=[0,1,0]) {
        var zAxis = this.normalize([source[0]-target[0],source[1]-target[1],source[2]-target[2]]);
        var xAxis = this.normalize(this.cross3D(up, zAxis));
        var yAxis = this.normalize(this.cross3D(zAxis, xAxis));

        return [
            [ xAxis[0], xAxis[1], xAxis[2], 0],
            [ yAxis[0], yAxis[1], yAxis[2], 0],
            [ zAxis[0], zAxis[1], zAxis[2], 0],
            [source[0],source[1],source[2], 1]
        ];
    }

    //Rotate a 4D matrix
    static rotateM4(mat4, anglex, angley, anglez) {
        var result = [...mat4];
        if(anglex !== 0){
            result = Math3D.matmul2D(result,this.xRotationM4(anglex));
        }
        if(angley !== 0){
            result = Math3D.matmul2D(result,this.yRotationM4(angley));
        }
        if(anglez !== 0){
            result = Math3D.matmul2D(result,this.zRotationM4(anglez));
        }

        return result;
    }

    static rotatePoint1AboutPoint2(p1,p2,anglex,angley,anglez) {
        let rotatedM4 =
            Math3D.matmul2D(
                this.translateM4(
                    this.rotateM4(
                        this.makeTranslationM4(p2[0],p2[1],p2[2]),
                        anglex,angley,anglez),
                    -p2[0],-p2[1],-p2[2]),
                [...p1,1]
            );

        return [rotatedM4[0][3],rotatedM4[1][3],rotatedM4[2][3]]
    }

    //4D matrix inversion. This is atypical formatting (usually mat4s are represented by a 1D array, which is more efficient)
    static invertM4(mat4) {
        var m = mat4;
        var inv = [...mat4];
        inv[0][0] = m[1][1]  * m[2][2]* m[3][3] -
                m[1][1]  * m[2][3]* m[3][2]-
                m[2][1] * m[1][2] * m[3][3] +
                m[2][1] * m[1][3]* m[3][2]+
                m[3][1]* m[1][2] * m[2][3]-
                m[3][1]* m[1][3]* m[2][2];

        inv[1][0] = -m[1][0] * m[2][2]* m[3][3] +
                m[1][0] * m[2][3]* m[3][2]+
                m[2][0] * m[1][2] * m[3][3] -
                m[2][0] * m[1][3]* m[3][2]-
                m[3][0]* m[1][2] * m[2][3]+
                m[3][0]* m[1][3]* m[2][2];

        inv[2][0] = m[1][0] * m[2][1]* m[3][3] -
                m[1][0] * m[2][3]* m[3][1]-
                m[2][0] * m[1][1] * m[3][3] +
                m[2][0] * m[1][3]* m[3][1]+
                m[3][0]* m[1][1] * m[2][3]-
                m[3][0]* m[1][3]* m[2][1];

        inv[3][0] = -m[1][0] * m[2][1]* m[3][2]+
                m[1][0] * m[2][2]* m[3][1]+
                m[2][0] * m[1][1] * m[3][2]-
                m[2][0] * m[1][2]* m[3][1]-
                m[3][0]* m[1][1] * m[2][2]+
                m[3][0]* m[1][2]* m[2][1];

        inv[0][1] = -m[0][1] * m[2][2]* m[3][3] +
                m[0][1] * m[2][3]* m[3][2]+
                m[2][1] * m[0][2]* m[3][3] -
                m[2][1] * m[0][3]* m[3][2]-
                m[3][1]* m[0][2]* m[2][3]+
                m[3][1]* m[0][3]* m[2][2];

        inv[1][1] = m[0][0]  * m[2][2]* m[3][3] -
                m[0][0]  * m[2][3]* m[3][2]-
                m[2][0] * m[0][2]* m[3][3] +
                m[2][0] * m[0][3]* m[3][2]+
                m[3][0]* m[0][2]* m[2][3]-
                m[3][0]* m[0][3]* m[2][2];

        inv[2][1] = -m[0][0]  * m[2][1]* m[3][3] +
                m[0][0]  * m[2][3]* m[3][1]+
                m[2][0] * m[0][1]* m[3][3] -
                m[2][0] * m[0][3]* m[3][1]-
                m[3][0]* m[0][1]* m[2][3]+
                m[3][0]* m[0][3]* m[2][1];

        inv[3][1] = m[0][0]  * m[2][1]* m[3][2]-
                m[0][0]  * m[2][2]* m[3][1]-
                m[2][0] * m[0][1]* m[3][2]+
                m[2][0] * m[0][2]* m[3][1]+
                m[3][0]* m[0][1]* m[2][2]-
                m[3][0]* m[0][2]* m[2][1];

        inv[0][2] = m[0][1] * m[1][2]* m[3][3] -
                m[0][1] * m[1][3]* m[3][2]-
                m[1][1]  * m[0][2]* m[3][3] +
                m[1][1]  * m[0][3]* m[3][2]+
                m[3][1]* m[0][2]* m[1][3]-
                m[3][1]* m[0][3]* m[1][2];

        inv[1][2] = -m[0][0]  * m[1][2]* m[3][3] +
                m[0][0]  * m[1][3]* m[3][2]+
                m[1][0] * m[0][2]* m[3][3] -
                m[1][0] * m[0][3]* m[3][2]-
                m[3][0]* m[0][2]* m[1][3]+
                m[3][0]* m[0][3]* m[1][2];

        inv[2][2] = m[0][0]  * m[1][1] * m[3][3] -
                m[0][0]  * m[1][3]* m[3][1]-
                m[1][0] * m[0][1]* m[3][3] +
                m[1][0] * m[0][3]* m[3][1]+
                m[3][0]* m[0][1]* m[1][3]-
                m[3][0]* m[0][3]* m[1][1];

        inv[3][2] = -m[0][0]  * m[1][1] * m[3][2]+
                m[0][0]  * m[1][2]* m[3][1]+
                m[1][0] * m[0][1]* m[3][2]-
                m[1][0] * m[0][2]* m[3][1]-
                m[3][0]* m[0][1]* m[1][2]+
                m[3][0]* m[0][2]* m[1][1];

        inv[0][3] = -m[0][1]* m[1][2]* m[2][3]+
                m[0][1]* m[1][3]* m[2][2]+
                m[1][1] * m[0][2]* m[2][3]-
                m[1][1] * m[0][3]* m[2][2]-
                m[2][1]* m[0][2]* m[1][3]+
                m[2][1]* m[0][3]* m[1][2];

        inv[1][3] = m[0][0] * m[1][2]* m[2][3]-
                m[0][0] * m[1][3]* m[2][2]-
                m[1][0]* m[0][2]* m[2][3]+
                m[1][0]* m[0][3]* m[2][2]+
                m[2][0]* m[0][2]* m[1][3]-
                m[2][0]* m[0][3]* m[1][2];

        inv[2][3] = -m[0][0] * m[1][1] * m[2][3]+
                m[0][0] * m[1][3]* m[2][1]+
                m[1][0]* m[0][1]* m[2][3]-
                m[1][0]* m[0][3]* m[2][1]-
                m[2][0]* m[0][1]* m[1][3]+
                m[2][0]* m[0][3]* m[1][1];

        inv[3][3] = m[0][0] * m[1][1] * m[2][2]-
                m[0][0] * m[1][2]* m[2][1]-
                m[1][0]* m[0][1]* m[2][2]+
                m[1][0]* m[0][2]* m[2][1]+
                m[2][0]* m[0][1]* m[1][2]-
                m[2][0]* m[0][2]* m[1][1];

        return inv;
    }

    //Convert 2D matrix (array of arrays) to a Float32Array buffer
    static bufferMat2D(mat2D){
        var arraybuffer = [];
        mat2D.forEach((arr,i)=>{
            arraybuffer.push(...arr);
        });

        return new Float32Array(arraybuffer);
    }

    //Fairly efficient nearest neighbor search. Supply list of coordinates (array of Array(3)) and maximum radius to be considered a neighbor.
    //Returns a list of nodes with [{idx:0,neighbors:[{idx:j,position:[x,y,z],dist:d}]},{...},...]. Neighbors are auto sorted by distance.
    //Current complexity: n(n+1)/2, there are faster ways to do it but this should be good enough
    static nearestNeighborSearch(positions, isWithinRadius) {

        let node = {
            idx: null,
            position: [0,0,0],
            neighbors: []
        }

        let neighbor = {
            idx: null,
            position: [0,0,0],
            dist: null
        }

        var tree = [];

        for(var i = 0; i < positions.length; i++){
            let newnode = JSON.parse(JSON.stringify(node));
            newnode.idx = i;
            newnode.position = positions[i];
            tree.push(newnode);
        }

        //Nearest neighbor search. This can be heavily optimized.
        for(var i = 0; i < positions.length; i++) {
            for(var j = i; j < positions.length; j++) {
                var dist = Math3D.distance(positions[i],positions[j]);
                if(dist < isWithinRadius){
                    var newNeighbori = JSON.parse(JSON.stringify(neighbor));
                    newNeighbori.position = positions[j];
                    newNeighbori.dist = dist;
                    newNeighbori.idx = tree[j].idx;
                    tree[i].neighbors.push(newNeighbori);
                    var newNeighborj = JSON.parse(JSON.stringify(neighbor));
                    newNeighborj.position = positions[i];
                    newNeighborj.dist = dist;
                    newNeighborj.idx = positions[j];
                }
            }
            tree[i].neighbors.sort(function(a,b) {return a.dist - b.dist}); //Sort by distance
        }

        return tree;
    }

}



class graphNode { //Use this to organize 3D models hierarchically if needed and apply transforms (not very optimal for real time)
    constructor(parent=null, children=[null], id=null) {
        this.id = id;
        this.parent = parent; //Access/inherit parent object
        this.children = children; //List of child objects for this node, each with independent data
        this.globalPos = {x:0,y:0,z:0}; //Global x,y,z position
        this.localPos = {x:0,y:0,z:0};  //Local x,y,z position offset. Render as global + local pos
        this.globalRot = {x:0,y:0,z:0}; //Global x,y,z rotation (rads)
        this.localRot = {x:0,y:0,z:0}; //Local x,y,z rotation (rads). Render as global + local rot
        this.globalScale = {x:1,y:1,z:1};
        this.localScale = {x:1,y:1,z:1};
        this.functions = []; // List of functions. E.g. function foo(x) {return x;}; this.functions["foo"] = foo; this.functions.foo = foo(x) {return x;}. Got it?

        //3D Rendering stuff
        this.model = null; //
        this.mesh = [0,0,0,1,1,1,1,0,0,0,0,0]; // Model vertex list, array of vec3's xyz, so push x,y,z components. For ThreeJS use THREE.Mesh(vertices, material) to generate a model from this list with the selected material
        this.normals = [];
        this.colors = [0,0,0,255,255,255,255,0,0,0,0,0]; // Vertex color list, array of vec3's rgb or vec4's rgba for outside of ThreeJS. For ThreeJS use THREE.Color("rgb(r,g,b)") for each array item.
        this.materials = []; // Array of materials maps i.e. lighting properties and texture maps.
        this.textures = []; // Array of texture image files.

        if(parent !== null){
            this.inherit(parent);
        }
    }

    inherit(parent) { //Sets globals to be equal to parent info and adds parent functions to this node.
        this.parent = parent;
        this.globalPos = parent.globalPos;
        this.globalRot = parent.globalRot;
        this.globalScale = parent.globalScale;
        this.functions.concat(parent.functions);
        this.children.forEach((child)=>{
            child.inherit(parent);
        });
    }

    addChild(child){ //Add child node reference
        this.children.push(child); //Remember: JS is all pass by object reference.
    }

    removeChild(id){ //Remove child node reference
        this.children.forEach((child, idx)=>{
            if(child.id == id){
                this.children.splice(idx,1);
            }
        });
    }

    translateMeshGlobal(offset=[0,0,0]){ //Recursive global translation of this node and all children
        this.globalPos.x+=offset[0];
        this.globalPos.y+=offset[1];
        this.globalPos.z+=offset[2];

        if(this.mesh.length > 0) this.mesh = Math3D.translateMesh(this.mesh,this.globalPos.x, this.globalPos.y, this.globalPos.z);
        if(this.normals.length > 0) this.normals = Math3D.translateMesh(this.normals,this.globalPos.x, this.globalPos.y, this.globalPos.z);

        this.children.forEach((child)=>{
            child.translateMeshGlobal(offset);
        });
    }

    rotateMeshGlobal(offset=[0,0,0]){ //Offsets the global rotation of this node and all child nodes (radian)
        this.globalRot.x+=offset[0];
        this.globalRot.y+=offset[1];
        this.globalRot.z+=offset[2];

        if(this.mesh.length > 0) this.mesh = Math3D.rotateMesh(this.mesh,this.globalRot.x, this.globalRot.y, this.globalRot.z);
        if(this.normals.length > 0) this.normals = Math3D.rotateMesh(this.normals,this.globalRot.x, this.globalRot.y, this.globalRot.z);

        this.children.forEach((child)=>{
            child.rotateMeshGlobal(offset);
        });
    }

    translateMeshLocal(offset=[0,0,0]){ //Recursive global translation of this node and all children
        this.localPos.x+=offset[0];
        this.localPos.y+=offset[1];
        this.localPos.z+=offset[2];

        if(this.mesh.length > 0) this.mesh = Math3D.translateMesh(this.mesh,this.localPos.x, this.localPos.y, this.localPos.z);
        if(this.normals.length > 0) this.normals = Math3D.translateMesh(this.normals,this.localPos.x, this.localPos.y, this.localPos.z);

        this.children.forEach((child)=>{
            child.translateMeshLocal(offset);
        });
    }

    translateMeshGlobal(offset=[0,0,0]){ //Offsets the global rotation of this node and all child nodes (radian)
        this.localRot.x+=offset[0];
        this.localRot.y+=offset[1];
        this.localRot.z+=offset[2];

        if(this.mesh.length > 0) this.mesh = Math3D.rotateMesh(this.mesh,this.globalPos.x, this.globalPos.y, this.globalPos.z);
        if(this.normals.length > 0) this.normals = Math3D.rotateMesh(this.normals,this.globalPos.x, this.globalPos.y, this.globalPos.z);

        this.children.forEach((child)=>{
            child.translateMeshGlobal(offset);
        });
    }

    scaleMeshLocal(scalar=[1,1,1]){
        this.localScale.x+=scalar[0];
        this.localScale.y+=scalar[1];
        this.localScale.z+=scalar[2];

        if(this.mesh.length > 0) this.mesh = Math3D.scaleMesh(this.mesh,this.localScale.x, this.localScale.y, this.localScale.z);
        if(this.normals.length > 0) this.normals = Math3D.scaleMesh(this.normals,this.localScale.x, this.localScale.y, this.localScale.z);

        this.children.forEach((child)=>{
            child.scaleMeshLocal(offset);
        });
    }

    scaleMeshGlobal(scalar=[1,1,1]){
        this.globalScale.x+=scalar[0];
        this.globalScale.y+=scalar[1];
        this.globalScale.z+=scalar[2];

        if(this.mesh.length > 0) this.mesh = Math3D.scaleMesh(this.mesh,this.globalScale.x, this.globalScale.y, this.globalScale.z);
        if(this.normals.length > 0) this.normals = Math3D.scaleMesh(this.normals,this.globalScale.x, this.globalScale.y, this.globalScale.z);

        this.children.forEach((child)=>{
            child.scaleMeshGlobal(offset);
        });
    }

    applyMeshTransforms() { //Get mesh with rotation and translation applied
        var rotated = Math3D.rotateMesh(this.mesh,this.globalRot.x+this.localRot.x,this.globalRot.y+this.localRot.y,this.globalRot.z+this.localRot.z);
        var translated = Math3D.translateMesh(rotated,this.globalPos.x+this.localPos.x, this.globalPos.y+this.localPos.y, this.globalPos.z+this.localPos.z);
        var scaled = Math3D.scaleMesh(translated, this.globalScale.x+this.localScale.x, this.globalScale.y+this.localScale.y, this.globalScale.z+this.localScale.z);
        return scaled;
    }

}


class Camera { //pinhole camera model. Use to set your 3D rendering view model
    constructor (
        position=[0,0,0],
        target=[0,100,0],
        up=[0,1,0],
        clientWidth=window.innerWidth,
        clientHeight=window.innerHeight
        )
        {

        this.position = {x:position[0],y:position[1],z:position[2]};
        this.target = {x:target[0],y:target[1],z:target[2]};
        this.up = {x:up[0],y:up[1],z:up[2]};

        this.fov = 90;
        this.aspect = clientWidth/clientHeight;

        //View distance
        this.near = 0;
        this.far = 1000;

        //Focal length
        this.fx = 1;
        this.fy = 1;

        //Center image pixel location?
        this.cx = clientWidth*.5;
        this.cy = clientHeight*.5;

        this.cameraMat = this.getLookAtViewProjectionMatrix(position,target,up);

    }

    getPerspectiveMatrix(fieldOfViewInRadians=this.fov, aspectRatio=this.aspect, near=this.near, far=this.far) {
        var f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
        var rangeInv = 1 / (near - far);

        return [
          [f / aspectRatio, 0,                          0,   0],
          [0,               f,                          0,   0],
          [0,               0,    (near + far) * rangeInv,  -1],
          [0,               0,  near * far * rangeInv * 2,   0]
        ];
    }


    getProjectionMatrix(width, height, depth) {
        return [
            [2/width,   0,        0, 0],
            [0, -2/height,        0, 0],
            [0,         0,  2/depth, 0],
            [-1,        1,        0, 1]
        ];
    }


    getCameraMatrix(fx=this.fx, fy=this.fy, cx=this.cx, cy=this.cx) {
        return [
            [fx, 0, cx, 0],
            [0, fy, cy, 0],
            [0,  0,  1, 0]
        ];
    }

    getCameraViewProjectionMatrix(xPos=this.position.x,yPos=this.position.y,zPos=this.position.z,rotX=0,rotY=0,rotZ=0) { //Translate geometry based on this result then set location. Demonstrated: https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html
        var cameraMat = this.getCameraMatrix(this.fx,this.fy);
        cameraMat = Math3D.rotateM4(cameraMat,rotX,rotY,rotZ);
        cameraMat = Math3D.translateM4(cameraMat, xPos, yPos, zPos);
        var viewMat = Math3D.invertM4(cameraMat);
        return Math3D.matmul2D(this.getPerspectiveMatrix(), viewMat); //View projection matrix result
    }

    getLookAtViewProjectionMatrix(source, target, up) {
        var cameraMat = Math3D.lookAtM4(source,target,up);
        var viewMat = Math3D.invertM4(cameraMat);
        return Math3D.matmul2D(this.getPerspectiveMatrix(), viewMat);
    }

    getCameraTransform() {
        return Float32Array(Math3D.bufferMat2D(this.cameraMat));
    }

    updateRotation(xRot=0,yRot=0,zRot=0) {
        this.cameraMat = Math3D.rotateM4(this.cameraMat, xRot, yRot, zRot);
    }

    updateTranslation(xPos=this.position.x,yPos=this.position.y,zPos=this.position.z) {
        this.cameraMat = Math3D.translateM4(this.cameraMat, xPos, yPos, zPos);
    }

    //Rotation in Radians
    rotateCameraAboutPoint(xPos=0,yPos=0,zPos=0,xRot,yRot,zRot){
        var anchorPoint = [xPos,yPos,zPos];
        var rotatedPosition = Math3D.rotatePoint1AboutPoint2(this.position,anchorPoint,xRot,yRot,zRot);
        this.position = {x:rotatedPosition[0],y:rotatedPosition[1],z:rotatedPosition[2]};
        this.updateTranslation();
        this.updateRotation(-xRot,-yRot,-zRot);
    }

    moveCamera(xPos = 0, yPos = 0, zPos = 0) {
        this.position = {x:xPos, y:yPos, z:zPos};
        this.updateTranslation();
    }

}



class Physics {
    constructor(nBodies = 10) {

        this.physicsBodies = [];

        this.globalSettings = {
            maxDistCheck = 1000,
            gravity: 9.81
        };

        this.bodySettings = {

            index: null,

            collisionEnabled: true,
            collisionType: "Sphere", //Sphere, Box, Point
            collisionRadius: 1, //Radius of sphere or nearest point on side planes in a box
            collisionBoundsScale: [1,1,1], //Can distort the bounding box, doesn't affect the sphere yet.

            dynamic: true,

            position: [0,0,0], //[x,y,z] or [i,j,k]
            velocity: [0,0,0],
            acceleration: [0,0,0],
            forceImpulse: [0,0,0], //Instantaneous force (resets after applying)

            mass: 1,
            drag: 0,
            restitution: 1, //Bounciness
            friction: 0, //Amount this surface slows other objects in contact along the contact plane

            attractor: false, //N-body attractor
            attractionAccel: 9.81,

            trigger: false,
            triggerFunc: null,

            child: null, //Child object class instance (for modifying parameters)
        }

        for (let i = 0; i < nBodies; i++) {
            this.physicsBodies.push(JSON.parse(JSON.stringify(this.bodySettings)));
            this.physicsBodies[i].index = i;
        }
    }

    timeStep(dt) { //dt in seconds

        /* //Nearest neighbor search optimization for collision detection (to cut down array searching), can make this only fire every n-milliseconds for speed
        var neighborTree = Math3D.nearestNeighborSearch(positions,this.globalSettings.maxDistCheck);
        neighborTree.forEach((node,i) => {
            var body1 = this.physicsBodies[i];
            node.neighbors.forEach((neighbor,j) => {
                var body2 = this.physicsBodies[j];
                var isColliding = this.collisionCheck(body,otherBody);
                if(isColliding === true) { resolveCollision(body,otherBody); }
            });
        });
        */

        this.physicsBodies.forEach((body,i) => {

            //var positions = new Array(this.physicsBodies.length);

            for(var j = i+1; j < this.physicsBodies.length; j++) {
                var otherBody = this.physicsBodies[j];

                //Collision Check
                var isColliding = this.collisionCheck(body,otherBody);
                if(isColliding === true) {
                    this.resolveCollision(body,otherBody); //Now calculate forces
                    this.resolveCollision(otherBody,body); //Now calculate forces
                }

                //Gravity check
                if(body.attractor === true && otherBody.attractor === true) {
                    this.resolveAttractor(body,otherBody)
                }

            }

            //Resolve Attractors

            //Apply any forces
            body.acceleration[0] += forceImpulse[0]/body.mass - body.acceleration[0]*drag;
            body.acceleration[0] += forceImpulse[1]/body.mass - body.acceleration[1]*drag;
            body.acceleration[0] += forceImpulse[2]/body.mass - body.acceleration[2]*drag - this.globalSettings.gravity*dt;

            body.forceImpulse = [0,0,0];

            body.velocity[0] += body.acceleration[0]*dt;
            body.velocity[1] += body.acceleration[1]*dt;
            body.velocity[2] += body.acceleration[2]*dt;

            //Finally, calculate new positions
            body.position[0] += body.velocity[0]*dt;
            body.position[1] += body.velocity[1]*dt;
            body.position[2] += body.velocity[2]*dt;
        });
    }

    addBody(child = null) {
        this.physicsBodies.push(new this.bodySettings);
        this.physicsBodies[this.physicsBodies.length - 1].index = this.physicsBodies.length - 1;
        this.physicsBodies[this.physicsBodies.length - 1].child = child;
    }

    removeBody(idx) {
        this.physicsBodies.splice(idx, 1);
        this.physicsBodies.forEach((body,i) => {
            body.index = i;
        });
    }

    // V = Vold*dt + a*dt^2, basic projectile motion equation
    calcVelocityStep(vOld=[0,0,0],a=[0,0,0],dt) {
        return [
            vOld[0]*dt + a[0]*dt*dt,
            vOld[1]*dt + a[1]*dt*dt,
            vOld[2]*dt + a[2]*dt*dt
        ];
    }

    // F = m*a for 3D vecs
    calcForce(m, a=[0,0,0]) {
        return [
            m*a[0],
            m*a[1],
            m*a[2]
        ];
    }

    // a = F/m for 3D vecs
    calcAccelFromForce(F=[0,0,0], m=0) {
        return [
            F[0]/m,
            F[1]/m,
            F[2]/m
        ];
    }

    resolveCollision(body1,body2) { //Resolve what body1 does in contact with body2 (call twice with bodies reversed to calculate in both directions)
        //Elastic collisions
        var directionVec = Math3D.makeVec(body1.position,body2.position); //Get direction toward body2
        var normal = Math3D.normalize(directionVec);
        if(body2.collisionType === "Sphere" || body2.collisionType === "Point") {

            var body1velocityMag = Math3D.magnitude(body1.velocity);

            var body2AccelMag = Math3D.magnitude(body2.acceleration);
            var body2AccelNormal = Math3D.normalize(body2.acceleration);

            body1.velocity = [-normal[0]*body1velocityMag*body1.restitution,-normal[1]*body1velocityMag*body1.restitution,-normal[2]*body1velocityMag*body1.restitution]; //Adjust velocity

            body1.forceImpulse[0] -= body2AccelMag*body2AccelNormal[0]*body2.mass;
            body1.forceImpulse[1] -= body2AccelMag*body2AccelNormal[1]*body2.mass;
            body1.forceImpulse[2] -= body2AccelMag*body2AccelNormal[2]*body2.mass;

        }
        else if (body2.collisionType === "Box") {
            //Find which side was collided with
            var max = Math.max(...directionVec);
            var min = Math.min(...directionVec);
            var side = max;;
            if(Math.abs(min) > max) {
                side = min;
            }
            var idx = directionVec.indexOf(side);

            body1.velocity[idx] = -body1.velocity[idx]*body1.restitution; //Reverse velocity

            var body2AccelMag = Math3D.magnitude(body2.acceleration);
            var body2AccelNormal = Math3D.normalize(body2.acceleration);

            body1.forceImpulse[idx] = -body2AccelNormal[idx]*body2AccelMag*body2.mass; //Add force

            //Apply Friction
        }
    };

    resolveAttractor(body1,body2) {
        //Gravitational pull of nBodies
        var dist = Math3D.distance(body1.position,body2.position);
        var vec1 = Math3D.normalize(Math3D.makeVec(body1.position,body2.position)); // a to b
        var vec2 = Math3D.normalize(Math3D.makeVec(body2.position,body1.position)); // b to a

        //Newton's law of gravitation
        var Fg = 0.00000000006674 * body1.mass * body2.mass / (dist*dist);

        //Get force vectors
        FgOnBody1 = [vec1[0]*Fg,vec1[1]*Fg,vec1[2]*Fg];
        FgOnBody2 = [vec2[0]*Fg,vec2[1]*Fg,vec2[2]*Fg];

        body1.forceImpulse[0] += FgOnBody1[0];
        body1.forceImpulse[1] += FgOnBody1[1];
        body1.forceImpulse[2] += FgOnBody1[2];

        body2.forceImpulse[0] += FgOnBody2[0];
        body2.forceImpulse[1] += FgOnBody2[1];
        body2.forceImpulse[2] += FgOnBody2[2];

    }

    //Checks if two bodies are colliding based on their collision setting
    collisionCheck(body1,body2) {
        if(body1.collisionEnabled === false || body2.collisionEnabled === false) return false;

        //Check if within a range close enough to merit a collision check
        if(Math3D.distance(body1.position,body2.position) < Math.max(...body1.scale)*body1.collisionRadius+Math.max(...body2.scale)*body2.collisionRadius) {
            //Do collision check
            let isColliding = false;
            if(body1.collisionType === "Sphere") {
                if(body2.collisionType === "Sphere") { isColliding = this.sphericalCollisionCheck(body1.idx,body2.idx);}
                if(body2.collisionType === "Box") { isColliding = this.sphereBoxCollisionCheck(body1Idx,body2Idx);}
                if(body2.collisionType === "Point") { isColliding = this.isPointInsideSphere(body2.position,body1.idx);}
            }
            else if(body1.collisionType === "Box" ) {
                if(body2.collisionType === "Sphere") { isColliding = this.sphereBoxCollisionCheck(body2.idx,body1.idx);}
                if(body2.collisionType === "Box") { isColliding = this.boxCollisionCheck(body1.idx,body2.idx);}
                if(body2.collisionType === "Point") { isColliding = this.isPointInsideBox(body1.position,body1.idx); }
            }
            else if (body1.collisionType === "Point") {
                if(body2.collisionType === "Sphere") { isColliding = this.isPointInsideSphere(body1.position,body2.idx); }
                if(body2.collisionType === "Box") { isColliding = this.isPointInsideBox(body1.position,body2.idx); }
            }

            return isColliding;
        }
        else return false


    }

    //Check if point is inside the spherical volume
    isPointInsideSphere(point,body2Idx) {
        let body = this.physicsBodies[bodyIdx];
        let dist = Math3D.distance(point1,body.position);

        return dist < body.collisionRadius;
    }

    //Collision between two spheres
    sphericalCollisionCheck(sphere1Idx,sphere2Idx) {
        let body1 = this.physicsBodies[sphere1Idx];
        let body2 = this.physicsBodies[sphere2Idx];

        let dist = Math3D.distance(body1.position,body2.position);

        return dist < (body1.collisionRadius + body2.collisionRadius);
    }

    //Check if point is inside the box volume
    isPointInsideBox(point,boxIdx) {

        let body1 = this.physicsBodies[boxIdx];
        //should precompute these for speed with Box objects as reference
        let body1minX = (body1.position[0]-body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1maxX = (body1.position[0]+body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1minY = (body1.position[1]-body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1maxY = (body1.position[1]+body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1minZ = (body1.position[2]-body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1maxZ = (body1.position[2]+body1.collisionRadius)*body1.collisionBoundsScale[0];

        return  (point[0] >= body1minX && point[0] <= body1maxX) &&
                (point[1] >= body1minY && point[1] <= body1maxY) &&
                (point[2] >= body1minZ && point[2] <= body1maxZ);

    }

    //Collision between two axis-aligned boxes. TODO: account for rotation with simple trig modifiers
    boxCollisionCheck(box1idx,box2idx) {

        let body1 = this.physicsBodies[box1idx];
        let body2 = this.physicsBodies[box2idx];

        let body1minX = (body1.position[0]-body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1maxX = (body1.position[0]+body1.collisionRadius)*body1.collisionBoundsScale[0];
        let body1minY = (body1.position[1]-body1.collisionRadius)*body1.collisionBoundsScale[1];
        let body1maxY = (body1.position[1]+body1.collisionRadius)*body1.collisionBoundsScale[1];
        let body1minZ = (body1.position[2]-body1.collisionRadius)*body1.collisionBoundsScale[2];
        let body1maxZ = (body1.position[2]+body1.collisionRadius)*body1.collisionBoundsScale[2];

        let body2minX = (body2.position[0]-body2.collisionRadius)*body1.collisionBoundsScale[0];
        let body2maxX = (body2.position[0]+body2.collisionRadius)*body1.collisionBoundsScale[0];
        let body2minY = (body2.position[1]-body2.collisionRadius)*body1.collisionBoundsScale[1];
        let body2maxY = (body2.position[1]+body2.collisionRadius)*body1.collisionBoundsScale[1];
        let body2minZ = (body2.position[2]-body2.collisionRadius)*body1.collisionBoundsScale[2];
        let body2maxZ = (body2.position[2]+body2.collisionRadius)*body1.collisionBoundsScale[2];

        return  (
                    ((body1maxX <= body2maxX && body1maxX >= body2minX) || (body1minX <= body2maxX && body1minX >= body2minX)) &&
                    ((body1maxY <= body2maxY && body1maxY >= body2minY) || (body1minY <= body2maxY && body1minY >= body2minY)) &&
                    ((body1maxZ <= body2maxZ && body1maxZ >= body2minZ) || (body1minZ <= body2maxZ && body1minZ >= body2minZ))
                );
    }

    sphereBoxCollisionCheck(sphereBodyIdx, boxBodyIdx) {
        let sphere = this.physicsBodyIdx[sphereBodyIdx];
        let box = this.physicsBodyIdx[boxBodyIdx];

        let boxMinX = (box.position[0]-box.collisionRadius)*box.collisionBoundsScale[0];
        let boxMaxX = (box.position[0]+box.collisionRadius)*box.collisionBoundsScale[0];
        let boxMinY = (box.position[1]-box.collisionRadius)*box.collisionBoundsScale[1];
        let boxMaxY = (box.position[1]+box.collisionRadius)*box.collisionBoundsScale[1];
        let boxMinZ = (box.position[2]-box.collisionRadius)*box.collisionBoundsScale[2];
        let boxMaxZ = (box.position[2]+box.collisionRadius)*box.collisionBoundsScale[2];

        //let direction = Math.makeVec(sphere.position,box.position);

        //Get closest point to sphere center
        let clamp = [
            Math.max(boxMinX, Math.min(sphere.position[0], boxMaxX)),
            Math.max(boxMinY, Math.min(sphere.position[1], boxMaxY)),
            Math.max(boxMinZ, Math.min(sphere.position[2], boxMaxZ))
        ];

        let dist = Math3D.distance(sphere.position,clamp);

        return dist > sphere.collisionRadius;

    }

    //Plane collision

}



//Some simple object primitives
class Primitives {

    constructor() {

    }

    static FibSphere(nPoints){
        var goldenRatio = (1 + Math.sqrt(5)) * .5;
        var goldenAngle = (2.0 - goldenRatio) * (2.0*Math.PI);

        var vertices = [];

        for(var i = 0; i<nPoints; i++){
            var t = i/nPoints;
            var angle1 = Math.acos(1-2*t);
            var angle2 = goldenAngle*i;

            var x = Math.sin(angle1)*Math.cos(angle2);
            var y = Math.sin(angle1)*Math.sin(angle2);
            var z = Math.cos(angle1);

            vertices.push(x,y,z);
        }

        return vertices; // Returns vertex list [x0,y0,z0,x1,y1,z1,...]

    }

    static Sphere(nDivs=10){

    }

    static Cube(sideX=1,sideY=1,sideZ=1){

    }

    static Pyramid(sideX=1,sideY=1,heightZ=1){

    }

    static Cone(radiusXY=1,heightZ=1,nDivs=20){

    }

    static Cylinder(radiusXY=1,heightZ=1,nDivs=20) {

    }

    static Torus(radiusXY=1,radiusZ=0.1,nDivs=20) {

    }

}


class WebGLHelper {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = canvas.getContext("webgl");
        if(!gl) {
            return;
        }

        this.vertexShader = null;
        this.fragmentShader = null;

        this.program = null;

        this.shaders = [];
    }

    // WebGL Reference Card: https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
    genBasicShaders(vId = `vertex-shader`, fId = `fragment-shader`) {
        var vertexShader = `
            <script id="`+vId+`" type="x-shader/x-vertex">

                attribute vec4 a_position; \n
                attribute vec3 a_normal; \n

                uniform vec3 u_lightWorldPosition; \n
                uniform vec3 u_viewWorldPosition; \n

                uniform mat4 u_world; \n
                uniform mat4 u_worldViewProjection; \n
                uniform mat4 u_worldInverseTranspose; \n

                varying vec3 v_normal; \n

                varying vec3 v_surfaceToLight; \n
                varying vec3 v_surfaceToView; \n

                void main() { \n
                    gl_Position = u_worldViewProjection * a_position; \n

                    v_normal = mat3(u_worldInverseTranspose) * a_normal; \n

                    vec3 surfaceWorldPosition = (u_world * a_position).xyz; \n

                    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition; \n

                    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition; \n
                }

            </script>`;

        var fragShader = `
            <script id="`+fId+`" type="x-shader/x-fragment"> \n

                precision mediump float; \n

                varying vec3 v_normal; \n
                varying vec3 v_surfaceToLight; \n
                varying vec3 v_surfaceToView; \n

                uniform vec4 u_color; \n
                uniform float u_shininess; \n
                uniform vec3 u_lightDirection; \n
                uniform float u_innerLimit; \n
                uniform float u_outerLimit; \n

                void main() { \n
                    vec3 normal = normalize(v_normal); \n

                    vec3 surfaceToLightDirection = normalize(v_surfaceToLight); \n
                    vec3 surfaceToViewDirection = normalize(v_surfaceToView); \n
                    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); \n

                    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection); \n
                    float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection); \n
                    float light = inLight * dot(normal, surfaceToLightDirection); \n
                    float specular = inLight * pow(dot(normal, halfVector), u_shininess); \n

                    gl_FragColor = u_color; \n
                    gl_FragColor.rgb *= light; \n
                    gl_FragColor.rgb += specular; \n
                }

            </script>`;

        this.canvas.insertAdjacentHTML('beforebegin', vertexShader);
        this.canvas.insertAdjacentHTML('beforebegin', fragShader);

        this.vertexShader = document.getElementById(vId).text;
        this.fragmentShader = document.getElementById(fId).text;

    }

    static createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            this.shaders.push(shader);
            return shader;
        }
        else {
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
    }

    static createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            this.program = program;
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    resizeCanvas(newWidth,newHeight) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
    }
}




// From webglfundamentals.org tutorial
function testWebGLRender(canvasId) {
    var canvas=document.getElementById(canvasId);
    var gl = canvas.getContext("webgl");
    if(!gl) {
        return;
    }

    var vertexShader = `
            <script id="`+vId+`" type="x-shader/x-vertex">

                attribute vec4 a_position; \n
                attribute vec3 a_normal; \n

                uniform vec3 u_lightWorldPosition; \n
                uniform vec3 u_viewWorldPosition; \n

                uniform mat4 u_world; \n
                uniform mat4 u_worldViewProjection; \n
                uniform mat4 u_worldInverseTranspose; \n

                varying vec3 v_normal; \n

                varying vec3 v_surfaceToLight; \n
                varying vec3 v_surfaceToView; \n

                void main() { \n
                    gl_Position = u_worldViewProjection * a_position; \n

                    v_normal = mat3(u_worldInverseTranspose) * a_normal; \n

                    vec3 surfaceWorldPosition = (u_world * a_position).xyz; \n

                    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition; \n

                    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition; \n
                }

            </script>`;

        var fragShader = `
            <script id="`+fId+`" type="x-shader/x-fragment"> \n

                precision mediump float; \n

                varying vec3 v_normal; \n
                varying vec3 v_surfaceToLight; \n
                varying vec3 v_surfaceToView; \n

                uniform vec4 u_color; \n
                uniform float u_shininess; \n
                uniform vec3 u_lightDirection; \n
                uniform float u_innerLimit; \n
                uniform float u_outerLimit; \n

                void main() { \n
                    vec3 normal = normalize(v_normal); \n

                    vec3 surfaceToLightDirection = normalize(v_surfaceToLight); \n
                    vec3 surfaceToViewDirection = normalize(v_surfaceToView); \n
                    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection); \n

                    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection); \n
                    float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection); \n
                    float light = inLight * dot(normal, surfaceToLightDirection); \n
                    float specular = inLight * pow(dot(normal, halfVector), u_shininess); \n

                    gl_FragColor = u_color; \n
                    gl_FragColor.rgb *= light; \n
                    gl_FragColor.rgb += specular; \n
                }

            </script>`;

    document.body.insertAdjacentHTML('afterbegin',vertexShader);
    document.body.insertAdjacentHTML('afterbegin',fragShader);


    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
          return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
          return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    var vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);

     // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var normalLocation = gl.getAttribLocation(program, "a_normal");

    // lookup uniforms
    var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var shininessLocation = gl.getUniformLocation(program, "u_shininess");
    var lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    var innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
    var outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");
    var lightWorldPositionLocation =
        gl.getUniformLocation(program, "u_lightWorldPosition");
    var viewWorldPositionLocation =
        gl.getUniformLocation(program, "u_viewWorldPosition");
    var worldLocation =
        gl.getUniformLocation(program, "u_world");


    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fRotationRadians = 0;
    var shininess = 150;
    var lightRotationX = 0;
    var lightRotationY = 0;
    var lightDirection = [0, 0, 1];  // this is computed in updateScene
    var innerLimit = degToRad(10);
    var outerLimit = degToRad(20);


    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var fibSphere = Primitives.FibSphere(1000);
    var fibSphereColors8 = new Uint8Array(new Array(fibSphere.length).fill(255));


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fibSphere), gl.STATIC_DRAW);

    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // Put normals data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Math3D.calcNormalMesh(fibSphere)), gl.STATIC_DRAW);


    for(var i = 0; i < fibSphere.length; i+=3) {
        fibSphereColors[i] = 200;
        fibSphereColors[i+1] = 70;
        fibSphereColors[i+2] = 120;
    }

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fibSphereColors8, gl.STATIC_DRAW);

    // Compute the projection matrix
    var cameraPosition = [0,0,300];
    var up = [0, 1, 0];
    var cameraTarget = [0, 0, 0]
    var camera = new Camera(cameraPosition,cameraTarget,up,gl.canvas.clientWidth*.5,gl.canvas.clientHeight*.5);

    drawScene();

     // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);

    // Bind the normal buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floating point values
    var normalize = false; // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        normalLocation, size, type, normalize, stride, offset);

    // Draw at the origin
    var worldMatrix = Math3D.yRotationM4(fRotationRadians);

    // Multiply the matrices.
    var worldViewProjectionMatrix = Math3D.matmul2D(camera.cameraMat, worldMatrix);
    var worldInverseMatrix = Math3D.invertM4(worldMatrix);
    var worldInverseTransposeMatrix = Math3D.transposeMat2D(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, Math3D.bufferMat2D(worldViewProjectionMatrix));
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, Math3D.bufferMat2D(worldInverseTransposeMatrix));
    gl.uniformMatrix4fv(worldLocation, false, Math3D.bufferMat2D(worldMatrix));

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

    // set the light position
    const lightPosition = [40, 60, 120];
    gl.uniform3fv(lightWorldPositionLocation, lightPosition);

    // set the camera/view position
    gl.uniform3fv(viewWorldPositionLocation, camera);

    // set the shininess
    gl.uniform1f(shininessLocation, shininess);

    // set the spotlight uniforms

    // since we don't have a plane like most spotlight examples
    // let's point the spot light at the origin
    {
        var lmat = Math3D.lookAtM4(lightPosition, cameraTarget, up);
        lmat = Math3D.matmul2D(Math3D.xRotationM4(lightRotationX), lmat);
        lmat = Math3D.bufferMat2D(Math3D.matmul2D(Math3D.yRotationM4(lightRotationY), lmat));
        // get the zAxis from the matrix
        // negate it because lookAt looks down the -Z axis
        lightDirection = [-lmat[8], -lmat[9],-lmat[10]];
    }

    gl.uniform3fv(lightDirectionLocation, lightDirection);
    gl.uniform1f(innerLimitLocation, Math.cos(innerLimit));
    gl.uniform1f(outerLimitLocation, Math.cos(outerLimit));

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = fibSphere.length;
    gl.drawArrays(primitiveType, offset, count);
  }

}

