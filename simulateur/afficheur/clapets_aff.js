var Simu = Simu || {};

Simu.afficherClapet = function afficherClapet(x,y,z,zrot,coul)
{
    /*  Entrees :
            x, y, z
            coul = hexa
    */
    var geo = new THREE.BoxGeometry(0.16,0.03,0.03);
 	var mat =  new THREE.MeshLambertMaterial({color:coul,side:THREE.DoubleSide});
 	var clapet = new THREE.Mesh(geo,mat);
 	clapet.position.set(x,y,z);
 	clapet.rotation.z = zrot;
 	Simu.scene.add(clapet);
    Simu.clapets.push(clapet);
}
