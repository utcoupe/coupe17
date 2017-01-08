/**
 * @file Controlleur du simulateur
 * @author Mindstan
 * 
 * @requires {THREE}
 * @requires {THREE.OrbitControls}
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
        /** @type {String} */
        this.container = document.getElementById("simulateur_container");

        /** @type {Array<Object3d>} */
        this.objects3d = [];

        /** @type {Array<THREE.DirectionalLight>} */
        this.directionLights = [];
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
        //alert($('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight());
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
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        /** @type {THREE.AxisHelper} */
        this.axisHelper = new THREE.AxisHelper(5);
        this.scene.add(this.axisHelper);

        this.createLights();
        this.selectView("front");

        // On lance le rendu
        this.render();
    }

    /**
     * Crée et insert des lumières directionnelles dans la scène
     */
    createLights()
    {
        var heightLights = 5;
        // Les lumières sont disposés haut-dessus des quattres coins du plateau
        var posLights = [
            new Position(0, heightLights, 0),
            new Position(4, heightLights, 0),
            new Position(0, heightLights, 0),
            new Position(4, heightLights, 0)
        ];

        posLights.forEach(function(pos) {
            var light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(pos.x, pos.y, pos.z);
            light.intensity = 0.5;
            this.directionLights.push(light);
        }, this);

        for(var idLight = 0; idLight < this.directionLights.length; idLight++)
        {
            this.scene.add(this.directionLights[idLight]);
        }
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

    /**
     * Affiche la vue désirée
     * 
     * Valeurs possibles : "front", "top", "behind", "left", "right"
     * 
     * @param {String} view Vue désirée
     */
    selectView(view)
    {
        console.log("Changement de vue : " + view);
        if(view == "front")
        {
            this.controls.reset();
            this.camera.position.set(2, 1.5, 4.5);
        }
        else if(view == "top")
        {
            this.controls.reset();
            this.camera.position.set(2, 3, 2);
        }
        else if (view == "behind")
        {
            this.controls.reset();
            this.camera.position.set(2, 1.5, -0.5);
        }
        else if (view == "left")
        {
            this.controls.reset();
            this.camera.position.set(0.8, 1.5, 2);
        }
        else if (view == "right")
        {
            this.controls.reset();
            this.camera.position.set(4.8, 1.5, 2);
        }
    }
}