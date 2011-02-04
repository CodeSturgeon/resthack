var GRAPH_EXPLORER_2 =
{
	strObjID : "A*",
	strObjDescription :	"An attempt at replicating the A* pathfinding algorithm",

	_arrTargetNodes : [],

	_intCurrShortestPath : null,
	_arrCurrShortestPath : [],
	_objCurrTarget : null,

	handleEvent_tileClicked : function (_domWhatTile)
	{
		// Collect neighbours and identify potential target nodes
		this._updateNodesList();

		var _objOriginTile = MAP_HOLDER.objMapTiles[CHARACTER.intXPos + MAP_HOLDER.strTileKeySeperator + CHARACTER.intYPos];

		var _arrIDSplit = _domWhatTile.id.split("_");
		var _objTargetTile = MAP_HOLDER.objMapTiles[_arrIDSplit[1] + MAP_HOLDER.strTileKeySeperator + _arrIDSplit[3]];

		//alert("_objOriginTile: " + _objOriginTile + "\n_objTargetTile: " + _objTargetTile)

		var _intTargetShortestPath = this._getDistance(_objOriginTile, _objTargetTile);

		var _objPathData = this._getPathData(_objOriginTile, _objTargetTile, _intTargetShortestPath);

	},

	getNextMove : function ()
	{
		// Collect neighbours and identify potential target nodes
		this._updateNodesList();

		// See which potential target has the shortest distance from the orgin
		var _objMoveData = this._pickTarget();

		if (_objMoveData)
		{
			var _objOrigin = _objMoveData['objOrigin'];
			var _objNextTile = _objMoveData['arrPathData'][0];

			// If the map hasn't updated, then we won't have a new tile to move into
			if (_objNextTile)
			{
				if (_objOrigin.y > _objNextTile.y)
				{
					return 1;
				}
				if (_objOrigin.y < _objNextTile.y)
				{
					return 4;
				}
				if (_objOrigin.x > _objNextTile.x)
				{
					return 8;
				}
				if (_objOrigin.x < _objNextTile.x)
				{
					return 2;
				}
			}
			//alert("Don't know how to move there?")
		}
		else
		{
			alert("Unable to find a reachable target...");
		}
	},

	_updateNodesList : function ()
	{
		this._arrTargetNodes = [];
		var _objTilesList = MAP_HOLDER.objMapTiles;
		for (var _strCurrKey in _objTilesList)
		{
			var _objCurrTile = _objTilesList[_strCurrKey];
			this._setNodeLinks(_objCurrTile);
			//if (!_objCurrTile.booNodeLinksSet)
			//{
			// this._setNodeLinks(_objCurrTile);
			//}
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

		var _arrTargetOptimalLengths = this._getDistanceToTargets(_objOrigin);
		var _arrValidPaths = [];

		var count = 0;
		var _objCurrTarget = null;
		var _objPathData = null;
		while (count < _arrTargetOptimalLengths.length)
		{
			var _intCurrTargetIndex = _arrTargetOptimalLengths[count]['intIndex'];
			var _intCurrTargetShortestPath = _arrTargetOptimalLengths[count]['intLength'];

			//if (_objCurrTarget)
			//{
			//	var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
			//	this._highlightTile(_domCurrTile, "#ffff00", "T", "Examined Target");
			//}
			var _objCurrTarget = this._arrTargetNodes[_intCurrTargetIndex];
			//var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
			//this._highlightTile(_domCurrTile, "#00ff00", "T", "Current Target");

			_objPathData = this._getPathData(_objOrigin, _objCurrTarget, _intCurrTargetShortestPath);

			if (_objPathData)
			{
				// If we're our optimal path is equal to the returned path, use this target.
				if (_objPathData['intPathLength'] == _intCurrTargetShortestPath)
				{
					//alert("Found shortest path")
					//var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
					//this._highlightTile(_domCurrTile, "#00ff00", "T", "Potential Target, distance: " + _objPathData['intPathLength']);
					break;
				}
				// If we're shorter/equal to the next targets minimum path length, use this target.
				if ((_arrTargetOptimalLengths[(count + 1)]) && (_objPathData['intPathLength'] <= _arrTargetOptimalLengths[(count + 1)]['intLength']))
				{
					//alert("Path ain't that short, but its shorter than the next one.");
					//var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
					//this._highlightTile(_domCurrTile, "#00ff00", "T", "Potential Target, distance: " + _objPathData['intPathLength']);
					break;
				}

				// Otherwise store the path for later, we might get a better one, if not we'll use the lowest we can find.
				_arrValidPaths.push({"objBestTarget":_objCurrTarget, "objOrigin":_objOrigin, "arrPathData":_objPathData['arrPathData']});
			}
			count++;
			//alert(count)
		}
		if (_objPathData)
		{
			return {"objBestTarget":_objCurrTarget, "objOrigin":_objOrigin, "arrPathData":_objPathData['arrPathData']};
		}
		else if (_arrValidPaths)
		{
			alert("Found a sub-optimal path...")
			var _domCurrTile = document.getElementById("tileX_" + _arrValidPaths[0][0].x + "_Y_" + _arrValidPaths[0][0].y + "_ID");
			this._highlightTile(_domCurrTile, "#00ff00", "T", "Next Tile");
			return _arrValidPaths[0];
		}
		else
		{
			return false;
		}
	},

	_getDistanceToTargets : function (_objWhatOrigin)
	{
		var _arrTargetPathLengths = [];
		var count = 0;
		while (count < this._arrTargetNodes.length)
		{
			var _objCurrTarget = this._arrTargetNodes[count];
			_arrTargetPathLengths[count] = {"intLength":this._getDistance(_objWhatOrigin, _objCurrTarget), "intIndex":count};
			//var _domCurrTile = document.getElementById("tileX_" + _objCurrTarget.x + "_Y_" + _objCurrTarget.y + "_ID");
			//this._highlightTile(_domCurrTile, "#ff0000", "T", "Potential Target, optimal distance: " + _arrTargetPathLengths[count]['intLength']);
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

	_getPathData : function(_objOrigin, _objTarget, _intBestPossiblePathLength)
	{
		//this._unhighlightAllTiles();

		//var _domCurrTile = document.getElementById("tileX_" + _objTarget.x + "_Y_" + _objTarget.y + "_ID");
		//this._highlightTile(_domCurrTile, "#ff0000", "T", "Current Target");

		//alert(1)

		var _objOpenNodes = new OpenNodeList(_objOrigin, _intBestPossiblePathLength);
		var _arrClosedNodes = [];
		var _objCurrNode = _objOrigin;
		var count = 0;
		var _intCurrRank = _intBestPossiblePathLength;
		while ((!this._isCurrentTarget(_objCurrNode, _objTarget)) && (count < 100000))
		{
			if (!_objCurrNode)
			{
				//alert("Nobody nodes...")
				return false;
			}

			//var _domCurrTile = document.getElementById("tileX_" + _objCurrNode.x + "_Y_" + _objCurrNode.y + "_ID");
			//var _strTitleText = "Set to current node, _intTotalCost: " + _objCurrNode.intTotalCost + ", _intGlobalDistance: " + _objCurrNode.intGlobalDistance
			//this._highlightTile(_domCurrTile, "#0000ff", "C", _strTitleText);

			_arrClosedNodes.push(_objCurrNode);
			var iCount = 0;
			while (iCount < _objCurrNode.arrNeighbours.length)
			{
				var _intTotalCost = _objCurrNode.intDistanceToOrigin + 1;
				var _objCurrNeighbour = _objCurrNode.arrNeighbours[iCount];

				if (_objCurrNeighbour)
				{
					if (this._isCurrentTarget(_objCurrNeighbour, _objTarget))
					{
						_objCurrNeighbour.objCurrParent = _objCurrNode;
						_arrPathData = this._createPath(_objOpenNodes, _objOrigin, _objTarget);

						return {"arrPathData":_arrPathData, "intPathLength":_arrPathData.length};
					}

					var _booIsInOpen = _objOpenNodes.containsNode(_objCurrNeighbour)

					// If neighbor is in _objOpenNodes and the current cost is less then remove that neighbour
					if ((_booIsInOpen) && (_intTotalCost < _objCurrNeighbour.intDistanceToOrigin))
					{
						_objOpenNodes.removeNode(_objCurrNeighbour, _objCurrNeighbour.intDistanceToOrigin, _objCurrNeighbour.intGlobalDistance);
						//var _domCurrTile = document.getElementById("tileX_" + _objCurrNeighbour.x + "_Y_" + _objCurrNeighbour.y + "_ID");
						//this._highlightTile(_domCurrTile, "#ffff00", "R", "Was removed from open, _intTotalCost: " + _objCurrNeighbour.intDistanceToOrigin + ", _intGlobalDistance: " + _objCurrNeighbour.intGlobalDistance);
						//alert("Removed, cost was too high...");
					}

					// If neighbor is in _arrClosedNodes and the current cost is less then remove that neighbour
					var _intClosedIndex = _arrClosedNodes.contains(_objCurrNeighbour);
					if ((_intClosedIndex !== null) && (_intTotalCost < _objCurrNeighbour.intDistanceToOrigin))
					{
						_arrClosedNodes.splice(_intClosedIndex, 1);
					}

					if ((!_booIsInOpen) && (_intClosedIndex === null))
					{
						var _intGlobalDistance = _intTotalCost + this._getDistance(_objCurrNeighbour, _objTarget);
						//alert("_intGlobalDistance: " + _intGlobalDistance + "\n_intTotalCost: " + _intTotalCost + "\n_objCurrNeighbour: " + _objCurrNeighbour)
						_objOpenNodes.insertNode(_objCurrNeighbour, _intTotalCost, _intGlobalDistance);

						if (_intGlobalDistance < _intCurrRank)
						{
							_intCurrRank = _intGlobalDistance;
						}

						_objCurrNeighbour.objCurrParent = _objCurrNode;
						//var _domCurrTile = document.getElementById("tileX_" + _objCurrNeighbour.x + "_Y_" + _objCurrNeighbour.y + "_ID");
						//var _strTitleText = "Was added to open, _intTotalCost: " + _intTotalCost + ", _intGlobalDistance: " + _intGlobalDistance
						//this._highlightTile(_domCurrTile, "#00ff00", "O", _strTitleText);
						//alert("Inserted, _strTitleText: " + _strTitleText);
					}
				}
				iCount++;
			}
			_objCurrNode = _objOpenNodes.getAndRemoveBestNode(0);
			count++;
		}
		//alert("Pathing analysis complete.")
		_arrPathData = this._createPath(_objOpenNodes, _objOrigin, _objTarget);

		return {"arrPathData":_arrPathData, "intPathLength":_arrPathData.length};
	},

	_isCurrentTarget : function(_objCurrTile, _objTargetTile)
	{
		if ((_objCurrTile.x != _objTargetTile.x) || (_objCurrTile.y != _objTargetTile.y))
		{
			return false;
		}
		//alert("Target reached...");
		return true;
	},

	_createPath : function (_objWhatNodeData, _objOrigin, _objTarget)
	{
		//this._unhighlightAllTiles();
		var _arrPath = [];
		var _objCurrNode = _objTarget;
		while (_objCurrNode !== _objOrigin)
		{
			//alert(_objCurrNode.x + " | " + _objCurrNode.y)
			//var _domCurrTile = document.getElementById("tileX_" + _objCurrNode.x + "_Y_" + _objCurrNode.y + "_ID");
			//this._highlightTile(_domCurrTile, "green", "P", "Path tile")
			_arrPath.push(_objCurrNode);
			if (_objCurrNode.objCurrParent)
			{
				_objCurrNode = _objCurrNode.objCurrParent;
			}
			else
			{
				//alert("No parent? _objCurrNode.objCurrParent: " + _objCurrNode.objCurrParent)
				break;
			}
		}
		return _arrPath.reverse();
	},

	_getDistance : function (_objWhatOrigin, _objWhatTarget)
	{
		return Math.abs(_objWhatTarget.x - _objWhatOrigin.x) + Math.abs(_objWhatTarget.y - _objWhatOrigin.y);
	},

	_unhighlightAllTiles : function ()
	{
		for (var _strCurrKey in MAP_HOLDER.objMapTiles)
		{
			var _objCurrTile = MAP_HOLDER.objMapTiles[_strCurrKey];
			//if ((!_objCurrTile) || (!_objCurrTile.x))
			//{
			//	alert("_strCurrKey: " + _strCurrKey)
			//}

			var _domCurrTile = document.getElementById("tileX_" + _objCurrTile.x + "_Y_" + _objCurrTile.y + "_ID");
			_domCurrTile.innerHTML = "";
			_domCurrTile.style.border = "0px solid red";
			_domCurrTile.title = "";
			_domCurrTile.style.zIndex = "auto";
		}
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

EM.register(GRAPH_EXPLORER_2)

function OpenNodeList(_objWhatOrigin, _intWhatTargetDistance)
{
	this.objOrigin = _objWhatOrigin;

	this.objOpenNodesByOriginDistance = {};
	this.objOpenNodesByGlobalDistance = {};
	this.arrReferencedNodes = [];

	this._intHighestPriority = 0;

	this.insertNode(this.objOrigin, 0, _intWhatTargetDistance);
}

OpenNodeList.prototype.insertNode = insertNode;
OpenNodeList.prototype.removeNode = removeNode;
OpenNodeList.prototype.getAndRemoveBestNode = getAndRemoveBestNode;
OpenNodeList.prototype.containsNode = containsNode;


function insertNode(_objWhatNode, _intDistanceToOrigin, _intGlobalDistance)
{
	_objWhatNode.intDistanceToOrigin = _intDistanceToOrigin;
	_objWhatNode.intGlobalDistance = _intGlobalDistance;

	// This shouldn't happen, but if we have it already, it needs re-catergorizing.
	if (this.containsNode(_objWhatNode))
	{
		this.removeNode(_objWhatNode, _objWhatNode.intDistanceToOrigin, _objWhatNode.intGlobalDistance);
	}

	this.arrReferencedNodes.push(_objWhatNode);

	if (!this.objOpenNodesByOriginDistance[_intDistanceToOrigin])
	{
		this.objOpenNodesByOriginDistance[_intDistanceToOrigin] = [];
	}
	this.objOpenNodesByOriginDistance[_intDistanceToOrigin].push(_objWhatNode);

	if (!this.objOpenNodesByGlobalDistance[_intGlobalDistance])
	{
		this.objOpenNodesByGlobalDistance[_intGlobalDistance] = [];
		if (_intGlobalDistance > this._intHighestPriority)
		{
			this._intHighestPriority = _intGlobalDistance;
		}
	}
	this.objOpenNodesByGlobalDistance[_intGlobalDistance].push(_objWhatNode);
}


function removeNode(_objWhatNode, _intDistanceToOrigin, _intGlobalDistance)
{
	var _intNodeIndex = this.arrReferencedNodes.contains(_objWhatNode);
	if (_intNodeIndex != null)
	{
		this.arrReferencedNodes.splice(_intNodeIndex, 1);
	}

	var _arrCurrNodeSet = this.objOpenNodesByOriginDistance[_intDistanceToOrigin];
	var _intNodeIndex = _arrCurrNodeSet.contains(_objWhatNode);
	if (_intNodeIndex != null)
	{
		_arrCurrNodeSet.splice(_intNodeIndex, 1);
	}

	var _arrCurrNodeSet = this.objOpenNodesByGlobalDistance[_intGlobalDistance];
	var _intNodeIndex = _arrCurrNodeSet.contains(_objWhatNode);
	if (_intNodeIndex != null)
	{
		_arrCurrNodeSet.splice(_intNodeIndex, 1);
	}
}

function getAndRemoveBestNode(_intCurrRank)
{
	var _arrCurrNodeSet = this.objOpenNodesByGlobalDistance[_intCurrRank];
	if (_arrCurrNodeSet)
	{
		if (_arrCurrNodeSet.length > 0)
		{
			var _objBestNode = _arrCurrNodeSet[0];
			this.removeNode(_objBestNode, _objBestNode.intDistanceToOrigin, _objBestNode.intGlobalDistance)
			return _objBestNode;
		}
		_intCurrRank++;
		if (_intCurrRank <= this._intHighestPriority)
		{
			var _objBestNode = this.getAndRemoveBestNode(_intCurrRank);
		}
		else
		{
			var _objBestNode = false;
		}
		return _objBestNode;
	}
	_intCurrRank++;
	if (_intCurrRank <= this._intHighestPriority)
	{
		var _objBestNode = this.getAndRemoveBestNode(_intCurrRank);
	}
	else
	{
		var _objBestNode = false;
	}
	return _objBestNode;
}

function containsNode(_objWhatNode)
{
	if (this.arrReferencedNodes.contains(_objWhatNode) != null)
	{
		return true;
	}
	return false;
}

Array.prototype.contains = arrayContains;
function arrayContains(_objElement)
{
	var count = 0;
	while (count < this.length)
	{
		if (this[count] === _objElement)
		{
			return count;
		}
		count++;
	}
	return null;
}