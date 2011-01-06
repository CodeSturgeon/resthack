var CHARACTER =
{
	strName:"The Character",
	strDescription:"The character, his location, emotional state and anything else pertitant to his existance.",
	strEmotionalState:"Bemused.",

	strCharName:"Thrud",

	intXPos:null,
	intYPos:null,
	intMoves:null,
	intLocalMoves:null,

	_objExplorationLiterals : {"TurnLeft" : TURN_LEFT_EXPLORER, "Graph1" : GRAPH_EXPLORER_1, "Graph2" : GRAPH_EXPLORER_2},

	_strCurrExplorer : "Graph2",

	intDirection : 1,

	booUnrenderedUpdates : false,

	getData:function ()
	{
		this.debug("CHARACTER.getData()",1);
	},

	handleEvent_SERVER_stateUpdate:function(_objWhatData)
	{
		//this.debug("CHARACTER.handleEvent_SERVER_stateUpdate().", 1)
		if (_objWhatData['avatar'])
		{
			if (_objWhatData['avatar']['moves'] >= this.intLocalMoves)
			{
				//alert("X: " + _objWhatData['avatar']['x'] + "\nY: " + _objWhatData['avatar']['y'])
				this.intXPos = _objWhatData['avatar']['x'];
				this.intYPos = _objWhatData['avatar']['y'];
				this.intMoves = _objWhatData['avatar']['moves'];
				if (this.intLocalMoves == null)
				{
					this.intLocalMoves = _objWhatData['avatar']['moves'];
				}
			}
			this.booUnrenderedUpdates = true;
			//this.debug("CHARACTER.handleEvent_SERVER_turnInfo(), this:",1, this);
		}
	},

	handleEvent_localCharacterUpdate : function (_objWhatData)
	{
		//this.debug("CHARACTER.handleEvent_localCharacterUpdate().", 1)
		//alert("X: " + _objWhatData['avatar']['x'] + "\nY: " + _objWhatData['avatar']['y'])
		this.intXPos = _objWhatData['x'];
		this.intYPos = _objWhatData['y'];
		this.intLocalMoves = _objWhatData['moves'];
		this.booUnrenderedUpdates = true;
		//this.debug("CHARACTER.handleEvent_SERVER_turnInfo(), this:",1, this);
	},

	handleEvent_explore : function ()
	{
		var _objCurrExplorationObject = this._objExplorationLiterals[this._strCurrExplorer];
		var _intNewMoveDirection = _objCurrExplorationObject.getNextMove();
		//alert("_intNewMoveDirection: " + _intNewMoveDirection);
		EM.trigger("navigate", _intNewMoveDirection);
	},

	//_objExplorationLiterals : {"TurnLeft" : TURN_LEFT_EXPLORER},

	//_strCurrExplorer

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

EM.register(CHARACTER)
SCREEN_RENDERER.registerToUpdateFrom("character", CHARACTER, null);