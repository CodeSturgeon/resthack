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

	_getStartData : function ()
	{
		this.debug("SESSION._getStartData()",1);
		SERVER_IO.sendRequestData("SERVER_turnInfo", "GET", this._strServerBasePath + "turn/info.js", null);
		SERVER_IO.sendRequestData("SERVER_mapInfo", "GET", this._strServerBasePath + "map/info.js", null);
		SERVER_IO.sendRequestData("SERVER_mapAllTiles", "GET", this._strServerBasePath + "map/all_tiles.js", null);
		//EM.trigger('SERVER_turnInfo', _objSpecificTurnInfoRequest);
		//EM.trigger('SERVER_mapInfo', _objMapInfo);
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