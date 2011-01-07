var GRAPH_EXPLORER_2 =
{
	strObjID : "A*",
	strObjDescription :	"An attempt at replicating the A* pathfinding algorithm",

	_arrTargetNodes : [],

	_intCurrShortestPath : null,
	_arrCurrShortestPath : [],
	_objCurrTarget : null,

	getNextMove : function ()
	{
		// Collect neighbours and identify potential target nodes
		this._updateNodesList();

		// See which potential target has the shortest distance from the orgin
		this._pickTarget();

		// Generate a movement list
	},

	_updateNodesList : function ()
	{
		this._arrTargetNodes = [];
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

	_pickTarget : function ()
	{
		var _objOrigin = MAP_HOLDER.objMapTiles[CHARACTER.intXPos + MAP_HOLDER.strTileKeySeperator + CHARACTER.intYPos];

		var _arrTargetOptimalLengths = this._getShortestPathsToTargets(_objOrigin);

		var count = 0;
		var _objCurrTarget = null;
		while (count < _arrTargetOptimalLengths.length)
		{
			var _intCurrTargetIndex = _arrTargetOptimalLengths[count]['intIndex'];
			var _intCurrTargetShortestPath = _arrTargetOptimalLengths[count]['intLength'];
			var _objCurrTarget = this._arrTargetNodes[_intCurrTargetIndex];

			var _objPathData = this._getShortestPath(_objOrigin, _objCurrTarget, _intCurrTargetShortestPath);

			if (_objPathData)
			{
				// If we're our optimal path is equal to the returned path, use this target.
				if (_objPathData['intPathLength'] == _intCurrTargetShortestPath)
				{
					break;
				}
				// If we're shorter/equal to the next targets minimum path length, use this target.
				if (_objPathData['intPathLength'] <= _arrTargetOptimalLengths[(count + 1)]['intLength'])
				{
					break;
				}
			}
			count++;
		}
		return {"objBestTarget":_objCurrTarget, "arrPathSequence":_objPathData['arrPathSequence']};

		/*
		var count = 0;
		var _strAlertString = "";
		while (count < _arrTargetOptimalLengths.length)
		{
			_strAlertString += "intLength: " + _arrTargetOptimalLengths[count]['intLength'] + " - intIndex: " + _arrTargetOptimalLengths[count]['intIndex'] + "\n";
			count++;
		}
		alert(_strAlertString)
		*/
	},

	_getShortestPathsToTargets : function (_objWhatOrigin)
	{
		var _arrTargetPathLengths = [];
		var count = 0;
		while (count < this._arrTargetNodes.length)
		{
			var _objCurrTarget = this._arrTargetNodes[count];
			_arrTargetPathLengths[count] = {"intLength":Math.abs(_objCurrTarget.x - _objWhatOrigin.x) + Math.abs(_objCurrTarget.y - _objWhatOrigin.y), "intIndex":count};
			var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
			this._highlightTile(_domCurrTile, "#ff0000", "T", "Potential Target, optimal distance: " + _arrTargetPathLengths[count]['intLength']);
			count++;
		}
		return _arrTargetPathLengths.sort(GRAPH_EXPLORER_2.sortPathArray);
	},

	sortPathArray : function (a, b)
	{
		if (a.intLength > b.intLength)
		{
			return 1;
		}
		if (a.intLength == b.intLength)
		{
			return 0;
		}
		return -1;
	},

	_getShortestPath : function (_objOrigin, _objTarget, _intBestPossiblePathLength)
	{

	},

	_highlightTile : function (_domWhatTile, _strWhatColor, _chaWhatCharacter, _strWhatTitle)
	{
		_domWhatTile.innerHTML = _chaWhatCharacter;
		_domWhatTile.style.border = "1px solid " + _strWhatColor;
		_domWhatTile.title = _strWhatTitle;
		_domWhatTile.style.zIndex = 10;
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}