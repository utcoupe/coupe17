Code source des robots d'UTCoupe 2017
=======

### Configurer l'environnement de développement

Installer tous les logiciels requis (compilation, installation, etc.) :
```
sudo apt install git build-essential python nodejs npm nodejs-legacy
```

Une fois dans le dossier, pour installer les dépendances JavaScript :
```
npm install
```

### Lancer le projet

Pour lancer le serveur de communication par websocket :
```
npm run utcoupe
```

Pour lancer un serveur statique pour héberger le webclient :
```
npm run serve
```

Ensuite, aller sur l'adresse affiché par cette dernière commande et le webclient devrait être lancé.

/!\ Vérifiez que le webclientarrive à se connecter au serveur dans l'onglet Réseau /!\ Si ce n'est pas le cas, l'adresse du serveur est sans doute erronée : modifier le fichier `config.js` à la racine du projet.
