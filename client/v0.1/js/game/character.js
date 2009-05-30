CHARACTER =
{
	strName:"The Character",
	strDescription:"The character, his location, emotional state and anything else pertitant to his existance.",
	strEmotionalState:"Bemused.",

	strCharName:"Thrud",

	intXPos:null,
	intYPos:null,

	getData:function ()
	{
		this.debug("CHARACTER.getData()",1);
	},

	handleEvent_SERVER_turnInfo:function(_objWhatInfo)
	{
		this.intXPos = _objWhatInfo["x"];
		this.intYPos = _objWhatInfo["y"];
		this.debug("CHARACTER.handleEvent_SERVER_turnInfo(), this:",1, this);
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