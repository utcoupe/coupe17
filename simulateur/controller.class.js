/**
 * @file Controlleur du simulateur
 * @author Mindstan
 * 
 * @requires {THREE}
 * @requires {Position}
 * @requires {Object3d}
 */

"use strict";

/**
 * Gère le simulateur
 * 
 * @class Controller
 */
class Controller
{
    /**
     * Constructeur du controlleur
     * 
     * @constructs Controller
     * @param {String} configPath
     */
    constructor (configPath)
    {
        /** @type {String} */
        this.configPath = configPath;
        
        // A charger dynamiquement du fichier
        /** @type {Position} */
        this.posRelative = new Position(0, 0, 0);
        /** @type {String} */
        this.container = document.getElementById("simulateur_container");

        /** @type {Array<Object3d>} */
        this.objects3d = {};
    }

    /**
     * Crée tous les objets 3D passés en paramètres
     * 
     * @see {@link{Controller.configPath}}
     */
    create3dObjects()
    {
        //
    }

    /**
     * Crée le moteur de rendu
     */
    createRenderer()
    {
        // hauteur de la zone de rendu
        var height = Math.max(
            $('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(),
            200
        );
        // largeur de la zone de rendu
		var width = $('#simulateur_container').width();

        /** @type {THREE.Scene} */
        this.scene = new THREE.Scene();
        /** @type {THREE.PerspectiveCamera} */
        this.camera = new THREE.PerspectiveCamera(45,width/height,0.1,10);

        /** @type {THREE.WebGLRenderer} */
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
	    this.renderer.setClearColor(0x272525,0.5);
        this.container.appendChild(this.renderer.domElement);

        /** @type {THREE.OrbitControls} */
        this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);

        // On lance le rendu
        this.render();
    }

    /**
     * Crée une boucle et met à jour le rendu à 60fps
     */
    render()
    {
        requestAnimationFrame(() => {
            this.render();
        });
        this.renderer.render(this.scene, this.camera);
    }

    test()
    {
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );

        this.camera.position.z = 5;
    }
}