var TIMER_TRACKER =
{
	strName : "Timer Tracker",
	strDescription : "Tracks all objects that instatiate window.setInterval or window.setTimeout and calls a cleanup function on page unload",

	_arrTimerObjects : [],

	register : function (_objWhatObject, _strWhatCleanupMethod)
	{
		this._arrTimerObjects[this._arrTimerObjects.length] = {"obj":_objWhatObject, "method": _strWhatCleanupMethod};
	},

	cleanUp : function ()
	{
		var count = 0;
		while (count < this._arrTimerObjects.length)
		{
			var _objCurrCleaningInfo = this._arrTimerObjects[count];
			var _objToClean = _objCurrCleaningInfo['obj'];
			var _strMethodToCleanWith = _objCurrCleaningInfo['method'];

			_objToClean[_strMethodToCleanWith]();
			count++;
		}
	}
}