"use strict";

class HokuyoDisplay {
	constructor(parentId, mode) {
		var W = $('#'+parentId).width();
		var H = ( 200 / 300 ) * W;// Math.max($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(), 200);

		//permet de redimensionner la fenetre
		window.addEventListener('resize', function() {
			var W = $('#'+parentId).width();
			var H = ( 200 / 300 ) * W;// Math.max($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(), 200);
			this.renderer.setSize(W, H);
			this.camera.aspect = W / H;
			this.camera.updateProjectionMatrix();
		});

		this.container = document.getElementById(parentId);

		this.scene= new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({antialias:false});

		this.renderer.setSize(W,H);
		this.renderer.setClearColor(0x272525,0.5);

		this.container.appendChild(this.renderer.domElement);

		// this.camera = new THREE.OrthographicCamera( -150, 150, 100, -100, 1, 1000 );
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 10;
		this.camera.lookAt ( new THREE.Vector3( 0, 0, 0 ) );
		

		// Test !
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		cube.position.x = 0;
		cube.position.y = 0;
		cube.position.z = 0;
		this.scene.add( cube );

		var render = function () {
			requestAnimationFrame( render );

			cube.rotation.z += 0.1;

			this.renderer.render( this.scene, this.camera );
		}.bind(this);

		render();
	}
}