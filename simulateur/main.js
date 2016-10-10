
RAYON_ENNEMIS_PETITS = 0.0875;
RAYON_ENNEMIS_GRANDS = 0.126; //0.15



//permet de redimensionner la fenetre
window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth*1,
        HEIGHT = window.innerHeight*0.75;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

var container = document.getElementById("container");

var scene= new THREE.Scene();

var renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight*0.75);
renderer.setClearColor(0x272525,0.5);
//renderer.setClearColor(0xff8c00,0.5);
container.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

camera.position.z = 3;
camera.position.y = 1;
camera.lookAt(camera.position);

//gere les controles de la camera
controls = new THREE.OrbitControls(camera, renderer.domElement);





//lights

var directionLight = new THREE.DirectionalLight(0xffffff,1);
directionLight.position.set(-2,5,-2);
directionLight.intensity = 0.5;
scene.add(directionLight);

var directionLight2 = new THREE.DirectionalLight(0xffffff,1);
directionLight2.position.set(-2,5,2);
directionLight.intensity2 = 0.5;
scene.add(directionLight2);

var directionLight3 = new THREE.DirectionalLight(0xffffff,1);
directionLight3.position.set(2,5,-2);
directionLight.intensity3 = 0.5;
scene.add(directionLight3);

var directionLight4 = new THREE.DirectionalLight(0xffffff,1);
directionLight4.position.set(2,5,2);
directionLight.intensity4 = 0.5;
scene.add(directionLight4);


var axisHelper = new THREE.AxisHelper( 5 ); scene.add( axisHelper );

//charge le plateau
var plateau;

var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load('3d/plateau_mieux.dae',function(collada){

	console.log("CHARGEMENT PLATEAU !::::::::::::--->   ",collada);

    var dae = collada.scene;
    var skin = collada.skins[0];
    
    //rendre les cylindres transparents

    collada.dae.effects["transparent_003-effect"].shader.material.opacity = 0.2;
    collada.dae.effects["transparent_003-effect"].shader.material.transparent = true;
    plateau = collada;
    dae.position.set(0,0,0);
    dae.scale.set(1,1,1);
    scene.add(dae);
})







var tabClapets = initClapets();
var fermeture = false;
var vidage = false;



var tabDistributeurs = [];
for(var i=0;i<4;i++) {
    tabDistributeurs.push(creerDistributeur(i));
}




var tabPiedsJaunes = [];
var tabPiedsVerts = [];

initPieds(tabPiedsJaunes,tabPiedsVerts);

var tabGobelets = [];initGobelets(tabGobelets);


var tabAmpoules = [];
initAmpoules(tabAmpoules);




window.addEventListener("keydown",function(event){
	switch(event.which){
		case 97:
			fermeture = true;
			robot4.fermerClapet(tabClapets[3]);
			break;
		case 86: 
			robot4.enDeplacement = true;
			robot4.aParcourir.valeur = 0.1;
			robot4.aParcourir.sens = "avant";
			break;
		case 82:
			robot4.enDeplacement = true;
			robot4.aParcourir.valeur = 0.1;
			robot4.aParcourir.sens = "arriere";
			break;
		case 71:
			robot4.enRotation = true;
			robot4.aTourner.valeur = 45;
			robot4.aTourner.sens = "gauche";
			break;
		case 72:
			robot4.enRotation = true;
			robot4.aTourner.valeur = 45;
			robot4.aTourner.sens = "droite";
			break;
		case 74:
			robot4.prendreObjet(tabPiedsVerts[1]);
			break;
		case 75:
			robot4.prendreObjet(tabPiedsVerts[2]);
			break;
		case 76:
			robot4.prendreObjet(tabGobelets[2]);
			break;
		case 77:
			robot4.prendreObjet(tabPiedsJaunes[1]);
			break;
		case 78:
			robot4.deposerObjet(0);
			break;
		case 79:
			robot4.prendreObjet(tabAmpoules[2]);
			break;		
	}

})

var robot1 = creerRobotPrincipal("gauche");
var robot2 = creerRobotSecondaire("gauche");

var robot3 = creerRobotPrincipal("droit");
var robot4 = creerRobotSecondaire("droit");

var tabRobots = [robot1,robot2,robot3,robot4];
var rob;
//**************************************





