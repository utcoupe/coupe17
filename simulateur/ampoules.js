

function creerAmpoule(pos){
    var geo = new THREE.SphereGeometry(0.0325,60,60);
    var mat = new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSide});
    var ampoule = new THREE.Mesh(geo,mat);
    ampoule.position.set(pos.x,pos.y,pos.z);
    ampoule.ok = true;
    ampoule.hauteur = 0.065;
    scene.add(ampoule);
    return ampoule;
}

function initAmpoules(tab){
    //cree les 4 ampoules et les ajoute dans tab
    var positions = [
        { x:-1.465, y: 0.06, z:0 },
        { x:-0.25, y: 0.06, z:0.950 },
        { x:0.25 , y: 0.06, z:0.950 },
        { x:1.465 , y: 0.06, z:0 },
    ]

    for(var i=0;i<4;i++){
        tab.push(creerAmpoule(positions[i]));
    }
}