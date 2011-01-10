var MAP_HOLDER =
{
	strName:"Map Holder",
	strDescription:"The holder of map data.",

	strTileKeySeperator : "_",

	objMapTiles:{},

	_arrQueuedMoveRequests : [],
	_booWaitingResponse : false,

	booUnrenderedUpdates : false,

	handleEvent_navigate:function(_intWhatDirection)
	{
		var _intCharX = CHARACTER.intXPos;
		var _intCharY = CHARACTER.intYPos;
		var _intCurrLocalMove = CHARACTER.intLocalMoves;
		var _intCurrValidatedMove = CHARACTER.intMoves;
		var _strTileKey = _intCharX + this.strTileKeySeperator + _intCharY;
		var _objCurrTile = this.objMapTiles[_strTileKey];

		var _objMoveData = this.localMoveValidator(_objCurrTile, _intWhatDirection, _intCharX, _intCharY)
		if (_objMoveData)
		{
			EM.trigger("localCharacterUpdate", {'x':_objMoveData['intNewX'], 'y':_objMoveData['intNewY'] ,'moves':_intCurrLocalMove});
			var _objMoveData = {"move": _intWhatDirection, "move_lock": (_intCurrLocalMove + 1)};
			this._arrQueuedMoveRequests[this._arrQueuedMoveRequests.length] = _objMoveData;
			//this.debug("Added: ", 1, this._arrQueuedMoveRequests[this._arrQueuedMoveRequests.length - 1]);
			CHARACTER.intLocalMoves++;
			CHARACTER.intDirection = _intWhatDirection;
			this._flushQueuedRequests();

			// If we're more than one move ahead, queue
			//if (_intCurrLocalMove > (_intCurrValidatedMove + 1))
			//{
			//	this.
			//}
		}
	},

	_flushQueuedRequests : function ()
	{
		if ((!this._booWaitingResponse) && (this._arrQueuedMoveRequests.length > 0))
		{
			SERVER_IO.makeRequest("avatar/funkmaster", "moves", this._arrQueuedMoveRequests, "SERVER_stateUpdate");
			this._arrQueuedMoveRequests = [];
			this._booWaitingResponse = true;
		}
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
		this._booWaitingResponse = false;
		this._flushQueuedRequests();
	},

	localMoveValidator : function (_objWhatTile, _intWhatDirection, _intCurrX, _intCurrY)
	{
		if ((_objWhatTile.shape & _intWhatDirection) == _intWhatDirection)
		{
			switch (_intWhatDirection)
			{
				case 1:
					_intCurrY--;
				break;
				case 2:
					_intCurrX++;
				break;
				case 4:
					_intCurrY++;
				break;
				case 8:
					_intCurrX--;
				break;
			}
			var _strTileKey = _intCurrX + this.strTileKeySeperator + _intCurrY;
			if (this.objMapTiles[_strTileKey])
			{
				//this.debug("MAP_HOLDER.localMoveValidator(), valid move.", 1)
				return {"intNewX":_intCurrX, "intNewY":_intCurrY};
			}
		}
		//this.debug("MAP_HOLDER.localMoveValidator(), INVALID move.", 3)
		return false;
	},

	_addTiles : function (_arrWhatTileData)
	{
		var count = 0;
		while(count < _arrWhatTileData.length)
		{
			var _objCurrTile = _arrWhatTileData[count];
			var _strTileKey = _objCurrTile['x'] + this.strTileKeySeperator + _objCurrTile['y'];

			this.objMapTiles[_strTileKey] = _objCurrTile;
			this.objMapTiles[_strTileKey].booUpdated = true;
			count++;
		}
	},

/*
	// Placeholder function
	localMoveValidator : function(_strWhatDirection)
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