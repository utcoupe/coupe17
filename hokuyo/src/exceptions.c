#include "exceptions.h"
#include "global.h"
#include "fast_math.h"
#include "analyzer.h"

int ignore(struct coord p){
	if( (p.x > LX - MIN_DIST_TO_EDGE || p.x < MIN_DIST_TO_EDGE)
	|| (p.y > LY - MIN_DIST_TO_EDGE || p.y < MIN_DIST_TO_EDGE)
	// ADD OTHER EXCEPTIONS HERE //
	)return 1;
	else return 0;
}

int group_exception(struct points_group g){
	//LISTE D'EXEPTIONS
	if( (g.size < POINTS_MIN)  //si le groupe ne contiens pas au moins POINTS_MIN alors il n'est pas valide
	// ADD OTHER EXCEPTIONS HERE //
	) return 1;
	else return 0;
}
