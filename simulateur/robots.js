/*

petit : 
x: 0.15
y: 0.35
z: 0.20

grand :
x: 0.25
y: 0.35
z: 0.35

*/




function creerRobotPrincipal(cote){


	var posx = {"gauche":-1.5+0.125+0.07,"droit":1.5-0.125-0.07};
	
	var geo;

	if(cote==="droit"){
		geo = new THREE.CylinderGeometry( RAYON_ENNEMIS_GRANDS,RAYON_ENNEMIS_GRANDS,0.35,25);
	}
	else{
		geo = new THREE.BoxGeometry(0.25,0.35,0.35);
	}


    var boxMat;
    if(cote==="gauche"){
    	boxMat = [
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'yellow',side:THREE.doubleSided})];
    }else{

    	boxMat = [
				new THREE.MeshLambertMaterial({color:'green',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'green',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'green',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'green',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:'green',side:THREE.doubleSided})];
    }

	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);


    robot.position.set(posx[cote],0.185,0);
    var vect = new THREE.Vector3(robot.position.x,0,robot.position.z);
    robot.direction = vect.negate().normalize();


    robot.points = [];
    robot.largeur = 0.250;
    robot.longueur = 0.350;
    robot.hauteur = 0.350;
  	robot.diago = Math.sqrt(0.25*0.25+0.35*0.35);
  	robot.tapisDeroule = false;

    
    robot.nom = "robot principal "+cote;
    robot.cote = cote;
    robot.avancer = avancer;
    robot.reculer = reculer;
    robot.tournerDroite = tournerDroite;
    robot.tournerGauche = tournerGauche;
    robot.updatePoints = updatePoints;
    robot.verifPosition = verifPosition;
    robot.verifCollisionObjets = verifCollisionObjets;
    robot.verifCollisionObjet = verifCollisionObjet;
    robot.verifCollisionRobot = verifCollisionRobot;
    robot.verifCollisionRobots = verifCollisionRobots;

    robot.prendreObjet = prendreObjet;
    robot.deposerObjet = deposerObjet;
    robot.verifCibleAtteignable = verifCibleAtteignable;
	robot.objetsTenus = [];
	robot.objetsTenus.dessus = robot.hauteur/2 + 0.02;
	robot.objetsTenus.nombre = 0;
	robot.prendrePopcorn = prendrePopcorn;
	robot.fermerClapet = fermerClapet;
	robot.deroulerTapis = deroulerTapis;


	robot.enDeplacement = false;
	robot.aParcourir = {valeur : 0,sens : "avant"};
	robot.enRotation = false;
	robot.aTourner = {valeur:0,sens:'gauche'};
	robot.vitesseDeplacement = 0.01;
	robot.vitesseRotation = 1;



	robot.updatePoints();
    scene.add(robot);
    return robot;
}


