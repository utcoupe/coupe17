

/* Converts :
 * #define VALUEA
 * #define VALUEB 'b'
 * #define VALUEC 42
 * In :
 * {
 *	VALUEA : null,
 *	VALUEB : "b",
 *	VALUEC : 42	
 * }
 */



module.exports = (function(){
	var logger = require('log4js').getLogger('DefineParser');
	var fs = require('fs');

	var reg = /#define[ \t]+(\S+)[ \t]+(\S+)/g;


	return function parse(file){
		var parsed = {};
		fs.readFile(file, 'utf8', function (err,data) {
			if(err) {
				logger.fatal("cant read file:\""+file+"\"");
				return ;
			}
			var nb = 0;
			while( findings = reg.exec(data) ) {
				try {
					parsed[findings[1]] = eval(findings[2]);
				} catch(e) {}
				// try to evaluate calculus...
				nb++;
			}
			logger.info("done parsing \""+file+"\" with "+nb+" defines");
			//should be quick enough
		});
		return parsed;
	}

})();