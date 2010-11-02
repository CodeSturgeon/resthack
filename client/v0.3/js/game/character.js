var CHARACTER =
{
	strName:"The Character",
	strDescription:"The character, his location, emotional state and anything else pertitant to his existance.",
	strEmotionalState:"Bemused.",

	strCharName:"Thrud",

	intXPos:null,
	intYPos:null,
	intMoves:null,

	booUnrenderedUpdates : false,

	getData:function ()
	{
		this.debug("CHARACTER.getData()",1);
	},

	handleEvent_SERVER_stateUpdate:function(_objWhatData)
	{
		if (_objWhatData['avatar'])
		{
			//alert("X: " + _objWhatData['avatar']['x'] + "\nY: " + _objWhatData['avatar']['y'])
			this.intXPos = _objWhatData['avatar']['x'];
			this.intYPos = _objWhatData['avatar']['y'];
			this.intMoves = _objWhatData['avatar']['moves'];
			this.booUnrenderedUpdates = true;
			//this.debug("CHARACTER.handleEvent_SERVER_turnInfo(), this:",1, this);
		}
	},

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