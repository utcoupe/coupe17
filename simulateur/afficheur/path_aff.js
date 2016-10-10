var Simu = Simu || {};



var PATH_MAX_POINTS = 20;

Simu.initPath = function(){

	var mat = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 3} );
	var geo = new THREE.Geometry();

	//Geometry only vertices initial length will be used after creation, so we need to create some before
	for(var i=0; i<PATH_MAX_POINTS; i++){
		geo.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	};

	Simu.pathPR = new THREE.Line(
		geo,
		mat
	);
	Simu.scene.add(Simu.pathPR);
	console.log("initPath()");
};


Simu.updatePath = function (vecArray){

	//Simu.pathPR.geometry.dynamic = true;
	var i=0;
	for(; i<vecArray.length; i++){
		Simu.pathPR.geometry.vertices[i] = vecArray[i];
	}
	var end = vecArray[vecArray.length-1].clone();
	end.setY(.05);
	for(; i<PATH_MAX_POINTS; i++){
		Simu.pathPR.geometry.vertices[i] = end;
	}
	Simu.pathPR.geometry.verticesNeedUpdate = true;
};