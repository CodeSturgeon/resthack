var MAP_HOLDER =
{
	strName:"Map Holder",
	strDescription:"The holder of map data.",

	_strTileKeySeperator : "_",

	objMapTiles:[],

	booUnrenderedUpdates : false,

	handleEvent_navigate:function(_intWhatDirection)
	{
		var _intCharX = CHARACTER.intXPos;
		var _intCharY = CHARACTER.intYPos;
		var _strTileKey = _intCharX + this._strTileKeySeperator + _intCharY;
		var _objCurrTile = this.objMapTiles[_strTileKey];

		if ((_objCurrTile.shape & _intWhatDirection) == _intWhatDirection)
		{
			//(_strResourcePath, _strRequestType, _objRequestParams, _strReturnEventCall)
			var _objMoveData = {"move": _intWhatDirection, "move_lock": (CHARACTER.intMoves + 1)};
			SERVER_IO.makeRequest("avatar/funkmaster", "moves", _objMoveData, "SERVER_stateUpdate");
		}
	},

	handleEvent_SERVER_navigateRequestResult:function(_objReturnInfo)
	{

	},

	handleEvent_SERVER_stateUpdate:function(_objWhatData)
	{
		//this.debug("Map data: ", 1, _objWhatData)
		if (_objWhatData['tiles'])
		{
			this._addTiles(_objWhatData['tiles']);
			//this._addShadeTiles();
			this.booUnrenderedUpdates = true;
		}
	},

	_addTiles : function (_arrWhatTileData)
	{
		var count = 0;
		while(count < _arrWhatTileData.length)
		{
			var _objCurrTile = _arrWhatTileData[count];
			var _strTileKey = _objCurrTile['x'] + this._strTileKeySeperator + _objCurrTile['y'];

			this.objMapTiles[_strTileKey] = _objCurrTile;
			this.objMapTiles[_strTileKey].booUpdated = true;
			count++;
		}
	},
/*
	// Placeholder function
	_localMoveValidator : function(_strWhatDirection)
	{
		var _intPlayerX = CHARACTER.intXPos;
		var _intPlayerY = CHARACTER.intYPos;
		switch (_strWhatDirection)
		{
			case "n":
				_intPlayerY--;
			break;
			case "s":
				_intPlayerY++;
			break;
			case "w":
				_intPlayerX--;
			break;
			case "e":
				_intPlayerX++;
			break;
		}

		if (this.arrMapTiles[_intPlayerX][_intPlayerY]["type"] != "solid")
		{
			MESSAGER.say(CHARACTER.strCharName + " has moved!");
			return true;
		}
		MESSAGER.say(CHARACTER.strCharName + " has hit head on wall, ouchies!");
		return false;
	},
*/
	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

EM.register(MAP_HOLDER)
SCREEN_RENDERER.registerToUpdateFrom("map", MAP_HOLDER, "objMapTiles");