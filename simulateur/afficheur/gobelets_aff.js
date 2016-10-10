var Simu = Simu || {};



Simu.afficherGobelet = function afficherGobelet(x,y,z,coul){
    /*  Entrees :
            x, y, z
            coul = hexa
    */
    Simu.loader.load("../simulateur/afficheur/3d/gobelet.dae",function(collada){
        var dae = collada.scene;
        dae.hauteur = 0.150;
        dae.position.set(x,y,z);
        collada.dae.effects["Material_002-effect"].shader.material.opacity = 0.65;
        collada.dae.effects["Material_002-effect"].shader.material.transparent = true;
        var color = new THREE.Color(coul);
        collada.dae.effects["Material_002-effect"].shader.material.color.set(color);

        dae.scale.set(1,1,1);
        Simu.scene.add(dae);
        Simu.gobelets.push(collada);
    });
    }



Simu.afficherPopcorn =  function afficherPopcorn(x,y,z,coul)
{
    /*  Entrees :
            x, y, z
    */
    var geo = new THREE.SphereGeometry(0.02,60,60);
    var mat = new THREE.MeshLambertMaterial({color:coul,side:THREE.DoubleSide});
    var popcorn = new THREE.Mesh(geo,mat);
    popcorn.position.set(x,y,z);
    Simu.scene.add(popcorn);
    Simu.popcorns.push(popcorn);
}



