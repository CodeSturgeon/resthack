SESSION =
{
	strName:"The Session",
	strDescription:"The holder of all pieces and the melting pot of code.",

	_strServerBasePath : "http://localhost/game/server/",

	handleEvent_pageLoaded:function()
	{
		this.debug("Sesson loaded.", 1);
		this._getStartData();
		this._startRenderer();
	},

	_getStartData : function ()
	{
		this.debug("SESSION._getStartData()",1);
		SERVER_IO.makeRequest("avatar/funkmaster", "", false, "SERVER_stateUpdate");
	},

	_startRenderer : function ()
	{
		SCREEN_RENDERER.startUpdateTimer();
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