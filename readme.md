# taskManager readme

## overview

This a sample code of task manager concept.


## usage

At first, you should know the structure of the script.

The only one main object is the taskManager object. It is the container and acting as the middle man in the whole script.

The process of the taskManager is:

	* receive the task data
	* dispatch the event's params which in the task data (as an event)
	* receive the event from other object, then trigger the action object with the action data

The flow chart graphic will be:

	|
	|                     +
	|                     |
	|                     | task data
	|                     |
	|                     v
	|                taskManager
	|                     +       trigger with
	|                     |       timer params
	|                     |+-------+         +----> timer(event object)
	|                     |                               +
	|                     |                               |
	|                     |                               |
	|                     |                               |
	|  action object <---+| <------+            +---------+
	|                     |          trigger event
	|                     |
	|                     v
	|

For the first step, to receive the task data, you can use the method below:

	taskManager.addTask( taskData )

The data structure of the taskData will be demonstrated after.

For the second step, the taskManager object will iterate each event params from the key `events` of the taskData, then from the event keyword "task/event/<the event name>" which will be dispatched, with the event params.

The event data dispatched by the taskManager object, has its own data structure:

```javascript

	// the data structure of the event data
	// take the timer event handler as an example
	
	eventData = {
		data: <the event params>,
		info: {
			uid: 2
		}
	}
	taskManager.trigger("task/event/timer", eventData)

```

The value of `data` will be the event params. And the value of `info` will be the action handler's params, which should be used in sending back to the taskManager object to execute the action.

For the third step, the event handler object receive the event and the event params, then process the params. When the event handler object meets the condition of the event params, it will trigger the event "task/action" with the action info data.

Finally, the taskManager object receive the event "task/action", then send the complete action info to the action handler object.

## data structure

The data structure of the task params should be:

```javascript
	
	// model version

	task_params = {
		"action": ...
		"events": ...
	}

	// for example

	var task_datatructure = {
		"action": [
			{
				"module": "infoGetter",
				"params": {
					// ...
				}
			}
		],
		"events": {
			"timer": {
				"interval": 300
			}
		}
	}
	
```

Because the action object and the event handler object are up to you, so the actual params data structure under the keys `action` and `events` are up to you.

## example code

There is an example code which will demonstrate the concept of the script:

```javascript

	var taskManager = new TaskManager()
	var action = new ActionObject()
	var timer = new Timer()
	
	var task = {
		"action": {
			// ...
		},
		"events": {
			"timer": {
				// ...
			}
		}
	}
	
	taskManager.setTaskActionHandler(action)
	taskManager.addTask(task)
	
	// timer object will get the params from taskManager object
	// when the timer meets the situation of the params
	// the timer object will trigger back to the taskManager object
	// then the taskManager object will trigger the action
	
```


