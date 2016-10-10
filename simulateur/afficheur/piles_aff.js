var Simu = Simu || {};

var	PILES_MAX = 2,
	PILES_FACES = 7,
	PILES_RADIUS = 30; //mm

Simu.initPiles = function(){

	var radius   = PILES_RADIUS/1000;
    var mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
    var geo = new THREE.CircleGeometry( radius, PILES_FACES );

	// Remove center vertex
	geo.vertices.shift();

	Simu.piles = [];

	for(var i=0; i<PILES_MAX; i++){
		var o = new THREE.Line( geo, mat );
		o.rotation.x = Math.PI/2;
		Simu.piles.push(o);
		Simu.scene.add(o);
	}

	console.log("initPiles()");
};


Simu.updatePiles = function (positions){

	var size = Math.min(PILES_MAX, positions.length), i = 0;

	for(; i<size; i++){
		Simu.piles[i].position.set(positions[i][0], .01, positions[i][1]);
		Simu.piles[i].visible = true;
	}
	for(; i<PILES_MAX; i++){
		Simu.piles[i].visible = false;
	}

};