SESSION =
{
	strName:"The Session",
	strDescription:"The holder of all pieces and the melting pot of code.",

	_strServerBasePath : "http://localhost/game/server/",

	handleEvent_pageLoaded:function()
	{
		this.debug("Sesson loaded.", 1);
		this._getStartData();
	},

	handleEvent_SERVER_testCallback : function (_objWhatJSON)
	{
		//alert("Fish?");
		this.debug("Map data: ", 1, _objWhatJSON)
	},

	_getStartData : function ()
	{
		this.debug("SESSION._getStartData()",1);
		//(_strResourcePath, _strRequestType, _objRequestParams, _strReturnEventCall)
		SERVER_IO.makeRequest("avatar/funkmaster", "", false, "SERVER_stateUpdate");
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

EM.register(SESSION)