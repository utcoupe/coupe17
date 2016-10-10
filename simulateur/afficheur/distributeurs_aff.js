var Simu = Simu || {};


Simu.creerPopcorn = function creerPopcorn(x,y,z){
    var geo = new THREE.SphereGeometry(0.02,60,60);
    var mat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
    var sphere = new THREE.Mesh(geo,mat);
    sphere.position.set(x,y,z);
    sphere.ok = true;
    sphere.hauteur = 0.04;
    Simu.scene.add(sphere);
    return sphere;
}


