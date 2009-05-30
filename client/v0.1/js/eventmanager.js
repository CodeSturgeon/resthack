/* simplified event manager, no longer need to register */
var EM =
{
	strName:"The event manager",
	_arrRegisteredObjects: [],

	register: function (_objWhatObject)
	{
		this._arrRegisteredObjects[this._arrRegisteredObjects.length] = _objWhatObject;
		this.debug("EM.register(_objWhatObject:)", 1, _objWhatObject);
	},

	trigger: function(_strEventName, _mixParam)
	{
		var _booBubbleUp = true;
		// Attempt to fire event on registered objects
		for (var i=0; i<this._arrRegisteredObjects.length; i++)
		{
			this.fireIfHandled(this._arrRegisteredObjects[i], _strEventName, _mixParam);
		}
	},

	fireIfHandled: function(_obj, _strEventName, _mixParam)
	{
		if (_obj['handleEvent_'+_strEventName])
		{
			_obj['handleEvent_'+_strEventName](_mixParam);
		}
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}