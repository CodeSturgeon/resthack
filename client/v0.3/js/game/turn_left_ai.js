var TURN_LEFT_EXPLORER =
{
	strObjID : "The turn left explorer",
	strObjDescription : "An objects that attempts to 'solve' the map by simply turning left whenever possible or when blocked.",

	getNextMove : function ()
	{
		var _intCurrDirection = CHARACTER.intDirection;
		var _intReverseDirection = null;

		//MESSAGER.say("Trying to move left...", "redC");
		var _newValue = _intCurrDirection >> 1

		if (_newValue < 1)
		{
			_newValue = 8;
		}
		//MESSAGER.say("_newValue: " + _newValue + ", _intCurrDirection: " + _intCurrDirection, "greenC");
		//alert(_newValue)
		var _objMoveTest = this._testMoveDirection(_newValue)
		if (_objMoveTest)
		{
			//MESSAGER.say("New direction works, moving left!", "redC");
			return _newValue;
		}
		//MESSAGER.say("Trying to move ahead...", "greenC");
		var _objMoveTest = this._testMoveDirection(_intCurrDirection);
		if (_objMoveTest)
		{
			//MESSAGER.say("I can move ahead so I will.", "redC");
			return _intCurrDirection;
		}
		else
		{
			//MESSAGER.say("Trying to move in a different direction", "greenC");
			var _newValue = _newValue >> 1;
			if (_newValue < 1)
			{
				_newValue = 8;
			}
			//MESSAGER.say("_newValue: " + _newValue + ", _intCurrDirection: " + _intCurrDirection, "greenC");
			//alert(_newValue)
			var _objMoveTest = this._testMoveDirection(_newValue);
			// This direction is behind us, its backtracking and thus the least preferable solution.
			if (_objMoveTest)
			{
				_intReverseDirection = _newValue;
			}

			var _newValue = _newValue >> 1;
			if (_newValue < 1)
			{
				_newValue = 8;
			}
			//MESSAGER.say("_newValue: " + _newValue + ", _intCurrDirection: " + _intCurrDirection, "greenC");
			//alert(_newValue)
			var _objMoveTest = this._testMoveDirection(_newValue);
			if (_objMoveTest)
			{
				return _newValue;
			}

			if (_intReverseDirection)
			{
				//MESSAGER.say("Reversing!", "redC");
				return _intReverseDirection;
			}
			else
			{
				alert("I'm in a box?!?")
			}


		}

			//alert("Base: " + _intCurrDirection + "\nNew: " + _newValue)
		//}
	},

	_testMoveDirection : function (_intWhatDirection)
	{
		var _intCharX = CHARACTER.intXPos;
		var _intCharY = CHARACTER.intYPos;
		var _strTileKey = _intCharX + MAP_HOLDER.strTileKeySeperator + _intCharY;
		var _objCurrTile = MAP_HOLDER.objMapTiles[_strTileKey];
		var _objMoveTest = MAP_HOLDER.localMoveValidator(_objCurrTile, _intWhatDirection, _intCharX, _intCharY);
		return _objMoveTest;
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}