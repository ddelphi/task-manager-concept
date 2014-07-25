
var eventSystem = require("./eventSystem")


/*
	TaskManager class
	this is a container for the task params.
	it can dispatch the params to event handler objects by event,
	and then receive the trigger by the event handler objects,
	to perform the action
*/
var TaskManager = function() {
	this.init()
}
TaskManager.prototype = {
	init: function() {
		this.id = 0
		this.tasks = {}

		this.eventSystem = eventSystem

		this.taskActionHandler = null
		this.initEvents()
	},
	initEvents: function() {
		this.eventSystem.register("task/action", this.runTask.bind(this))
	},
	setEventSystem: function(eventSystem) {
		this.eventSystem = eventSystem
	},
	// task action handler object relate
	setTaskActionHandler: function(obj) {
		this.taskActionHandler = obj
	},
	getUid: function() {
		this.id = this.id + 1
		return this.id
	},
	getTask: function(uid) {
		return this.tasks[uid]
	},
	getTaskAction: function(uid) {
		return this.tasks[uid] ? this.tasks[uid].action : null
	},

	/* task methods */

	addTask: function(task) {
		var uid = this.getUid()
		this.constructTaskInfo(task, uid)
		this.addTask_(uid, task)
		this.taskPostAction(task)
		return uid
	},
	addTask_: function(uid, task) {
		this.tasks[uid] = task
	},
	removeTask: function(uid) {
		if (this.tasks.hasOwnProperty(uid)) {
			delete this.tasks[uid]
			return true
		}
		return false
	},
	runTask: function(uidDict) {
		var uid = uidDict.uid
		if (typeof this.taskActionHandler.execute === "function") {
			var taskAction = this.getTaskAction(uid)
			this.taskActionHandler.execute(taskAction)
			return true
		}
		return false
	},
		
	/**/
	
	constructTaskInfo: function(task, uid) {
		if (!task.info) {
			task.info = {}
		}
		task.info["uid"] = uid
	},
	
	/* task action methods */
	
	taskPostAction: function(task) {
		for (var evt in task.events) {
			if (!task.events.hasOwnProperty(evt)) return;
			var datas = this.constructEventDatas(evt, task)
			this.dispatchToEvent(evt, datas)
		}
	},
	constructEventDatas: function(eventName, task) {
		var res = {}
		res["data"] = task.events[eventName]
		res["info"] = task.info
		return res
	},
	dispatchToEvent: function(eventName, datas) {
		var e = "task/event/" + eventName
		this.eventSystem.trigger(e, datas)
	}
}



module.exports = TaskManager