function creerRobotSecondaire(cote){
	var posx = {"gauche":-1.5+0.125+0.07+0.25,"droit":1.5-0.125-0.07-0.25};




	if(cote==="droit"){
		geo = new THREE.CylinderGeometry( RAYON_ENNEMIS_PETITS,RAYON_ENNEMIS_PETITS,0.35,25);
	}
	else{
		var geo = new THREE.BoxGeometry(0.15,0.35,0.20);
	}







  	var boxMat;

  	if(cote==="gauche"){
		boxMat = [	new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(255,255,51)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(255,255,51)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(255,255,51)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(255,255,51)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(255,255,51)',side:THREE.doubleSided})];
	}else
	{
		boxMat = [	new THREE.MeshLambertMaterial({color:'rgb(63,220,67)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(63,220,67)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(63,220,67)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(63,220,67)',side:THREE.doubleSided}),
					new THREE.MeshLambertMaterial({color:'rgb(63,220,67)',side:THREE.doubleSided})];
	}




/*
	if(cote=="droit"){
		var temp = boxMat[4];
		boxMat[4] = boxMat[0];
		boxMat[0] = temp;
		boxMat.reverse();
	}*/




	var mat = new THREE.MeshFaceMaterial( boxMat );	
	var rob = new THREE.Mesh(geo,mat);
	
	rob.position.set(posx[cote],0.185,0);

    var vect = new THREE.Vector3(rob.position.x,0,rob.position.z);
    rob.direction = vect.negate().normalize();


    rob.points = [];
    rob.largeur = 0.150;
    rob.longueur = 0.200;
    rob.hauteur = 0.350;
	rob.diago = Math.sqrt(0.150*0.150+0.200*0.200);

	rob.nom = "robot secondaire "+cote;
	rob.cote = cote;
	rob.avancer = avancer;
    rob.reculer = reculer;
    rob.tournerDroite = tournerDroite;
    rob.tournerGauche = tournerGauche;
    rob.updatePoints = updatePoints;
    rob.verifPosition = verifPosition;
    rob.verifCollisionObjets = verifCollisionObjets;
    rob.verifCollisionObjet = verifCollisionObjet;
    rob.verifCollisionRobot = verifCollisionRobot;
    rob.verifCollisionRobots = verifCollisionRobots;

    rob.prendreObjet = prendreObjet;
    rob.deposerObjet = deposerObjet;
    rob.verifCibleAtteignable = verifCibleAtteignable;
    rob.objetsTenus = [];
    rob.objetsTenus.dessus = rob.hauteur/2 + 0.02;;
	rob.objetsTenus.nombre = 0;
	rob.prendrePopcorn = prendrePopcorn;
	rob.fermerClapet = fermerClapet;


	rob.enDeplacement = false;
	rob.aParcourir = {valeur : 0,sens : "avant"};
	rob.enRotation = false;
	rob.aTourner = {valeur:0,sens:'gauche'};
	rob.vitesseDeplacement = 0.01;
	rob.vitesseRotation = 1;



	scene.add(rob);

	rob.updatePoints();
	return rob;
}


function avancer(d){
	this.translateOnAxis(this.direction,d);
	if(!this.verifPosition()){
		this.translateOnAxis(this.direction,-d);
		return false;
	}
	return true;
}

function reculer(d){
	this.translateOnAxis(this.direction,-d);
	if(!this.verifPosition()){
		this.translateOnAxis(this.direction,d);
		return false;
	}
	return true;
}

function tournerDroite(deg){
	var rad = deg*Math.PI/180;
	this.rotation.y -= rad;
	if(!this.verifPosition()){
		this.rotation.y += rad;
		return false;
	}
	return true;
}

function tournerGauche(deg){
	var rad = deg*Math.PI/180;
	this.rotation.y += rad;
	if(!this.verifPosition()){
		this.rotation.y -= rad;
		return false;
	}
	return true;
}

function updatePoints(){
	//met a jour les coordonnees des sommets du robots
	var p = this.position;
	var largeur = this.largeur;
	var longueur = this.longueur;
	var d = this.diago/2;

	var a = 180*Math.atan(longueur/largeur)/Math.PI;
	var angles = [360-a,a,180-a,180+a,0,180];


	//var angles = [305.5,54.5,125.5,234.5,0,180];
	var rotation = -this.rotation.y; 	//la rotation est calculee de +Z vers +X

	// pour les sommets on prend les 4 angles + les 2 milieux des faces avant et arriere
	//on peut rajouter des points intermediaires pour une meilleure detection des bords
	for(var i=0;i<4;i++)
		this.points[i] = {x:p.x+Math.cos(rotation+angles[i]*Math.PI/180)*d,z:p.z+Math.sin(rotation+angles[i]*Math.PI/180)*d};
	this.points[4] = {x:p.x+Math.cos(rotation+angles[4]*Math.PI/180)*largeur/2,z:p.z+Math.sin(rotation+angles[4]*Math.PI/180)*largeur/2};
	this.points[5] = {x:p.x+Math.cos(rotation+angles[5]*Math.PI/180)*largeur/2,z:p.z+Math.sin(rotation+angles[5]*Math.PI/180)*largeur/2};

	if(this.cote ==="droit"){
		echangerPoints(this.points,0,2);
		echangerPoints(this.points,1,3);
		echangerPoints(this.points,4,5);
	}
}



function verifPosition(){
	this.updatePoints();
	this.verifCollisionObjets();
	var collision_robots = this.verifCollisionRobots();
	var ok = true;
	for(var i=0;i<6;i++){
		if(!verifPoint(this.points[i]))
			ok = false;
	}
	return ok && !collision_robots;
}

function verifPoint(p){
	//verifie la position d'un sommet des robots
	if(p.x<1.500 && p.x>-1.500 && p.z<1.000 && p.z>-1.000)
	{
		if(p.x<=0.533 && p.x>=-0.533){
			if(p.z>-0.420){
				if(p.z>=0.9){
					if(p.x>0.3 || p.x<-0.3)
						return true;
					else
						return false;
				}else
					return true;
			}
			else
				return false;
		}
		if(p.z<=-0.420){
			if(p.x>0.533 || p.x<-0.533)
				return true;
			else
				return false;
		}

		return true;
	}
	return false;
}


function verifCollisionObjets(){
	//console.log("verif collision gobelets");
	for(var i=0;i<5;i++){
		if(tabGobelets[i].scene.ok && this.verifCollisionObjet(tabGobelets[i].scene.position)){

			tabGobelets[i].scene.ok = false;
			tabGobelets[i].dae.effects["Material_002-effect"].shader.material.opacity = 0.8;
			tabGobelets[i].dae.effects["Material_002-effect"].shader.material.color = {r:1,g:0,b:0}; 
			console.log("collision GOBELETS - ROBOT !!!");
		}
	}
	for(var i=0;i<8;i++)
	{
		if(tabPiedsVerts[i].scene.ok && this.verifCollisionObjet(tabPiedsVerts[i].scene.position)){
			//tabPiedsVerts[i].scene.visible=false;
			tabPiedsVerts[i].scene.ok=false;
			tabPiedsVerts[i].dae.effects["vertPied-effect"].shader.material.color = {r:1,g:0,b:0};
			console.log("collision pied vert");
		}
		if(tabPiedsJaunes[i].scene.ok && this.verifCollisionObjet(tabPiedsJaunes[i].scene.position)){
			//tabPiedsJaunes[i].scene.visible=false;
			tabPiedsJaunes[i].scene.ok=false;
			tabPiedsJaunes[i].dae.effects["Material-effect"].shader.material.color = {r:1,g:0,b:0};
			console.log("collision pied jaune");
		}
	}
}


function verifCollisionObjet(pos){

	var vectTangents = [{x: this.points[1].x-this.points[0].x, z: this.points[1].z-this.points[0].z},
	{x: this.points[3].x-this.points[0].x, z: this.points[3].z-this.points[0].z},
	{x: this.points[1].x-this.points[2].x, z: this.points[1].z-this.points[2].z},
	{x: this.points[3].x-this.points[2].x, z: this.points[3].z-this.points[2].z}]
	
	var origines = [ getVecteur(this.points[0],pos),getVecteur(this.points[0],pos),getVecteur(this.points[2],pos),getVecteur(this.points[2],pos)]
	var collision = true;
	for(var i=0;i<4;i++){
		if(angle(vectTangents[i],origines[i])>90)
			collision = false;
	}

	return collision;
}

function dist(a,b){
	return Math.sqrt(Math.pow((a.x-b.x),2)+Math.pow((a.z-b.z),2));
}

function angle(u,v){
	var a = Math.acos(prodScal(u,v)/(dist({x:0,z:0},u)*dist({x:0,z:0},v)))*180/Math.PI;
	//console.log("angle : ",a);
	return a;
}

function prodScal(u,v){
	return (u.x*v.x + v.z*u.z);
}
function getVecteur(p1,p2){
	return {x: p2.x-p1.x, z: p2.z-p1.z};
}

function prendreObjet(objet){

	//quand on robot tient un objet on l'affiche au-dessus
	var objScene;
	var decalage;	 //quand l'objet est cree avec threejs son centre est au milieu
	if(objet.scene){	 	 	 	 //si objet charge avec collada
		objScene = objet.scene;
		decalage = 0;
	}else{ 		 	 	 	 	 //si simple objet
		objScene = objet;
		decalage = objet.hauteur/2;
	}
	//console.log("objet  :",objet);
	//console.log("objscene : ",objScene);

	if(objScene.ok && this.verifCibleAtteignable(objScene.position)){
		this.objetsTenus.push(objet);
		objScene.ok = false;
		scene.remove(objScene);
		this.add(objScene);
		objScene.position.set(0,this.objetsTenus.dessus+decalage,0);//this.hauteur + this.objetsTenus.dessus,0);
		this.objetsTenus.dessus += objScene.hauteur + 0.01;
		this.objetsTenus.nombre++;
		return true;
	}else{
		console.log("CIBLE NON ATTEIGNABLE !!!!!");
	}
	return false;
	
}

function verifCibleAtteignable(pos){
	this.updatePoints();
	var LIMITE = 0.4;
	var a;
	var d = dist(this.points[0],pos)+dist(this.points[1],pos);
	if(d<LIMITE){
		if(angle(getVecteur(this.points[0],this.points[1]),getVecteur(this.points[0],pos))>=0)
			return true;
	}
	return false;
}



function verifCollisionRobots(){
	var col = false;
	for(var i=0;i<4;i++){
		if(tabRobots[i].nom !== this.nom && this.verifCollisionRobot(tabRobots[i])){
			col = true;
		}
	}
	return col;
}


function verifCollisionRobot(robot){
	//on verifie que les 6 points de robot ne sont pas dans le robot this
	var collision = false;
	for(var i=0;i<6 && !collision;i++){
		if(this.verifCollisionObjet(robot.points[i])){
			collision = true;
		}
	}
	return collision;
}

function echangerPoints(tab,a,b){
	var xa = tab[a].x;
	var za = tab[a].z;
	tab[a].x = tab[b].x;
	tab[a].z = tab[b].z;
	tab[b].x = xa;
	tab[b].z = za;
}



function deposerObjet(num){
	if(num>=0 && num<this.objetsTenus.nombre){

		console.log("this.objetsTenus : ",this.objetsTenus);


		var objScene;
		var decalage;
		var objetDae = this.objetsTenus[num];
		if(this.objetsTenus[num].scene){	 	 	 	 //si objet charge avec collada
			objScene = this.objetsTenus[num].scene;
			decalage = 0;
		}		else{ 		 	 	 	 	 //si simple objet
			objScene = this.objetsTenus[num];
			decalage = objScene.hauteur/2;
		}
		
		var v1 = getVecteur(this.position,this.points[0]);
		var v2 = getVecteur(this.position,this.points[1]);
		var cible = {x:this.position.x+v1.x+v2.x,y:0.01+decalage,z : this.position.z+v1.z+v2.z};

		if(verifPoint(cible)){
			this.remove(objScene);

			for(var i=num;i<this.objetsTenus.nombre;i++){
				if(this.objetsTenus[i].scene)
					this.objetsTenus[i].scene.position.y -= objScene.hauteur;    // ATTENTION à ce qui est dans le tableau this.objtenus ? 
				else
					this.objetsTenus[i].position.y -= objScene.hauteur; 
			}
			this.objetsTenus.dessus -= objScene.hauteur;


			console.log("objet depose : ",objScene);

			//quand un objet est depose par un robot
			//on change sa couleur pour indiquer qu'il n'est 
			//plus a sa place initiale

			if(objScene.type==="gobelet")
			{
				objetDae.dae.effects["Material_002-effect"].shader.material.opacity = 0.8;
				objetDae.dae.effects["Material_002-effect"].shader.material.color = {r:1,g:0.5,b:0}; 
			}else if(objScene.type==="piedvert")
			{
				console.log("piedvert",objetDae);
				objetDae.dae.effects["vertPied-effect"].shader.material.color = {r:0,g:0.2,b:0};
			}else if(objScene.type==="piedjaune")
			{
				console.log("piedjaune",objetDae);
				objetDae.dae.effects["Material-effect"].shader.material.color = {r:0.2,g:0.2,b:0};
			}



			scene.add(objScene);
			objScene.position.set(cible.x,cible.y,cible.z);
			this.objetsTenus.splice(num,1);
			this.objetsTenus.nombre--;


		}
		console.log("this.objetsTenus : ",this.objetsTenus);
	}
}


function prendrePopcorn(distri){
	if(distri.tailleReservoir>0 && this.verifCibleAtteignable({x:distri.x,z:distri.z})){
		var pop = distri.vider();
		this.prendreObjet(pop);
		return true;
	}else
		return false;
}

function fermerClapet(clapet){
	if(clapet.etat==="ouvert" && this.verifCibleAtteignable(clapet.position)){
		console.log("Fermeutre clapet");
		clapet.enFermeture = true;
		fermeture = true;
		return true;
	}
	return false;
}





function deroulerTapis(){
	if(!this.tapisDeroule){
		if(this.cote==="gauche")
		{
			if(this.verifCibleAtteignable({x: -0.2665,z:-0.420})){
				plateau.dae.effects["gris_004-effect"].shader.material.color = {r:1,g:0,b:0}; 
				this.tapisDeroule = true;
				this.position.z -= 0.540;
				this.position.x = -0.2265;
				this.position.y +=  0.088;
			}
		}else
		{
			if(this.verifCibleAtteignable({x: 0.2665, z: -0.420})){
				plateau.dae.effects["gris_003-effect"].shader.material.color = {r:1,g:0,b:0}; 
				this.tapisDeroule = true;
				this.position.z -= 0.540;
				this.position.x = 0.2265;
				this.position.y += 0.088;
			}
		}
	}
}




/*
function combinerPopcornGobelet(gob)
{
	for(var i=0;i<this.objtenus.nombre;i++)
	{
		if(this.objtenus[i])
	}
}*/