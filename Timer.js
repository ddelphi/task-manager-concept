
var eventSystem = require("./eventSystem")



/*
	Timer class
	an example of the event handler object for the TaskManager.
*/
var Timer = function() {
	this.init()
}
Timer.prototype = {
	init: function() {
		this.options = {
			"interval": 2000,
			"timePattern": /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?/
		}
		this.status = {
			"current": 0,
			"last": 0
		}
		this.collection = []
		this.intervalId = 0
		this.timeZoneOffset = null

		this.updateTimeStatus()
		this.initEvents()
	},
	initEvents: function() {
		eventSystem.register("task/event/timer", this.execute.bind(this))
	},

	/**/
	
	startTimer: function() {
		this.stopTimer()
		this.intervalId = setInterval(this.timeAction.bind(this), this.options.interval)
	},
	stopTimer: function() {
		clearInterval(this.intervalId)
	},
	updateTimeStatus: function() {
		var now = Date.now()
		this.status.last = this.status.current || now
		this.status.current = now
	},
	timeAction: function() {
		this.updateTimeStatus()
		this.executeAction()
	},

	/**/
	
	constructInfo: function(timeInfo, actionInfo) {
		this.insertActionInfo(timeInfo, actionInfo)
		this.absoluteTimeInfo(timeInfo)
		this.buildLastKey(timeInfo)
	},
	insertActionInfo: function(timeInfo, actionInfo) {
		timeInfo["actionInfo"] = actionInfo
	},
	absoluteTimeInfo: function(timeInfo) {
		var self = this,
			mil
		helper.each(true, timeInfo, function(k, v, obj) {
			if (self.checkTimeFormat(v)) {
				mil = self.absoluteTime(v)
				obj[k] = mil
			}
		})
	},
	getTimezoneOffset: function() {
		if (!this.timezoneOffset) {
			this.timezoneOffset = (new Date()).getTimezoneOffset() * 60000
		}
		return this.timezoneOffset
	},
	absoluteTime: function(timeString) {
		var timezoneOffset = this.getTimezoneOffset()
		var mil = Date.parse(timeString) + timezoneOffset

		return mil > 0 ? mil : false
	},
	checkTimeFormat: function(timeString) {
		var pattern = this.options.timePattern
		return pattern.test(timeString)
	},
	buildLastKey: function(timeInfo) {
		var last = this.getToLast(timeInfo, this.status.last)
		timeInfo.last = last
		// timeInfo.exLast = last
	},
	getToLast: function(timeInfo, lastPoint) {
		var start = timeInfo.point,
			interval = timeInfo.repeat,
			last = timeInfo.last || start,
			cCurrent = this.status.current,
			cLast = lastPoint,
			times

		times = Math.floor((cLast - last) / interval)
		last = last + interval * times
		return last
	},

	/**/

	executeAction: function() {
		var timeInfos = this.collection
		var val
		for (var i = 0; i < timeInfos.length; i++) {
			val = timeInfos[i]
			if (this.canDoAction(val)) {
				this.doAction(val)
			}
		}
	},
	canDoAction: function(timeInfo) {
		if (this.inRange(timeInfo) && this.matchTime(timeInfo) && !this.matchExclusive(timeInfo)) {
			return true
		}
		return false
	},
	inRange: function(timeInfo) {
		var from = timeInfo.span.from,
			to = timeInfo.span.to,
			last = timeInfo.last,
			curr,
			interval = timeInfo.repeat

		curr = last + interval

		if (from < curr && curr < to) {
			return true
		}
		return false
	},
	matchTime: function(timeInfo) {
		var	last = timeInfo.last,
			curr,
			interval = timeInfo.repeat,
			cCurr = this.status.current,
			cLast = this.status.last

		curr = last + interval

		if (curr < cLast) {
			last = this.getToLast(timeInfo, cLast)
			curr = last + interval
		}
		if (cLast < curr && curr < cCurr) {
			last = this.getToLast(timeInfo, cCurr)
			timeInfo.last = last
			// timeInfo.exLast = cLast
			return true
		}
		return false
	},
	matchExclusive: function(timeInfo) {
		var last = timeInfo.last,
			// exLast = timeInfo.exLast,
			exFrom = timeInfo.exclusive.from,
			exTo = timeInfo.exclusive.to,
			interval = timeInfo.repeat,
			cLast = this.status.last

		for (var i = last; i > cLast; i -= interval) {
			if (i < exFrom || i > exTo) {
				return false
			}
		}
		return true
	},
	doAction: function(val) {
		console.log("Timer: do action.")
		eventSystem.trigger("task/action", val.actionInfo)
	},

	/**/

	checkTimeInfo: function(timeInfo) {
		// todo:
		//   check timeInfo format
		//   check timeInfo's time sequence
		return true
	},
	addTimeInfo: function(timeInfo) {
		var flag = this.checkTimeInfo(timeInfo)
		if (flag) {
			this.collection.push(timeInfo)
		}
	},
	execute: function(datas) {
		if (toString.call(datas).indexOf("Array") === -1) {
			datas = [datas]
		}
		var timeInfo,
			actionInfo
		for (var i = 0; i < datas.length; i++) {
			timeInfo = datas[i].data
			actionInfo = datas[i].info
			this.constructInfo(timeInfo, actionInfo)
			this.addTimeInfo(timeInfo)
		}
	}
}

/*
	helper object
	a deep iteration action for the object type
*/
var helper = {
	each: function loop(flag, obj, fn) {
		if (typeof flag !== "boolean"
			&& typeof flag !== "number") {
			obj = flag
			fn = obj
		}
		for (var k in obj) {
			if (!obj.hasOwnProperty(k)) continue
			if (toString.call(obj[k]).indexOf("Object") > 7) {
				if (typeof flag === "number" && flag > 0) {
					flag = flag - 1
				}
				else if (typeof flag === "boolean") {
					// noop
				}
				else {
					return
				}
				loop(flag, obj[k], fn)
			} else {
				fn(k, obj[k], obj)
			}
		}
	}
}

module.exports = Timer