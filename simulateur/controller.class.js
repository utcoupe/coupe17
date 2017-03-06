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

/*
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
     * @param {String} ressourcesPath
     */
    constructor (configPath, ressourcesPath)
    {
        /** @type {String} */
        this.configPath = configPath;

        /** @type {String} */
        this.ressourcesPath = ressourcesPath;
        
        // A charger dynamiquement du fichier
        /** @type {String} */
        this.container = document.getElementById("simulateur_container");

        /** @type {Map<Object3d>} */
        this.objects3d = new Map();

        /** @type {Array<THREE.DirectionalLight>} */
        this.directionLights = [];
    }

    /**
     * Charge tous les paramètres
     * @see {@link Controller#configPath}
     */
    loadParameters()
    {
        getParsedJSONFromFile(
            this.ressourcesPath + this.configPath,
            (objects) => { this.create3dObjects(objects) }
        );
    }

    /**
     * Crée tous les objets 3D passés en paramètres
     * 
     * @param {Array<Object>} objects liste de tous les objets à créer
     */
    create3dObjects(objects)
    {
        console.log("Creating the 3D objects...");
        for(var idObject = 0; idObject < objects.length; idObject++)
        {
            var name = objects[idObject].name;
            console.log("Creating " + name);
            this.objects3d.set(name, new Object3d(objects[idObject], this.ressourcesPath));
            this.objects3d.get(name).loadMesh((scene) => {
                this.scene.add(scene);
            });
        }
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

        window.addEventListener('resize', () => {
            var HEIGHT = Math.max(
                $('body').height() - $('#div_menu').outerHeight() - 2*$('#simu_before').outerHeight(),
                200
            );
		    var WIDTH = $('#simulateur_container').width();
            this.renderer.setSize(WIDTH, HEIGHT);
            this.camera.aspect = WIDTH / HEIGHT;
            this.camera.updateProjectionMatrix();
        });

        // On lance le rendu
        this.render();
    }

    /**
     * Crée et insert des lumières directionnelles dans la scène
     */
    createLights()
    {
        var heightLights = 5;
        // Les lumières sont disposés haut-dessus des quattres coins du plateau, avec un offset de 1
        var posLights = [
            new Position(-1, heightLights, -1),
            new Position(4, heightLights, -1),
            new Position(-1, heightLights, 3),
            new Position(4, heightLights, 3)
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
            this.camera.position.set(1, 1.5, 3.5);
            this.camera.rotation.set(-0.5, 0, 0);
            this.controls.target.set(1, 0, 1);
        }
        else if(view == "top")
        {
            this.controls.reset();
            this.camera.position.set(1, 3, 1);
            this.camera.rotation.set(-1.6, 0, 0);
            this.controls.target.set(1, 0, 1);
        }
        else if (view == "behind")
        {
            this.controls.reset();
            this.camera.position.set(1.5, 1, -1.5);
            this.camera.rotation.set(-2.5, 0, 3.0);
            this.controls.target.set(1, 0, 1);
        }
        else if (view == "left")
        {
            this.controls.reset();
            this.camera.position.set(-0.8, 1.5, 1);
            this.camera.rotation.set(-1.6, -1, -1.6);
            this.controls.target.set(1, 0, 1);
        }
        else if (view == "right")
        {
            this.controls.reset();
            this.camera.position.set(4, 0.5, 1);
            this.camera.rotation.set(-1.5, 1.5, 1.5);
            this.controls.target.set(1, 0, 1);
        }
        else // Invalide
            console.warn("Attention : \"" + view + "\" n'est pas une vue valide.");
    }

    /**
     * Met à jour les données des objets dans param. Cette fonction est destinée à être appelée depuis le webclient.
     * 
     * @param {Object} params 
     */
    updateObjects(params)
    {
        params.forEach(function(object3d) {
            this.objects3d.get(object3d.name).updateParams(object3d);
        }, this);
    }
}