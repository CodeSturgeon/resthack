CHARACTER =
{
	strName:"The Character",
	strDescription:"The character, his location, emotional state and anything else pertitant to his existance.",
	strEmotionalState:"Bemused.",

	strCharName:"Thrud",

	intXPos:null,
	intYPos:null,
	intMoves:null,

	getData:function ()
	{
		this.debug("CHARACTER.getData()",1);
	},

	handleEvent_SERVER_stateUpdate:function(_objWhatInfo)
	{
		if (_objWhatInfo['avatar'])
		{
			this.intXPos = _objWhatInfo['avatar']['x'];
			this.intYPos = _objWhatInfo['avatar']['y'];
			this.intMoves = _objWhatInfo['avatar']['moves'];
			this.debug("CHARACTER.handleEvent_SERVER_turnInfo(), this:",1, this);
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