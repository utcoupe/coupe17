# ia&#x2F;data

Data Module



* * *

## Class: Data
Data Constructor

**balle**:  , balle
**chargeur**:  , chargeur
**clap**:  , clap
**plot**:  , plot
**erobot**:  , erobot
**gobelet**:  , gobelet
**pile**:  , pile
**dynamic**:  , dynamic
**depot**:  , depot
**nb_erobots**:  , nb_erobot
**dots**:  , dots
### ia&#x2F;data.Data.importObjects() 

Import the Objects


### ia&#x2F;data.Data.getObjectRef(name) 

Return Object Reference

**Parameters**

**name**: `string`, Return Object Reference


### ia&#x2F;data.Data.isCloser(dist1, dist2) 

Returns true if dist1 is smaller than dist2

**Parameters**

**dist1**: `int`, Returns true if dist1 is smaller than dist2

**dist2**: `int`, Returns true if dist1 is smaller than dist2


### ia&#x2F;data.Data.getDistance(pos1, pos2) 

Return the distance between two positions

**Parameters**

**pos1**: `Object`, Return the distance between two positions

 - **pos1.x**: `int`, Return the distance between two positions

 - **pos1.y**: `int`, Return the distance between two positions

**pos2**: `Object`, Return the distance between two positions

 - **pos2.x**: `int`, Return the distance between two positions

 - **pos2.y**: `int`, Return the distance between two positions


### ia&#x2F;data.Data.theEnnemyWentThere(pos, e_robot_id) 

Takes a position and the ennemy robot # to put everything in its surroundings (~ 1.1 * radius) as "lost"

**Parameters**

**pos**: `Object`, Takes a position and the ennemy robot # to put everything in its surroundings (~ 1.1 * radius) as "lost"

**e_robot_id**: `int`, Takes a position and the ennemy robot # to put everything in its surroundings (~ 1.1 * radius) as "lost"


### ia&#x2F;data.Data.parseOrder(from, name, param) 

Parse Order

**Parameters**

**from**: `string`, Parse Order

**name**: `string`, Parse Order

**param**: `Object`, Parse Order




* * *










