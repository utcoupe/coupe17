/**
 * @file Gestion des objects 3d dans le simulateur
 * @author Mindstan
 * 
 * @requires {THREE}
 * @requires {THREE.ColladaLoader}
 * @requires {Position}
 */

"use strict";

/**
 * Gère les meshes
 * 
 * @class Object3d
 */
class Object3d
{
    /**
     * Constructeur de Object3d
     * 
     * @constructs Object3d
     * @param {Object} params Paramètres divers de l'objet 3d
     */
    constructor (params)
    {
        /** @type {THREE.ColladaLoader} */
        this.loader = new THREE.ColladaLoader();
        this.loader.options.convertUpAxis = true;

        /** @type {Object} */
        this.mesh = null;

        this.setParams(params);
    }

    /**
     * Répartit les valeurs contenues dans params dans les bonne variables membres
     * /!\ Ecrase les données existantes si elles existent ! /!\
     * 
     * @param {Object} params Paramètres divers de l'objet 3d
     */
    setParams(params)
    {
        console.log("Loading params for " + params.name);
        /** @type {Object} */
        this.params = params;

        /** @type {String} */
        this.name = params.name;

        /** @type {Position} */
        this.position = new Position(params.pos.x,params.pos.y, params.pos.z);

        /** @type {String} */
        this.source = params.source;
    }

    /**
     * Charge le mesh contenu dans le fichier collada spécifié par @link{Object3d#source}
     * Appelle la fonction onSucess avec en paramètre la scène losque le chargement est terminé.
     * 
     * @param {function} onSuccess
     */
    loadMesh(onSuccess)
    {
        console.log("Object3d:" + this.name + ":loading " + this.source);
        this.loader.load(this.source, (collada) => {
            this.mesh = collada.scene;
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.scale.set(1, 1, 1);
            //this.debug_scene();
            onSuccess(this.mesh);
            console.log("finished " + this.name);
        });
    }

    debug_scene()
    {
        this.mesh.traverse(function ( object ) { 
            if ( object.material ) {
                object.material = new THREE.MeshBasicMaterial( { wireframe: true } );
            }
        } );
    }
}