function render(){


    requestAnimationFrame(render);
    if(fermeture)
        for(var i=0;i<=5;i++)
            if (tabClapets[i].enFermeture) {
                tabClapets[i].fermer();
                fermeture = true;
            }

    if(vidage){
        for(var i=0;i<4;i++)
            if(tabDistributeurs[i].enVidage){
                tabDistributeurs[i].descendrePopcorn();
                vidage = true;
            }
    }



    for(var r=0;r<4;r++){
    	rob = tabRobots[r];
	    if(rob.enDeplacement && rob.aParcourir.valeur > 0){
	    	if(rob.aParcourir.sens === "avant"){ //avancer
	    	    if(rob.avancer(rob.vitesseDeplacement))
	    			rob.aParcourir.valeur -= rob.vitesseDeplacement;
	    		else{   //collision
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aParcourir.valeur = 0;
	    			rob.enDeplacement = false;
	    		}
	    	}else if(rob.aParcourir.sens === "arriere"){  //reculer
	    		if(rob.reculer(rob.vitesseDeplacement))
	    			rob.aParcourir.valeur -= rob.vitesseDeplacement;
	    		else{   //collision
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aParcourir.valeur = 0;
	    			rob.enDeplacement = false;
	    		}
	    	}
	    }else{
	    	rob.enDeplacement = false;
	    	rob.aParcourir.valeur = 0;
	    }


	    if(rob.enRotation && rob.aTourner.valeur > 0){
	    	if(rob.aTourner.sens === "gauche"){
	    		if(rob.tournerGauche(rob.vitesseRotation)){
	    			rob.aTourner.valeur -= rob.vitesseRotation;
	    		}else{
	    			console.log("Robot : ",rob.nom," collision");
	    			rob.aTourner.valeur = 0;
	    			rob.enRotation = false;
	    		}
	    	}else{
	    		if(rob.tournerDroite(rob.vitesseRotation)){
	    			rob.aTourner.valeur -= rob.vitesseRotation;
	    		}else{
	       			console.log("Robot : ",rob.nom," collision");
	    			rob.aTourner.valeur = 0;
	    			rob.enRotation = false;
	    			}
	    	}
	    }else{
	    	rob.enRotation = false;
	    	rob.aTourner.valeur = 0;
	    }
	}



    renderer.render(scene,camera);

    controls.update();
}

render();




function commande(action){
	var robot;
	for(var i=0;i<4;i++)
	{
		if(document.formulaire.selectRobot[i].checked)
			robot = document.formulaire.selectRobot[i].value;
	}
	console.log("robot : ",robot);
	robot = tabRobots[robot-1];

	if(!action)
		action = document.getElementById('selectAction').value;

	//console.log("robot = ",robot);
	//console.log("action = ",action);


	switch(action){
		case "avancer": 
			robot.enDeplacement = true;
			robot.aParcourir.valeur = 0.1;
			robot.aParcourir.sens = "avant";
			break;
		case "reculer":
			robot.enDeplacement = true;
			robot.aParcourir.valeur = 0.1;
			robot.aParcourir.sens = "arriere";
			break;
		case "tournerGauche":
			robot.enRotation = true;
			robot.aTourner.valeur = 45;
			robot.aTourner.sens = "gauche";
			break;
		case "tournerDroite":
			robot.enRotation = true;
			robot.aTourner.valeur = 45;
			robot.aTourner.sens = "droite";
			break;
		case "prendrePopcorn":
			for(var d=0;d<4;d++)
				if(robot.verifCibleAtteignable({x:tabDistributeurs[d].x,z:tabDistributeurs[d].z}))
				{
					robot.prendrePopcorn(tabDistributeurs[d]);
					vidage = true;
					tabDistributeurs[d].enVidage = true;
				}
			break;
		case "prendreObjet":
			var pris = false;
			for(var p=0;p<8 && !pris;p++)
				if(robot.prendreObjet(tabPiedsJaunes[p]))
					pris = true;
			for(var p=0;p<8 && !pris;p++)
				if(robot.prendreObjet(tabPiedsVerts[p]))
					pris = true;
			for(var p=0;p<5 && !pris;p++)
				if(robot.prendreObjet(tabGobelets[p]))
					pris = true;
			for(var a=0;a<4 && !pris;a++)
				if(robot.prendreObjet(tabAmpoules[a]));
					pris = true;
			break;
		case "deposerObjet":
			robot.deposerObjet(0);
			break;
		case "fermerClapet":
			var ferme = false;
			for(var c=0;c<6 && !ferme;c++)
				if(robot.fermerClapet(tabClapets[c])){
					ferme = true;
				}
			break;

		case "deroulerTapis":
			robot.deroulerTapis();
	}

}

function exportChildrenToObject(children) {
	var new_object = [], child, child2;
	for(var i in children) {
		child = children[i];
		child2 = {};
		child2.position = child.position;
		child2.rotation = child.rotation;
		child2.scale = child.scale;
		// child2.children = exportChildrenToObject(child.children);
		new_object.push(child2);
	}

	return new_object;
}
function sceneToJson(scene) {
	return JSON.stringify(exportChildrenToObject(scene.children));
}


console.log(scene.children);




/*


function export(){

	console.log("EXPORT : " + scene);




}
*/



/* 



faire un simulateur uniquement pour l'affichage 
- gerer les groupes d'objets
- un devant un derriere






*/




