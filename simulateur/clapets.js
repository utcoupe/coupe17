
function initClapets(){

    var tab = [];
    var positions = {
        "1" : {x:-1.18,y:0.123,z:1.015},
        "2" :{x:-0.88,y:0.123,z:1.015},
        "3" :{x:-0.58,y:0.123,z:1.015},
        "4" :{x:0.58,y:0.123,z:1.015},
        "5" : {x:0.88,y:0.123,z:1.015},
        "6" : {x:1.18,y:0.123,z:1.015}};
    for(var i=1;i<=6;i++){
        tab.push(creerClapet(positions[i],i));
    }
    return tab;
}

function creerClapet(p,num){
    var geo = new THREE.BoxGeometry(0.16,0.03,0.03);

    var coul;
    if(num%2!=0)
        coul = 'yellow';
    else
        coul='green';

    var matVert =  new THREE.MeshLambertMaterial({color:coul,side:THREE.DoubleSide});
    var clapet = new THREE.Mesh(geo,matVert);
    scene.add(clapet);
    clapet.position.set(p.x, p.y, p.z);

    // C pt pivot pour la rotation
    var C;
    if(p.x<0)
        C = {x: p.x-0.08,y: p.y-0.015};
    else
        C = {x: p.x+0.08,y: p.y-0.015};
    var L = Math.sqrt(0.08*0.08+0.015*0.015);
    var w = Math.PI*(90)/180;

    //+/-0.1853 car angle entre C et le centre du clapet

    if(p.x>0){
        w *=-1;
        clapet.position.set(C.x+L*Math.cos(Math.PI+w-0.1853), C.y+L*Math.sin(Math.PI+w-0.1853), p.z);
        clapet.cote="droite";
    }else{
        clapet.position.set(C.x+L*Math.cos(w+0.1853), C.y+L*Math.sin(w+0.1853), p.z);
        clapet.cote="gauche";
    }

    clapet.rotation.z = w;
    clapet.pivot = C;
    clapet.enFermeture = false;
    clapet.etat = "ouvert";

    clapet.fermer = fermer


    return clapet;
}

/*
Dimensions d'un clapet :
-0.16 0.03 0.03

Position de gauche a droite :

-1.175 0.124 1.015  J
-0.875 0.124 1.015  V
-0.575 0.124 1.015  J


0.585 0.124 1.015   V
0.885 0.124 1.015   J
1.185 0.124 1.015   V


*/

function fermer(){

    if(this.position.y-this.pivot.y>0.0155){

        var p = this.position;
        var C = this.pivot;
        var L = Math.sqrt(0.08*0.08+0.015*0.015);
        var w;

        if(this.cote==="droite"){
            w =  this.rotation.z+0.03;
            this.position.set(C.x+L*Math.cos(Math.PI+w-0.1853), C.y+L*Math.sin(Math.PI+w-0.1853), p.z);
            this.rotation.z = w;
        }else{
            w = this.rotation.z-0.03;
            this.position.set(C.x+L*Math.cos(w+0.1853), C.y+L*Math.sin(w+0.1853), p.z);
            this.rotation.z = w;
        }
    }else
    {
        this.enFermeture = false;
        this.etat = "ferme";
    }
}