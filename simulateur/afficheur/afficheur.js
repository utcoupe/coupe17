var Simu = Simu || {};

Simu.init = function(){



	//threejs

	/*
		x -> horizontal gauche / droite
		z -> horizontal avant / arriere
		y -> vertical
	*/



	Simu.datatext = {
		"robots" : {
			"gr" : { "x": -1.290, "y": 0.11, "z": 0, "yrot": 0, "coul": "#ffff00"},
			"pr" : { "x": -1.055, "y": 0.185, "z": 0, "yrot": 0, "coul": "#ffff00"},
			"ge" : { "x": 1.305, "y": 0.185, "z": 0, "coul": "#ff00ff"},
			"pe" : { "x": 1.055, "y": 0.185, "z": 0, "coul": "#ff00ff"}
		},

		"ampoules" : [
			{"x":-1.465, "y": 0.06, "z":0 ,"coul": "#ffff00"},
			{"x":-0.25, "y": 0.06, "z":0.950,"coul": "#ffff00"},
			{ "x":0.25 , "y": 0.06, "z":0.950 ,"coul": "#ffff00"},
			{"x":1.465 , "y": 0.06, "z":0,"coul": "#ffff00"}
		],

		"clapets" : [
			{"x":-1.18,"y":0.123,"z":1.015,"zrot": 0, "coul": "#ffff00"},
			{"x":-0.88,"y":0.123,"z":1.015,"zrot": 0, "coul": "#00ff00"},
			{"x":-0.58,"y":0.123,"z":1.015,"zrot": 0, "coul": "#ffff00"},
			{"x":0.58,"y":0.123,"z":1.015,"zrot": 0, "coul": "#00ff00"},
			{"x":0.88,"y":0.123,"z":1.015,"zrot": 0, "coul": "#ffff00"},
			{"x":1.18,"y":0.123,"z":1.015,"zrot": 0, "coul": "#00ff00"}
		],

		"gobelets" : [
			{"x":-1.250,"y": 0.01,"z":0.750, "coul": "#ffffff"},
			{"x":-0.590,"y": 0.01,"z": -0.170, "coul": "#ffffff"},
			{"x":0,"y": 0.01,"z": 0.650, "coul": "#ffffff"},
			{"x":0.590,"y": 0.01,"z": -0.170, "coul": "#ffffff"},
			{"x":1.250,"y": 0.01,"z": 0.750, "coul": "#ffffff"}
		],

		"pieds" : [
			{"x":-1.410,"y": 0.01,"z":-0.800,"coul": "#ffff00"},
			{"x":-0.650,"y": 0.01,"z": -0.900,"coul": "#ffff00"},
			{"x":-0.650,"y": 0.01,"z": -0.800,"coul": "#ffff00"},
			{"x":-1.410,"y": 0.01,"z": 0.750,"coul": "#ffff00"},
			{"x":-1.410,"y": 0.01,"z": 0.850,"coul": "#ffff00"},
			{"x":-0.630,"y": 0.01,"z": 0.355,"coul": "#ffff00"},
			{"x":-0.200,"y": 0.01,"z": 0.400,"coul": "#ffff00"},
			{"x":-0.400,"y": 0.01,"z": 0.770,"coul": "#ffff00"},
			{"x":1.410,"y": 0.01,"z":-0.800,"coul": "#00ff00"},
			{"x":0.650,"y": 0.01,"z": -0.900,"coul": "#00ff00"},
			{"x":0.650,"y": 0.01,"z": -0.800,"coul": "#00ff00"},
			{"x":1.410,"y": 0.01,"z": 0.750,"coul": "#00ff00"},
			{"x":1.410,"y": 0.01,"z": 0.850,"coul": "#00ff00"},
			{"x":0.630,"y": 0.01,"z": 0.355,"coul": "#00ff00"},
			{"x":0.200,"y": 0.01,"z": 0.400,"coul": "#00ff00"},
			{"x":0.400,"y": 0.01,"z": 0.770,"coul": "#00ff00"}
		],

		"popcorns" : [
			{"x": -1.2,"y": 0.19732,"z": -0.965,"coul": "#ffffff"},
			{"x": -1.2,"y": 0.23732,"z": -0.965,"coul": "#ffffff"},
			{"x": -1.2,"y": 0.27732,"z": -0.965,"coul": "#ffffff"},
			{"x": -1.2,"y": 0.31732,"z": -0.965,"coul": "#ffffff"},
			{"x": -1.2,"y": 0.35732,"z": -0.965,"coul": "#ffffff"},
			{"x": -0.9,"y": 0.19732,"z": -0.965,"coul": "#ffffff"},
			{"x": -0.9,"y": 0.23732,"z": -0.965,"coul": "#ffffff"},
			{"x": -0.9,"y": 0.27732,"z": -0.965,"coul": "#ffffff"},
			{"x": -0.9,"y": 0.31732,"z": -0.965,"coul": "#ffffff"},
			{"x": -0.9,"y": 0.35732,"z": -0.965,"coul": "#ffffff"},
			{"x": 0.9,"y": 0.19732,"z": -0.965,"coul": "#ffffff"},
			{"x": 0.9,"y": 0.23732,"z": -0.965,"coul": "#ffffff"},
			{"x": 0.9,"y": 0.27732,"z": -0.965,"coul": "#ffffff"},
			{"x": 0.9,"y": 0.31732,"z": -0.965,"coul": "#ffffff"},
			{"x": 0.9,"y": 0.35732,"z": -0.965,"coul": "#ffffff"},
			{"x": 1.2,"y": 0.19732,"z": -0.965,"coul": "#ffffff"},
			{"x": 1.2,"y": 0.23732,"z": -0.965,"coul": "#ffffff"},
			{"x": 1.2,"y": 0.27732,"z": -0.965,"coul": "#ffffff"},
			{"x": 1.2,"y": 0.31732,"z": -0.965,"coul": "#ffffff"},
			{"x": 1.2,"y": 0.35732,"z": -0.965,"coul": "#ffffff"},
			{"x":-1.255,"y": 0.028,"z":0.745,"coul": "#ffffff"},
			{"x":-1.240,"y": 0.063,"z":0.760,"coul": "#ffffff"},
			{"x":-1.250,"y": 0.093,"z":0.735,"coul": "#ffffff"},
			{"x":-1.262,"y": 0.113,"z":0.766,"coul": "#ffffff"},
			{"x":-0.595,"y": 0.028,"z": -0.175,"coul": "#ffffff"},
			{"x":-0.580,"y": 0.063,"z": -0.160,"coul": "#ffffff"},
			{"x":-0.590,"y": 0.093,"z": -0.185,"coul": "#ffffff"},
			{"x":-0.602,"y": 0.113,"z": -0.154,"coul": "#ffffff"},
			{"x":0.005,"y": 0.028,"z": 0.645,"coul": "#ffffff"},
			{"x":-0.01,"y": 0.063,"z": 0.660,"coul": "#ffffff"},
			{"x":0.000,"y": 0.093,"z": 0.635,"coul": "#ffffff"},
			{"x":0.012,"y": 0.113,"z": 0.666,"coul": "#ffffff"},
			{"x":0.595,"y": 0.028,"z": -0.175,"coul": "#ffffff"},
			{"x":0.580,"y": 0.063,"z": -0.160,"coul": "#ffffff"},
			{"x":0.590,"y": 0.093,"z": -0.185,"coul": "#ffffff"},
			{"x":0.602,"y": 0.113,"z": -0.154,"coul": "#ffffff"},
			{"x":1.255,"y": 0.028,"z": 0.745,"coul": "#ffffff"},
			{"x":1.240,"y": 0.063,"z": 0.760,"coul": "#ffffff"},
			{"x":1.250,"y": 0.093,"z": 0.735,"coul": "#ffffff"},
			{"x":1.262,"y": 0.113,"z": 0.766,"coul": "#ffffff"}
		]
	};

	Simu.generer_scene = function generer_scene(data){

	//Chargement des robots

		var t = data.robots.gr;
		Simu.afficherGR(t.x,t.y,t.z,t.yrot,t.coul);
		
		t = data.robots.pr;
		Simu.afficherPR(t.x,t.y,t.z,t.yrot,t.coul);
		
		//afficherPath PR
		Simu.initPath();

		Simu.initPiles();

		t = data.robots.ge;
		Simu.afficherGE(t.x,t.y,t.z,t.coul);

		t = data.robots.pe;
		Simu.afficherPE(t.x,t.y,t.z,t.coul);

	// chargement des ampoules

		var t = data.ampoules;
		for(var i=0;i<t.length;i++){
			Simu.afficherAmpoule(t[i].x,t[i].y,t[i].z,t[i].coul);
		}
		

	// chargement des clapets
		
		var t = data.clapets;
		for(var i=0;i<t.length;i++){
			Simu.afficherClapet(t[i].x,t[i].y,t[i].z,t[i].zrot,t[i].coul);
		}


	// chargement des gobelets
		
		var t = data.gobelets;
		for(var i=0;i<t.length;i++){
			Simu.afficherGobelet(t[i].x,t[i].y,t[i].z,t[i].coul);
		}

	// chargement des pieds
		
		var t = data.pieds;
		for(var i=0;i<t.length;i++){
			Simu.afficherPied(t[i].x,t[i].y,t[i].z,t[i].coul);
		}

/*
	// chargement des popcorns
		
		var t = data.popcorns;
		for(var i=0;i<t.length;i++){
			Simu.afficherPopcorn(t[i].x,t[i].y,t[i].z,t[i].coul);
		}*/
	}

	//var data = JSON.parse(datatext);



	Simu.RAYON_ENNEMIS_PETITS = 0.0875;
	Simu.RAYON_ENNEMIS_GRANDS = 0.126; //0.15

	//Simu.GR,Simu.PR,Simu.GE,Simu.PE, Simu.pathPR; //commented: useless ?
	Simu.ampoules = [], Simu.clapets = [],Simu.gobelets = [];
	Simu.pieds = [], Simu.popcorns = [];

	var W = $('#simulateur_container').width();
	var H = Math.max($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(), 200);

	//permet de redimensionner la fenetre
	window.addEventListener('resize', function() {
		var W = $('#simulateur_container').width();
		var H = Math.max($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(), 200);
		Simu.renderer.setSize(W, H);
		Simu.camera.aspect = W / H;
		Simu.camera.updateProjectionMatrix();
	});

	Simu.container = document.getElementById("simulateur_container");



	Simu.scene= new THREE.Scene();

	Simu.renderer = new THREE.WebGLRenderer({antialias:true});

	Simu.renderer.setSize(W,H);
	Simu.renderer.setClearColor(0x272525,0.5);

	Simu.container.appendChild(Simu.renderer.domElement);

	// Simu.camera = new THREE.OrthographicCamera(-2,2,1,-1,0.1,10);
	Simu.camera = new THREE.PerspectiveCamera(45,W/H,0.1,10);


	//gere les controles de la camera
	Simu.controls = new THREE.OrbitControls(Simu.camera, Simu.renderer.domElement);

	Simu.vueDeFace();


	//lights

	Simu.directionLight = new THREE.DirectionalLight(0xffffff,1);
	Simu.directionLight.position.set(-2,5,-2);
	Simu.directionLight.intensity = 0.5;
	Simu.scene.add(Simu.directionLight);

	Simu.directionLight2 = new THREE.DirectionalLight(0xffffff,1);
	Simu.directionLight2.position.set(-2,5,2);
	Simu.directionLight.intensity2 = 0.5;
	Simu.scene.add(Simu.directionLight2);

	Simu.directionLight3 = new THREE.DirectionalLight(0xffffff,1);
	Simu.directionLight3.position.set(2,5,-2);
	Simu.directionLight.intensity3 = 0.5;
	Simu.scene.add(Simu.directionLight3);

	Simu.directionLight4 = new THREE.DirectionalLight(0xffffff,1);
	Simu.directionLight4.position.set(2,5,2);
	Simu.directionLight.intensity4 = 0.5;
	Simu.scene.add(Simu.directionLight4);


	Simu.axisHelper = new THREE.AxisHelper( 5 ); 
	Simu.scene.add( Simu.axisHelper );

	//charge le plateau
	Simu.plateau;

	Simu.loader = new THREE.ColladaLoader();
	Simu.loader.options.convertUpAxis = true;
	Simu.loader.load('../simulateur/afficheur/3d/plateau_mieux.dae',function(collada){

		var dae = collada.scene;
		var skin = collada.skins[0];
	   
		//rendre les cylindres transparents
		collada.dae.effects["transparent_003-effect"].shader.material.opacity = 0.2;
		collada.dae.effects["transparent_003-effect"].shader.material.transparent = true;
		plateau = collada;
		dae.position.set(0,0,0);
		dae.scale.set(1,1,1);
		Simu.scene.add(dae);

	});



	window.addEventListener("keydown",function(event){
		switch(event.which){
			case 97:
				Simu.update(Simu.data2);
				break;
			}
		});


	Simu.render = function render(){


		requestAnimationFrame(Simu.render);
		Simu.renderer.render(Simu.scene,Simu.camera);
		Simu.controls.update();
	}

	Simu.generer_scene(Simu.datatext);
	Simu.render();



};

	Simu.vueDeFace = function() {
		Simu.controls.reset();
		Simu.camera.position.set(0,1.5,2.5);
	}
	Simu.vueDeDessus = function() {
		Simu.controls.reset();
		Simu.camera.position.set(0,3,0);
	}
	Simu.vueDeDerriere = function() {
		Simu.controls.reset();
		Simu.camera.position.set(0,1.5,-2.5);
	}
	Simu.vueDeGauche = function() {
		Simu.controls.reset();
		Simu.camera.position.set(-2.8,1.5,0);
	}
	Simu.vueDeDroite = function() {
		Simu.controls.reset();
		Simu.camera.position.set(2.8,1.5,0);
	}

	Simu.update = function (data){

	// update des robots
	var t; // temp
		t = data.robots.gr;
		Simu.GR.position.set(t.x,0.11,t.y);
		Simu.GR.rotation.y = t.a;

		t = data.robots.pr;
		Simu.PR.position.set(t.x,0.185,t.y);
		Simu.PR.rotation.y = t.a;


		Simu.updatePath(data.robots.pr.path.map(function(pos){
			return new THREE.Vector3(pos[0], 0.01, pos[1]);
		}));

		Simu.updatePiles(data.dynamic);

		t = data.robots.egr;
		var t = data.robots.egr;
		Simu.GE.position.set(t.x,0.185,t.y);
		

		var t = data.robots.epr;
		Simu.PE.position.set(t.x,0.185,t.y);
		

/* TEMP on n'update que les robots
	// update des ampoules

		var t = data.ampoules;
		for(var i=0;i<Simu.ampoules.length;i++){
			Simu.ampoules[i].position.set(t.x,t.y,t.z);
		}
		

	// update des clapets
		
		var t = data.clapets;
		for(var i=0;i<Simu.clapets.length;i++){
			Simu.clapets[i].position.set(t[i].x,t[i].y,t[i].z);
			Simu.clapets[i].rotation.z = t[i].zrot;
		}


	// update des gobelets
		
		var t = data.gobelets;
		for(var i=0;i<Simu.gobelets.length;i++){
			Simu.gobelets[i].scene.position.set(t[i].x,t[i].y,t[i].z);
			var color = new THREE.Color(t[i].coul);
			Simu.gobelets[i].dae.effects["Material_002-effect"].shader.material.color.set(color);
		}

	// update des pieds
		
		var t = data.pieds;
		for(var i=0;i<Simu.pieds.length;i++){
			Simu.pieds[i].scene.position.set(t[i].x,t[i].y,t[i].z);
			var color = new THREE.Color(t[i].coul);
			Simu.pieds[i].dae.effects["Material-effect"].shader.material.color.set(t[i].coul);
		}


	// update des popcorns
		
		var t = data.popcorns;
		for(var i=0;i<Simu.popcorns.length;i++){
			Simu.popcorns[i].position.set(t[i].x,t[i].y,t[i].z);
		}
*/
	}


	Simu.drawLine = function(c1,c2){
		var mat = new THREE.LineBasicMaterial( {color: 0x000000} );
		var geo = new THREE.Geometry();
		geo.vertices.push(
			new THREE.Vector3( c1.x, c1.y, c1.z ),
			new THREE.Vector3( c2.x, c2.y, c2.z)
			);
		var line = new THREE.Line( geo, mat);
		Simu.scene.add(line);
	}