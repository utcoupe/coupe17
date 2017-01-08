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
        this.loader = new ColladaLoader();
        this.loader.options.convertUpAxis = true;

        /** @type {Object} */
        this.mesh = null;

        setParams(params);
    }

    /**
     * Répartit les valeurs contenues dans params dans les bonne variables membres
     * /!\ Ecrase les données existantes si elles existent ! /!\
     * 
     * @param {Object} params Paramètres divers de l'objet 3d
     */
    setParams(params)
    {
        /** @type {Object} */
        this.params = params;

        /** @type {String} */
        this.name = params.name;

        /** @type {Position} */
        this.position = new Position(params.pos.x,params.pos.y, params.pos.z);

        /** @type {String} */
        this.source = params.source;
        loadMesh();
    }

    /**
     * Charge le mesh contenu dans le fichier collada spécifié par @link{Object3d#source}
     */
    loadMesh()
    {
        console.log("Object3d:" + this.name + ":loading " + this.source);
        this.loader.load(this.source, function(collada) {
            this.mesh = collada.scene;
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.scale.set(1, 1, 1);
        });
    }
}