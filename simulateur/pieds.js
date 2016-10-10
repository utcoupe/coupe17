/**
 * Created by matthieu on 02/02/15.
 */




function creerPied(tab,coul,x,y,z){
    loader.load("3d/pied_"+coul+".dae",function(collada){
        var dae = collada.scene;
       // console.log("collada.dae",dae);
        dae.type="pied"+coul;
        dae.hauteur = 0.070;
        dae.position.set(x,y,z);
        dae.scale.set(1,1,1);
        scene.add(dae);
        dae.ok = true;		 	//ok = true si l'objet n'a pas été déplacé
        tab.push(collada);
    });
}


function initPieds(tabj,tabv){

    var posPiedsJaunes = [{x:-1.410,z:-0.800},
                         {x:-0.650,z: -0.900},
                         {x:-0.650,z: -0.800},
                         {x:-1.410,z: 0.750},
                         {x:-1.410,z: 0.850},
                         {x:-0.630,z: 0.355},
                         {x:-0.200,z: 0.400},
                         {x:-0.400,z: 0.770}];

    var posPiedsVerts = [{x:1.410,z:-0.800},
                          {x:0.650,z: -0.900},
                          {x:0.650,z: -0.800},
                          {x:1.410,z: 0.750},
                          {x:1.410,z: 0.850},
                          {x:0.630,z: 0.355},
                          {x:0.200,z: 0.400},
                          {x:0.400,z: 0.770}];
    var positionY = 0.01;
    for(var i=0;i<8;i++){
        creerPied(tabj,"jaune",posPiedsJaunes[i].x,positionY,posPiedsJaunes[i].z);
        creerPied(tabv,"vert",posPiedsVerts[i].x,positionY,posPiedsVerts[i].z);
    }
}
/*
-1.410 -0.800
-0.650 -0.900
-0.650 -0.800
-1.410 0.750
-1.410 0.850
-0.630 0.355
-0.200 0.400
-0.400 0.770
*/