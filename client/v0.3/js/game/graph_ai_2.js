var GRAPH_EXPLORER_2 =
{
	strObjID : "The graph explorer",
	strObjDescription :	"An object that attempts to 'solve' the map by determining the nearest piece of shadow through the use of graph theory.",

	_arrTargetNodes : [],

	_intCurrShortestPath : null,
	_arrCurrShortestPath : [],
	_objCurrTarget : null,

	getNextMove : function ()
	{
		//alert("Setting Links...");
		this._updateNodesList();

		//alert("Showing Targets...");
		//this._highlightTargetNodes();

		//alert("Picking Target...");
		this._pickTargetNode();
	},

	_updateNodesList : function ()
	{
		var _objTilesList = MAP_HOLDER.objMapTiles;
		for (var _strCurrKey in _objTilesList)
		{
			var _objCurrTile = _objTilesList[_strCurrKey];
			if (!_objCurrTile.booNodeLinksSet)
			{
				this._setNodeLinks(_objCurrTile);
			}
		}
	},

	_setNodeLinks : function (_objWhatTile)
	{
		_objWhatTile.booNodeLinksSet = true;
		var count = 1;
		while (count < 9)
		{
			if ((_objWhatTile.shape & count) == count)
			{
				var _objNeighbouringTile = this._getTileNeighbour(_objWhatTile, count);
				if (!_objWhatTile.arrNeighbours)
				{
					_objWhatTile.arrNeighbours = [];
				}
				_objWhatTile.arrNeighbours[_objWhatTile.arrNeighbours.length] = _objNeighbouringTile;

				// If there is a missing neighbour, we will need to revisit this tile later. It
				// should also be added to the targets list for exploring further.
				if (!_objNeighbouringTile)
				{
					//alert("Found one!")
					_objWhatTile.booNodeLinksSet = false;
					this._arrTargetNodes[this._arrTargetNodes.length] = _objWhatTile;
				}
			}
			count = count + count;
		}
	},

	_getTileNeighbour : function (_objWhatTile, _intWhatDirection)
	{
		var _intCurrY = _objWhatTile.y;
		var _intCurrX = _objWhatTile.x;

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
		var _objNeighbour = MAP_HOLDER.objMapTiles[_intCurrX + MAP_HOLDER.strTileKeySeperator + _intCurrY]
		if (_objNeighbour)
		{
			return _objNeighbour;
		}
		return false;
	},

	_highlightTargetNodes : function ()
	{
		var count = 0;
		//alert(this._arrTargetNodes.length)
		while (count < this._arrTargetNodes.length)
		{
			var _objCurrTile = this._arrTargetNodes[count];
			var _domCurrTile = document.getElementById("tileX_" + _objCurrTile.x + "_Y_" + _objCurrTile.y + "_ID");
			this._highlightTile(_domCurrTile, "red", "X");
			count++;

		}
	},



	_pickTargetNode : function ()
	{
		//alert(CHARACTER.intCurrX + MAP_HOLDER.strTileKeySeperator + CHARACTER.intCurrY)
		var _objStartNode = MAP_HOLDER.objMapTiles[CHARACTER.intXPos + MAP_HOLDER.strTileKeySeperator + CHARACTER.intYPos];

		var _arrOptimalDistances = this._getOptimalDistancesToTargets(_objStartNode);
		var _arrUnblockedPaths = this._testOptimalPaths(_objStartNode);


	},

	_getOptimalDistancesToTargets : function (_objStartNode)
	{
		var _arrOptimalDistances = [];
		var count = 0;
		while (count < this._arrTargetNodes.length)
		{
			var _objCurrTarget = this._arrTargetNodes[count];
			_intTotalDistance = Math.abs(_objCurrTarget.x - _objStartNode.x) + Math.abs(_objCurrTarget.y - _objStartNode.y);
			_arrOptimalDistances[count] = _intTotalDistance;
			count++;
		}
		return _arrOptimalDistances;
	},

	_testOptimalPaths : function ()
	{
		var _arrOptimalPaths = [];
		var count = 0;
		while (count < this._arrTargetNodes.length)
		{
			count++;
		}
		return _arrOptimalPaths;
	},

	_calculateOptimalPath : function (_objOrgin, _objTarget)
	{
		var _arrOptimalPathNodes = [];
		var _
	},

	_highlightTile : function (_domWhatTile, _strWhatColor, _chaWhatCharacter, _strWhatTitle)
	{
		_domWhatTile.innerHTML = _chaWhatCharacter;
		_domWhatTile.style.border = "1px solid " + _strWhatColor;
		_domWhatTile.title = _strWhatTitle;
		_domWhatTile.style.zIndex = 10;
	},

	_isJointTile : function (_objWhatTile)
	{
		var count = 0;
		while (count < this._arrJointTiles.length)
		{
			if (_objWhatTile.shape == this._arrJointTiles[count])
			{
				return true;
			}
			count++;
		}
		return false;
	},
/*
	_testMoveDirection : function (_intWhatDirection)
	{
		var _intCharX = CHARACTER.intXPos;
		var _intCharY = CHARACTER.intYPos;
		var _strTileKey = _intCharX + MAP_HOLDER.strTileKeySeperator + _intCharY;
		var _objCurrTile = MAP_HOLDER.objMapTiles[_strTileKey];
		var _objMoveTest = MAP_HOLDER.localMoveValidator(_objCurrTile, _intWhatDirection, _intCharX, _intCharY);
		return _objMoveTest;
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