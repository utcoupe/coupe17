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

var Simu = Simu || {};

Simu.afficherGR = function afficherGR(x,y,z,yrot,coul){
	var geo = new THREE.BoxGeometry(0.28,0.20,0.25);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    robot.rotation.y = yrot;
    Simu.scene.add(robot);
    Simu.GR = robot;
}



Simu.afficherPR = function afficherPR(x,y,z,yrot,coul){

	var geo = new THREE.BoxGeometry(0.14,0.35,0.22);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:'blue',side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    robot.rotation.y = yrot;
    Simu.scene.add(robot);
    Simu.PR = robot;
}

Simu.afficherGE = function afficherGE(x,y,z,coul){

	var geo = new THREE.CylinderGeometry( Simu.RAYON_ENNEMIS_GRANDS,Simu.RAYON_ENNEMIS_GRANDS,0.35,25);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    Simu.scene.add(robot);
    Simu.GE = robot;
}

Simu.afficherPE = function afficherPE(x,y,z,coul){

	var geo = new THREE.CylinderGeometry( Simu.RAYON_ENNEMIS_PETITS,Simu.RAYON_ENNEMIS_PETITS,0.35,25);
	var boxMat = [
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided}),
				new THREE.MeshLambertMaterial({color:coul,side:THREE.doubleSided})];
	var mat = new THREE.MeshFaceMaterial( boxMat );
    var robot = new THREE.Mesh(geo,mat);
    robot.position.set(x,y,z);
    
    Simu.scene.add(robot);
    Simu.PE = robot;
}

