MAP_HOLDER =
{
	strName:"Map Holder",
	strDescription:"The holder of map data.",

	arrMapTiles:[],

	intMapWidth:null,
	intMapHeight:null,
	intMapXStart:null,
	intMapYStart:null,
	intMapXEnd:null,
	intMapYEnd:null,

	booHasInfo:false,
	booHasTileData:false,


	getData:function ()
	{
		this.debug("MAP_HOLDER.getData()",1);
		SERVER_IO.send("SERVER_mapInfo", "GET","map");
		SERVER_IO.send("SERVER_mapAllTiles", "GET","map/all_tiles");
	},


	handleEvent_navigate:function(_strWhatDirection)
	{
		this.debug("MAP_HOLDER.handleEvent_navigate(_strWhatDirection: '" + _strWhatDirection + "')",1);
		if (this.localMoveValidator(_strWhatDirection))
		{
			var _objData = {move:_strWhatDirection};
			SERVER_IO.send("SERVER_navigateRequest", "POST","turn",_objData)
		}
	},

	handleEvent_SERVER_navigateRequest:function(_objReturnInfo)
	{
		this.debug("MAP_HOLDER.handleEvent_SERVER_navigateRequest(_objReturnInfo:)",1,_objReturnInfo);
		var _objNewCoords = {"x":_objReturnInfo["x"],"y":_objReturnInfo["y"]}
		EM.trigger("updateScreen", {"Character":_objNewCoords});
	},

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

	handleEvent_SERVER_mapAllTiles:function(_arrMapTiles)
	{
		this.debug("MAP_HOLDER.handleEvent_SERVER_mapAllTiles(_arrMapTiles: )",1, _arrMapTiles);
		//this.arrMapTiles = _arrMapTiles;
		this.arrMapTiles = [];

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
		if (this.booHasInfo == true)
		{
			EM.trigger("updateScreen");
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

	// Placeholder function
	localMoveValidator : function(_strWhatDirection)
	{
		return true;
	},


	// DEV Function
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