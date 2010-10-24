MAP_HOLDER =
{
	strName:"Map Holder",
	strDescription:"The holder of map data.",

	arrMapTiles:[],

/*
	intMapWidth:null,
	intMapHeight:null,
	intMapXStart:null,
	intMapYStart:null,
	intMapXEnd:null,
	intMapYEnd:null,
*/
	booHasInfo:false,
	booHasTileData:false,



	handleEvent_navigate:function(_strWhatDirection)
	{
		this.debug("MAP_HOLDER.handleEvent_navigate(_strWhatDirection: '" + _strWhatDirection + "')",1);
		if (this._localMoveValidator(_strWhatDirection))
		{
			//var _objFakeMove = this._generateFakedMove(_strWhatDirection);
			EM.trigger("SERVER_navigateRequest", _objFakeMove);
		}
	},

	handleEvent_SERVER_navigateRequest:function(_objReturnInfo)
	{
		this.debug("MAP_HOLDER.handleEvent_SERVER_navigateRequest(_objReturnInfo:)",1,_objReturnInfo);
		var _objNewCoords = {"x":_objReturnInfo["x"],"y":_objReturnInfo["y"]};
		EM.trigger("updateScreen", {"Character":_objNewCoords});
	},
/*
	handleEvent_SERVER_mapInfo:function(_objMapInfo)
	{
		this.debug("MAP_HOLDER.handleEvent_SERVER_mapInfo(_objMapInfo: )",1, _objMapInfo);

		this.intMapXStart = parseInt(_objMapInfo["xmin"]);
		this.intMapYStart = parseInt(_objMapInfo["ymin"]);
		this.intMapXEnd = parseInt(_objMapInfo["xmax"]);
		this.intMapYEnd = parseInt(_objMapInfo["ymax"]);
		this.intMapWidth = parseInt(_objMapInfo["xmax"] - _objMapInfo["xmin"]);
		this.intMapHeight = parseInt(_objMapInfo["ymax"] - _objMapInfo["ymin"]);

		this.booHasInfo = true;
		if (this.booHasTileData == true)
		{
			EM.trigger("updateScreen");
		}
	},
*/

	handleEvent_SERVER_stateUpdate:function(_objWhatData)
	{
		//alert(3)
		this.debug("MAP_HOLDER.handleEvent_SERVER_mapAllTiles(_objWhatData: )",4, _objWhatData);
		//this.arrMapTiles = _arrMapTiles;
		//this.arrMapTiles = [];

		if (_objWhatData['tiles'])
		{
			var _arrMapTiles = _objWhatData['tiles'];

			var count = 0;

			while (count < _arrMapTiles.length)
			{
				var _objCurrTile = _arrMapTiles[count]
				if (!this.arrMapTiles[_objCurrTile["x"]])
				{
					this.arrMapTiles[_objCurrTile["x"]] = [];
				}
				this.arrMapTiles[_objCurrTile["x"]][_objCurrTile["y"]] = _objCurrTile;
				count++;
			}

			this.booHasTileData = true;
			//if (this.booHasInfo == true)
			//{
			EM.trigger("updateScreen");
			//}
		}
	},

	handleEvent_SERVER_mapChangedTiles:function(_arrMapTiles)
	{
		//this.updateTiles(_objMapTiles);
		var count = 0;
		while (count < _arrMapTiles.length)
		{
			var _objCurrTile = _arrMapTiles[count]
			this.arrMapTiles[_objCurrTile["x"]][_objCurrTile["y"]] = _objCurrTile;
			count++;
		}
		EM.trigger("updateScreen", {"MapTiles":_arrMapTiles});
	},
/*
	updateTiles:function(_objMapTiles)
	{
		for (var _strXPos in _objMapTiles)
		{
			var _objYCollection = _objMapTiles[_strXPos];
			for (var _strYPos in _objYCollection)
			{
				this.arrMapTiles[_strXPos][_strYPos] = _objYCollection[_strYPos];
			}
		}
	},
*/
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
/*
	_generateFakedMove:function(_strWhatDirection)
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
		var _objFakeMovementRequest =
		{
			'turns_taken': 1,
		  'current_turn_id': 123,
		  'current_turn_url': 'turns/123',
		  'x': _intPlayerX,
		  'y': _intPlayerY
		}
		this.debug("_objFakeMovementRequest",4,_objFakeMovementRequest)
		return _objFakeMovementRequest;
	},
*/

	// DEV Functions
	handleEvent_toggleTile:function(_objWhatTile)
	{
		//alert(_objWhatTile.id)
		var _arrIDSplit = _objWhatTile.id.split("_");
		var _intXPos = _arrIDSplit[3];
		var _intYPos = _arrIDSplit[1];
		var _objCurrTile = this.arrMapTiles[_intXPos][_intYPos];
		if (_objCurrTile.type == "solid")
		{
			_objCurrTile.type = "clear";
		}
		else
		{
			_objCurrTile.type = "solid";
		}
		//EM.trigger("updateScreen");
		EM.trigger("SERVER_mapChangedTiles", [_objCurrTile])
	},

	handleEvent_generateTileData:function()
	{
		var _strOutput = "[";
		var _arrTileStrings = [];

		var intXCount = parseInt(this.intMapXStart);
		while (intXCount <= this.intMapXEnd)
		{
			var intYCount = parseInt(this.intMapYStart);
			while (intYCount <= this.intMapYEnd)
			{
				var _objCurrTile = this.arrMapTiles[intXCount][intYCount];
				_arrTileStrings[_arrTileStrings.length] = this._buildTileAsObjectString(_objCurrTile);
				intYCount++;
			}
			intXCount++;
		}
		_strOutput += _arrTileStrings.join(",\n");
		_strOutput += "]";
		this.debug("Tile data:\n" + _strOutput, 4)
	},

	_buildTileAsObjectString:function(_objWhatTile)
	{
		var _strReturnText = "{'type':'%1', 'x':%2, 'y':%3}";
		_strReturnText = _strReturnText.replace("%1", _objWhatTile["type"])
		_strReturnText = _strReturnText.replace("%2", _objWhatTile["x"])
		_strReturnText = _strReturnText.replace("%3", _objWhatTile["y"])
		return _strReturnText;
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

EM.register(MAP_HOLDER)