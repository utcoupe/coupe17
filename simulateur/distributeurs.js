function creerPopcorn(x,y,z){
    var geo = new THREE.SphereGeometry(0.02,60,60);
    var mat = new THREE.MeshLambertMaterial({color:'white',side:THREE.DoubleSide});
    var sphere = new THREE.Mesh(geo,mat);
    sphere.position.set(x,y,z);
    sphere.ok = true;
    sphere.hauteur = 0.04;
    scene.add(sphere);
    return sphere;
}





function creerDistributeur(n) {

    if(n>=0 && n<4) {
        var position = [-1.2,-0.9,0.9,1.2];
        var xx = position[n];
        var zz = -0.965;
        //le popcorn du dessous s'enfonce de 2.67mm
        var yy = (190 + 10 - 2.68) / 1000;
        var distri = {num: n, tailleReservoir: 0, x: xx, y: yy, z: zz, reservoir: [],enVidage:false};


        distri.remplir = remplirDistributeur;
        distri.vider = viderDistributeur;
        distri.descendrePopcorn = descendrePopcorn;

        for(var i=1;i<=5;i++)
      		distri.remplir();
   		
        return distri;
    }
}





function remplirDistributeur(){
    if(this.tailleReservoir<5){
        var yy = this.y+0.04*this.tailleReservoir;
        this.reservoir.push(creerPopcorn(this.x,yy,this.z));
        this.tailleReservoir++;
    }
}

function viderDistributeur(){
	console.log("vidage distri ",this.num);
    if(this.tailleReservoir>0){
        var pop = this.reservoir.shift();
        scene.remove(pop);
        this.tailleReservoir--;
        return pop;
    }else
        return undefined;
}


function descendrePopcorn(){
    if(this.tailleReservoir>0 && this.reservoir[0].position.y>this.y){
        for(var i=0;i<this.tailleReservoir;i++){
            this.reservoir[i].position.y -= 0.01;
        }
    }else{
        this.enVidage = false;
    }
}

