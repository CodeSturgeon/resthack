SESSION =
{
	strName:"The Session",
	strDescription:"The holder of all pieces and the melting pot of code.",

	handleEvent_pageLoaded:function()
	{
		this.debug("Sesson loaded.", 1);

		// Fake data returns

		EM.trigger('SERVER_turnInfo', _objSpecificTurnInfoRequest);
		EM.trigger('SERVER_mapInfo', _objMapInfo);
		EM.trigger('SERVER_mapAllTiles', _arrFakeMap2);
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