var SCREEN_RENDERER =
{
	strName:"Screen renderer",
	strDescription:"The renderer the screen including: map data, players etc.",

	intTileWidth:16,
	intTileHeight:16,

	_objUpdateTimer : null,
	_intUpdateInterval : 50,

	_objObjectsToUpdateFrom : {},

	objDOM:null,

	objTileHTMLFragments:
	{
		// Renderer tiles
		"wrapperStart":"<div id='tileY_%1_X_%2_HolderID'>",
		"wrapperEnd":"</div>",

		// Charcter tile
		"character":"<div id='thePlayerID' style='top:%1px; left:%2px;' class='actor'>&nbsp;</div>",

		// Base tile
		"tile":"<div id='tileX_%1_Y_%2_ID' style='top:%3px; left:%4px;' onclick='EM.trigger(\"tileClicked\", this)' class='baseTile XXTILE_SHAPE_CLASSXX'>&nbsp;</div>",
	},


	_strMapOutputID : "mapOutputID",
	_strCharacterID : "thePlayerID",

	handleEvent_primeDOMLinks : function (_objWhatDOM)
	{
		this.objDOM = _objWhatDOM;
		this.domMapWrapper = this.objDOM.getElementById(this._strMapOutputID);
	},
	startUpdateTimer : function ()
	{
		if (this._objUpdateTimer == null)
		{
			this._objUpdateTimer = window.setInterval("SCREEN_RENDERER.updateScreen()", this._intUpdateInterval)
		}
	},

	stopTimer : function ()
	{
		if (this._objUpdateTimer != null)
		{
			window.clearInterval(this._objUpdateTimer);
		}
	},

	registerToUpdateFrom : function (_strUpdateKey, _objWhatInfoHolder, _strWhatPrimaryData)
	{
		this._objObjectsToUpdateFrom[_strUpdateKey] = {"obj":_objWhatInfoHolder, "data":_strWhatPrimaryData};
	},

	updateScreen : function ()
	{
		for (var _strCurrKey in this._objObjectsToUpdateFrom)
		{
			var _objCurrUpdateable = this._objObjectsToUpdateFrom[_strCurrKey]['obj'];
			if (_objCurrUpdateable.booUnrenderedUpdates)
			{
				this["update_" + _strCurrKey](this._objObjectsToUpdateFrom[_strCurrKey]);
				_objCurrUpdateable.booUnrenderedUpdates = false;
			}
		}
	},

	update_map : function (_objUpdateHolder)
	{
		var _objMap = _objUpdateHolder['obj'];
		var _objTileCollection = _objMap[_objUpdateHolder['data']];
		for (var _strCurrTileKey in _objTileCollection)
		{
			var _objCurrTile = _objTileCollection[_strCurrTileKey];
			if (_objCurrTile.booUpdated)
			{
				this._renderTile(_objCurrTile, _strCurrTileKey);
				_objCurrTile.booUpdated = false;
			}
		}
	},

	update_character : function (_objUpdateHolder)
	{
		if (!this.domCharacter)
		{
			var _htmCharacter = this._getCharacterHTML(_objUpdateHolder['obj']['intXPos'], _objUpdateHolder['obj']['intYPos']);
			this.domMapWrapper.innerHTML += _htmCharacter;
			this.domCharacter = this.objDOM.getElementById(this._strCharacterID);
		}
		else
		{
			this.domCharacter = this.objDOM.getElementById(this._strCharacterID);
			this.domCharacter.style.left = (parseInt(_objUpdateHolder['obj']['intXPos']) * this.intTileHeight) + "px";
			this.domCharacter.style.top = (parseInt(_objUpdateHolder['obj']['intYPos']) * this.intTileHeight) + "px";
		}
		this.domCharacter.scrollIntoView(true);
	},

	_renderTile : function (_objWhatTile, _strWhatTileKey)
	{
		this.domMapWrapper.innerHTML += this._createBaseTileHTML(_objWhatTile);
	},

	_createBaseTileHTML:function(_objWhatMapTile)
	{
		var _htmBaseHTML = this.objTileHTMLFragments['tile'];
		_htmBaseHTML = _htmBaseHTML.replace("%1", parseInt(_objWhatMapTile["x"]));
		_htmBaseHTML = _htmBaseHTML.replace("%2", parseInt(_objWhatMapTile["y"]));
		_htmBaseHTML = _htmBaseHTML.replace("%4", ((parseInt(_objWhatMapTile["x"]) * this.intTileHeight) + (0 * _objWhatMapTile["x"])));
		_htmBaseHTML = _htmBaseHTML.replace("%3", ((parseInt(_objWhatMapTile["y"]) * this.intTileHeight) + (0 * _objWhatMapTile["y"])));
		_htmBaseHTML = _htmBaseHTML.replace("XXTILE_SHAPE_CLASSXX", "tileShape" + parseInt(_objWhatMapTile["shape"]) + "C");
		return _htmBaseHTML;
	},

	_getCharacterHTML:function(_intWhatX, _intWhatY)
	{
		var _htmReturn = this.objTileHTMLFragments["character"];
		_htmReturn = _htmReturn.replace("%2", (parseInt(_intWhatX) * this.intTileHeight));
		_htmReturn = _htmReturn.replace("%1", (parseInt(_intWhatY) * this.intTileHeight));
		//alert("_htmReturn: " + _htmReturn)
		return _htmReturn;
	},

/*
	_renderMapTiles:function(_arrWhatTiles)
	{
		this.debug("SCREEN_RENDERER.renderMapTiles()",1);
		if (!_arrWhatTiles)
		{
			this._renderAllTiles();
		}
		else
		{
			this._renderUpdatedBaseTiles(_arrWhatTiles);
		}
	},

	_renderCharacter:function(_objNewCoords)
	{
		var _objCurrTile = MAP_HOLDER.arrMapTiles[CHARACTER.intXPos][CHARACTER.intYPos];
		var _objNewTile = MAP_HOLDER.arrMapTiles[_objNewCoords["x"]][_objNewCoords["y"]];
		var _arrChangedTiles = [_objCurrTile, _objNewTile];
		CHARACTER.intXPos = _objNewCoords["x"];
		CHARACTER.intYPos = _objNewCoords["y"];

		this._renderUpdatedBaseTiles(_arrChangedTiles)
	},

	_renderAllTiles:function ()
	{
		//alert("_renderAllTiles")
		var _htmOutputHTML = "";
		//var intXCount = parseInt(MAP_HOLDER.intMapXStart);

		this.debug("MAP_HOLDER.intMapXEnd:" + MAP_HOLDER.intMapXEnd + "\nMAP_HOLDER.intMapYEnd" + MAP_HOLDER.intMapYEnd,1);
		var count = 0;
		while (count < MAP_HOLDER.arrMapTiles.length)
		{
			var _arrCurrRange = MAP_HOLDER.arrMapTiles[count];
			var iCount = 0;
			while (iCount < _arrCurrRange.length)
			{
				var _strTileHTML = this.objTileHTMLFragments["wrapperStart"] + "\n";
				_strTileHTML = _strTileHTML.replace("%2", count);
				_strTileHTML = _strTileHTML.replace("%1", iCount);

				_strTileHTML += this._getHTMLForCoords(iCount, count);

				_strTileHTML += this.objTileHTMLFragments["wrapperEnd"] + "\n";
				_htmOutputHTML += _strTileHTML + "\n";
				iCount++
			}
			count++;
		}
		//alert(_htmOutputHTML)
		this.objDOM.getElementById("mapOutputID").innerHTML = _htmOutputHTML;
	},

	_renderUpdatedBaseTiles:function(_arrWhatTiles)
	{
		var count = 0;
		while (count < _arrWhatTiles.length)
		{
			var _objCurrTile = _arrWhatTiles[count];
			var _strNewTileHTML = this._getHTMLForCoords(_objCurrTile["x"], _objCurrTile["y"]);
			var _strWrapperID = "tileY_%1_X_%2_HolderID".replace("%1", _objCurrTile["y"]).replace("%2", _objCurrTile["x"])
			var _objCurrTileHolder = this.objDOM.getElementById(_strWrapperID);
			_objCurrTileHolder.innerHTML = _strNewTileHTML;
			count++;
		}
	},

	_getHTMLForCoords:function(_intX, _intY)
	{
		var _objCurrTile = MAP_HOLDER.arrMapTiles[_intX][_intY];
		var _strTileHTML = "";

		// Add test for other objects on the same location here
		_strTileHTML += "\t" + this._createBaseTileHTML(_objCurrTile) + "\n";
		_strTileHTML += this._getExtraTileItems(_objCurrTile["x"], _objCurrTile["y"])

		return _strTileHTML;
	},

	// Checks through other collections to find anything at this tile address.
	_getExtraTileItems : function(_intWhatX, _intWhatY)
	{
		var _htmReturnString = "";
		_htmReturnString += this._getCharacterHTML(_intWhatX, _intWhatY)
		return _htmReturnString;
	},

	_getCharacterHTML:function(_intWhatX, _intWhatY)
	{
		//this.debug("SCREEN_RENDERER.renderCharacter()",1);
		if ((CHARACTER.intXPos == _intWhatX) && (CHARACTER.intYPos == _intWhatY))
		{
			var _htmReturn = this.objTileHTMLFragments["character"];
			_htmReturn = _htmReturn.replace("%2", (parseInt(_intWhatX) * this.intTileHeight));
			_htmReturn = _htmReturn.replace("%1", (parseInt(_intWhatY) * this.intTileHeight));
			//alert(_htmReturn)
			return _htmReturn;
		}
		return "";
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
EM.register(SCREEN_RENDERER)
TIMER_TRACKER.register(SCREEN_RENDERER, "stopTimer");