var TURN_LEFT_EXPLORER =
{
	strObjID : "The turn left explorer",
	strObjDescription : "An objects that attempts to 'solve' the map by simply turning left whenever possible or when blocked.",

	getNextMove : function ()
	{
		var _intCurrDirection = CHARACTER.intDirection;

		var _objMoveTest = this._testMoveDirection(_intCurrDirection)

		//alert("_intCurrDirection: " + _intCurrDirection)

		// If we can, keep on moving in the current direction
		if (_objMoveTest)
		{
			return _intCurrDirection;
		}
		else
		{
			//return 4;
			var _newValue = _intCurrDirection >> 1
			if (_newValue < 1)
			{
				_newValue = 8;
			}
			//alert(_newValue)
			var _objMoveTest = this._testMoveDirection(_newValue)
			if (_objMoveTest)
			{
				return _intCurrDirection;
			}
			else
			{
				var _newValue = _newValue >> 1
				if (_newValue < 1)
				{
					_newValue = 8;
				}
				//alert(_newValue)
				var _objMoveTest = this._testMoveDirection(_newValue)
				if (_objMoveTest)
				{
					return _newValue;
				}
				else
				{
					var _newValue = _newValue >> 1
					if (_newValue < 1)
					{
						_newValue = 8;
					}
					//alert(_newValue)
					var _objMoveTest = this._testMoveDirection(_newValue)
					if (_objMoveTest)
					{
						return _newValue;
					}
					else
					{
						alert("I'm in a box?")
					}
				}
			}

			//alert("Base: " + _intCurrDirection + "\nNew: " + _newValue)
		}
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