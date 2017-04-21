IA des robots
=======

## Ordres de l'IA aux robots

### Ordres communs
- `collision` ou `stop` ?
- `send_message`
	- `name` : demande d'envoyer un message avec un certain nom à l'ia
- `asserv.`... :
	- ...`set_pos` : définir la position actuelle
		- `x`
		- `y`
		- `a` : angle en radians [-pi, pi], le zéro étant l'axe des x, sens direct (attention, l'axe y est vers le public)
	- ...`goxy` : aller à ce point, en ligne droite, tourner si nécessaire au avant de commencer
		- `x`
		- `y`
		- `direction` (`avant`, `arrière`, `osef`) : si le sens de déplacement importe
	- ...`goa` : tourner le robot pour prendre cet angle
- `do_start_sequence` : demande de fermer et ouvrir tous les actionneurs avant le départ

### vers PR
- `take_module`
	- différence entre fusée et module seul ?
- `drop_module`
	- `color` (`yellow`, `blue`, `null`) : tourner le module avant de le poser (`null` : on ne le tourne pas)
	- `pushTowards` (`left`, `right`, `don't`) : pousser le module une fois posé

### vers GR
- `funny_action`
- `swallow_balls`
	- est-ce qu'on aspire pas les balles en permanence ?
- `throw_balls`
	- `duration` : temps en ms d'allumage des moteur
	- `speed` : vitesse du canon (unité à définir)


## Ancienne architecture
Structure interne de l'IA :
![alt tag](https://raw.githubusercontent.com/utcoupe/coupe15/master/ia/architecture_ia_utcoupe_2015.jpg)