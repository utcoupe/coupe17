/**
 * @file Classe permettant de travailler avec des coordonnées cartésiennes et angulaires dans l'espace
 * @author Mindstan
 * 
 */

"use strict";

/**
 * Permet de travailler avec des coordonnées sur 3 dimensions
 */
class Position
{

    /**
     * Constructeur de Position
     *
     * @param {?Number} x
     * @param {?Number} y
     * @param {?Number} z
     */
    constructor (x = 0, y = 0, z = 0)
    {
        /** @type {Number} */
        this.x = x;
        /** @type {Number} */
        this.y = y;
        /** @type {Number} */
        this.z = z;
    }


    /**
     * Calcule la distance sur 2 dimentions par rapport à la position passée en paramètre (x et y)
     * 
     * @param {Position} pos
     * @returns {Number}
     */
    get2dDistance(pos)
    {
        deltaX = this.x - pos.x;
        deltaY = this.y - pos.y;
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    }

    /**
     * Calcule la distance sur 3 dimentions par rapport à la position passée en paramètre
     * 
     * @param {Position} pos
     * @returns {Number}
     */
    get3dDistance(pos)
    {
        deltaX = this.x - pos.x;
        deltaY = this.y - pos.y;
        deltaY = this.z - pos.z;
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2) + Math.pow(deltaZ, 2))
    }

    /**
     * Aditionne la position passée en paramètre avec celle actuelle
     * 
     * @param {Position} pos
     */
    add(pos)
    {
        this.x += pos.x;
        this.y += pos.y;
        this.z += pos.z;
    }

    /**
     * Convertit tous les angles portés par les axes en radians
     */
    makeRotationFromDegrees()
    {
        this.x = this.convertDegreesToRadians(this.x);
        this.y = this.convertDegreesToRadians(this.y);
        this.z = this.convertDegreesToRadians(this.z);
    }

    /**
     * Convertit des degrés en radians
     */
    convertDegreesToRadians(deg)
    {
        return (deg * Math.PI / 180);
    }

    /**
     * Met à jour la position sur tous les axes
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    set (x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
