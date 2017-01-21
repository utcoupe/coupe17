/**
 * @file Gestion des objects 3d dans le simulateur
 * @author Mindstan
 * 
 * @requires {THREE}
 * @requires {THREE.ColladaLoader}
 * @requires {Position}
 */

"use strict";

/*
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
     * 
     * /!\ Ecrase les données existantes si elles existent ! /!\
     * 
     * @param {Object} params Paramètres divers de l'objet 3D
     */
    setParams (params)
    {
        console.log("Loading params for " + params.name);
        /** @type {Object} */
        this.params = params;

        /** @type {String} */
        this.name = params.name;

        /** @type {Position} */
        this.position = new Position(params.pos.x, params.pos.y, params.pos.z);

        /** @type {Position} */
        this.rotation = new Position(params.rotation.x, params.rotation.y, params.rotation.z);
        this.rotation.makeRotationFromDegrees();

        /** @type {String} */
        this.source = params.source;
    }

    /**
     * Charge le mesh contenu dans le fichier collada spécifié par {@link Object3d#source}
     * 
     * Appelle la fonction onSucess avec en paramètre la scène (c'est-à-dire l'objet) losque le chargement est terminé.
     * 
     * @param {function} onSuccess Callback appelé lorsque le chargement du collada est terminé
     */
    loadMesh (onSuccess)
    {
        console.log("Object3d:" + this.name + ":loading " + this.source);
        this.loader.load(this.source, (collada) => {
            this.mesh = collada.scene;
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            this.mesh.scale.set(1, 1, 1);
            //this.debug_scene();
            onSuccess(this.mesh);
            console.log("Object3d:" + this.name + ": finished loading");
        });
    }

    /**
     * Change la position de l'objet
     * 
     * @param {Position} pos Nouvelle position
     */
    setPosition (pos)
    {
        this.position = pos;
        if ( mesh )
        {
            mesh.position.set(pos.x, pos.y, pos.z);
        }
    }

    /**
     * Change la rotation de l'objet
     * 
     * @param {Position} rotation Nouvelle rotation
     */
    setRotation (rotation)
    {
        this.rotation = rotation;
        if ( mesh )
        {
            mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    /**
     * Affiche l'objet en mode fils de fer
     * (utile lorsque les textures ne chargent pas ou quand les faces sont transparentes)
     */
    debug_scene ()
    {
        this.mesh.traverse(function ( object ) { 
            if ( object.material ) {
                object.material = new THREE.MeshBasicMaterial( { wireframe: true } );
            }
        } );
    }
}