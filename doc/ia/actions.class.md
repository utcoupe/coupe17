# ia&#x2F;actions

Actions Module



* * *

## Class: Actions
Actions Constructor

**ia**:  , IA
**color**:  , Team color
**done**:  , done
**todo**:  , Tasks to do
**inprogress**:  , Tasks in progress
**killed**:  , killed
**valid_id_do_action**:  , Valid id do action
### ia&#x2F;actions.Actions.convertA(a) 

Convert Angle

**Parameters**

**a**: `int`, Angle


### ia&#x2F;actions.Actions.collision() 

Collision


### ia&#x2F;actions.Actions.importActions(data) 

Import Actions from data

**Parameters**

**data**: `Object`, Import Actions from data


### ia&#x2F;actions.Actions.parseOrder(from, name, params) 

Parse Order

**Parameters**

**from**: `string`, Sender

**name**: `string`, Name of the action

**params**: `Object`, Parameters of the action


### ia&#x2F;actions.Actions.kill(action_name) 

Kill an action

**Parameters**

**action_name**: `string`, Kill an action


### ia&#x2F;actions.Actions.exists(action_name) 

Return true if the action exists

**Parameters**

**action_name**: `string`, Return true if the action exists


### ia&#x2F;actions.Actions.isDone(action_name) 

Return true if the action is done

**Parameters**

**action_name**: `string`, Return true if the action is done


### ia&#x2F;actions.Actions.norm2Points(A) 

Return the distance between two points

**Parameters**

**A**: `Object`, Return the distance between two points

 - **A.x**: `int`, Return the distance between two points

 - **A.y**: `int`, Return the distance between two points

 - **B.x**: `Object`, Return the distance between two points

 - **B.y**: `object`, Return the distance between two points


### ia&#x2F;actions.Actions.getNormAction(pos, an) 

Return the distance between a position and the position of the current action

**Parameters**

**pos**: `Object`, Return the distance between a position and the position of the current action

 - **pos.x**: `int`, Return the distance between a position and the position of the current action

 - **pos.y**: `int`, Return the distance between a position and the position of the current action

**an**: `string`, Action name


### ia&#x2F;actions.Actions.getPriorityAction(an) 

Get priority Action

**Parameters**

**an**: `string`, Action name


### ia&#x2F;actions.Actions.isDoable(action) 

Return true id is doable

**Parameters**

**action**: `Object`, Return true id is doable


### ia&#x2F;actions.Actions.doNextAction(callback) 

Do next Action

**Parameters**

**callback**: , Do next Action


### ia&#x2F;actions.Actions.getNearestStartpoint(pos, startpoints) 

Return nearest Startpoint

**Parameters**

**pos**: `Object`, Return nearest Startpoint

 - **pos.x**: `int`, Return nearest Startpoint

 - **pos.y**: `int`, Return nearest Startpoint

**startpoints**: `Object`, Return nearest Startpoint


### ia&#x2F;actions.Actions.pathDoAction(callback, actions, id) 

Find the path to the action

**Parameters**

**callback**: , Find the path to the action

**actions**: `Object`, Find the path to the action

**id**: `int`, Find the path to the action


### ia&#x2F;actions.Actions.doAction(callback, action, startpoint, id) 

Do Action

**Parameters**

**callback**: , Do Action

**action**: `Object`, Do Action

**startpoint**: `Object`, Do Action

 - **startpoint.x**: `int`, Do Action

 - **startpoint.y**: `int`, Do Action

**id**: `int`, Do Action


### ia&#x2F;actions.Actions.actionFinished() 

Action Finished




* * *










