


def bouger(mouvement):
	if mouvement=="home":
		moveAX12([150,150,150,150,150,150]);

	if mouvement=="applose_ouvert":
		moveAX12([150,225,225,150,225,225]);

	if mouvement=="applose_ferme":
		moveAX12([150,240,240,150,240,240]);

	if mouvement=="droit_bas_gauche_haut":
		moveAX12([180,225,195,120,225,195]);

	if mouvement=="gauche_bas_droit_bas":
		moveAX12([120,225,195,180,225,195]);


	if mouvement=="haut":
		moveAX12([240,240,150,60,240,150]);


	if mouvement=="horizontal_plat":
		moveAX12([240,150,150,60,150,150]);

	if mouvement=="position_basse" :
		moveAX12([240,240,150,60,240,150]);


	if mouvement=="devant" :
		moveAX12([150,240,150,150,240,150]);


	if mouvement =="vague1":
		moveAX12([240,150,130,60,150,170);

	if mouvement == "vague2":
		moveAX12([240,130,170,60,170,130]);

	if mouvement =="vague3":
		moveAX12([240,150,170,60,150,130]);

	if mouvement == "vague4":
		moveAX12([240,170,130,60,130,170]);




def moveAX12(angles):
	pass
	#angles = [150,150,150,150,150,150]


