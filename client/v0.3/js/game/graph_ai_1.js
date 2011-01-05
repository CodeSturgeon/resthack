var GRAPH_EXPLORER_1 =
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
		//alert(_objStartNode.id)
		var _intLowestDistance = null;
		var _intBestTargetIndex = null;
		var _arrBestPathsToTargets = [];
		var count = 0;
		while (count < this._arrTargetNodes.length)
		{
			var _objPathData = this._calculatePathLength(_objStartNode, this._arrTargetNodes[count])
			var _intTargetDistance = _objPathData['intDistance'];
			_arrBestPathsToTargets[count] = _objPathData['arrBestPath'];
			var _domCurrTile = document.getElementById("tileX_" + this._arrTargetNodes[count].x + "_Y_" + this._arrTargetNodes[count].y + "_ID");
			this._highlightTile(_domCurrTile, "red", "X", ("Distance: " + _intTargetDistance));
			if ((_intTargetDistance) && ((_intTargetDistance < _intLowestDistance) || (_intLowestDistance == null)))
			{
				_intLowestDistance = _intTargetDistance;
				_intBestTargetIndex = count;
			}
			count++;
		}
		//alert(_intBestTargetIndex)
		var _objBestTarget = this._arrTargetNodes[_intBestTargetIndex]
		var _arrBestPath = _arrBestPathsToTargets[_intBestTargetIndex]
		var _domCurrTile = document.getElementById("tileX_" + _objBestTarget.x + "_Y_" + _objBestTarget.y + "_ID");
		this._highlightTile(_domCurrTile, "green", "O", ("Distance: " + _intLowestDistance));
		var count = 0;
		while (count < _arrBestPath.length - 1)
		{
			var _domCurrTile = document.getElementById("tileX_" + _arrBestPath[count].x + "_Y_" + _arrBestPath[count].y + "_ID");
			this._highlightTile(_domCurrTile, "yellow", "P" + count, "Path tile: " + count);
			count++;
		}
	},

	_calculatePathLength : function (_objStartNode, _objTargetNode)
	{
		//this._markTilesPathCheckStatus();
		this._intCurrShortestPath = null;
		this._arrCurrShortestPath = [];
		this._objCurrTarget = _objTargetNode;
		this._setPathLength(_objStartNode, 0, [_objStartNode]);

		return {"intDistance": this._intCurrShortestPath, "arrBestPath": this._arrCurrShortestPath};
	},

	/*
	_markTilesPathCheckStatus : function ()
	{
		for (var _strCurrMapIndex in MAP_HOLDER.objMapTiles)
		{
			MAP_HOLDER.objMapTiles[_strCurrMapIndex].booPathCheck = false;
		}
	},
	*/

	_setPathLength : function (_objCurrTile, _intRecursionLevel, _arrVisitedTiles)
	{
		// Kill
		if ((_intRecursionLevel > this._intCurrShortestPath) && (this._intCurrShortestPath != null))
		{
			return;
		}
		var count = 0;
		_intRecursionLevel++;
		while (count < _objCurrTile.arrNeighbours.length)
		{
			var _objCurrNeighbour = _objCurrTile.arrNeighbours[count];
			// If its a real tile and its not been inspected
			if ((_objCurrNeighbour) && (!this._isVisitedByArray(_objCurrNeighbour, _arrVisitedTiles)))
			{
				_arrCurrVisitedTiles = _arrVisitedTiles.slice(0);
				_arrCurrVisitedTiles[_arrCurrVisitedTiles.length] = _objCurrNeighbour;

				// If we've found the target, stop here and compare recursion level
				// to shortest path length. There is no need to check the rest of
				// the neighbours as we've found the target already.
				if (_objCurrNeighbour === this._objCurrTarget)
				{
					if ((_intRecursionLevel < this._intCurrShortestPath) || ( this._intCurrShortestPath == null))
					{
						//alert("Target found...\n\n_intRecursionLevel: " + _intRecursionLevel + "\nthis._intCurrShortestPath: " + this._intCurrShortestPath);
						this._intCurrShortestPath = _intRecursionLevel;
						this._arrCurrShortestPath = _arrCurrVisitedTiles.slice(0);
						break;
						//alert("Target found...\n\n_intRecursionLevel: " + _intRecursionLevel + "\nthis._intCurrShortestPath: " + this._intCurrShortestPath);
					}
				}

				if (_objCurrNeighbour.arrNeighbours.length > 0)
				{
					this._setPathLength(_objCurrNeighbour, _intRecursionLevel, _arrCurrVisitedTiles)
				}
			}

			count++;
		}
	},

	_isVisitedByArray : function (_objWhatTile, _arrWhatVistiedTiles)
	{
		var count = 0;
		while (count < _arrWhatVistiedTiles.length)
		{
			if (_objWhatTile === _arrWhatVistiedTiles[count])
			{
				return true;
			}
			count++;
		}
		return false;
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