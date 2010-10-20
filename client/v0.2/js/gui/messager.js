MESSAGER =
{
	strName:"The messager",
	strDescription:"The object responsible for player centered messages.",

	intMessageCount:0,

	objDOM:null,

	handleEvent_pageLoaded:function (_objWhatDOM)
	{
		this.objDOM = _objWhatDOM;
	},

	say:function (_strWhatMessage, _strWhatClass)
	{
		this.objDOM.getElementById("textOutputID").innerHTML += "<div id='message" + this.intMessageCount + "ID' class='_strWhatClass'><a id='message" + this.intMessageCount + "AnchorID' name='message" + this.intMessageCount + "'></a>" + _strWhatMessage + "</div>";
		var _objLastMessage = this.objDOM.getElementById("message" + this.intMessageCount + "AnchorID");
		_objLastMessage.focus();
		this.intMessageCount++;
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

EM.register(MESSAGER)