
var TaskManager = require("../TaskManager")
var Timer = require("../Timer")



/*
	taskManager is the TaskManager
	timer is the event handler object
	actionHandler is the action handler object
*/
var taskManager = new TaskManager()
var timer = new Timer()
var actionHandler = {
	execute: function(datas) {
		console.log("actionHandler: doing action.\n", datas)
		console.log("actionHandler: doing action. at time ", (new Date()).toISOString())
		console.log("\n")
	}
}

var example = {
	start: function() {
		taskManager.setTaskActionHandler(actionHandler)

		var futureTime = Date.now() + 10000
		var task = {
			"action": {
				"some": "actions"
			},
			"events": {
				"timer": {
					span: {
						from: "2014-07-10T00:00:00",
						to: futureTime
					},
					point: "2014-07-10T00:00:00",
					repeat: 2000,
					exclusive: {
						from: "2014-07-10T00:00:00",
						to: "2014-07-10T00:00:00.220"
					}
				}
			}
		}

		taskManager.addTask(task)
	}
}


/*
	mock something 
	you don't need this in your own code
*/
// mock the timer.executeAction() method for dispalying infos
var toISOString = function(mil) {
	var date = (new Date(mil)).toISOString()
	return date
}
var mock_timer_executeAction = function() {
	var originExecuteAction = timer.executeAction.bind(timer)
	timer.executeAction = function() {
		console.log("\nTimer info start")
		console.log("from", toISOString(timer.collection[0].span.from))
		console.log("to  ", toISOString(timer.collection[0].span.to))
		console.log("last", toISOString(timer.collection[0].last))
		console.log("clast", toISOString(timer.status.last))
		console.log("cCurr", toISOString(timer.status.current))
		console.log("end")
		originExecuteAction()
	}
}
mock_timer_executeAction()



timer.startTimer()
example.start()