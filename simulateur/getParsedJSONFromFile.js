/**
 * @file Défini une fonction qui télécharge via AJAX le fichier JSON, puis retourne son contenu converti en objet.
 * @author Mindstan
 */

/**
 * Télécharge via AJAX le fichier JSON demandé, puis appelle la fonction passée en paramètre avec son contenu converti en objet.
 * 
 * @param {String} fileName Nom du fichier distant
 * @param {Callback} callback Fonction appelée lorsque la requête a abouti
 * @returns {Object}
 */
function getParsedJSONFromFile(fileName, callback)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText));
        }
    };
    xmlhttp.open("GET", fileName, true);
    xmlhttp.send();
}