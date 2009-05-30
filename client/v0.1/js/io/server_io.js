SERVER_IO =
{
	strName:"The server IO Object",
	strDescription:"Its a bit of a faker right now...",
	objActiveRequests:[],

	getHTTPObj:function()
	{
		if (typeof XMLHttpRequest != 'undefined')
		{
			return new XMLHttpRequest();
		}

		try
		{
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
		{
			try
			{
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e){}
		}
		return false;
	},

	send:function (_strDataReturnEventNameID, _strRequestMethod, _strRequestURI, _objRequestData)
	{
		this.debug("SERVER_IO.send(_strReturnEventNameID: " + _strReturnEventNameID + " , _strMethod: " + _strMethod + ", _strURI " + _strURI + ", _objData: )",1,_objData);

		var _strEventID = new Date.getTime();
		var _objHTTP = this.getHTTPObj();

		this.objActiveRequests[_strEventID] = new IORequest(_strEventID, _objHTTP, this, _strDataReturnEventNameID, _strRequestMethod, _strRequestURI, _objRequestData);
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

function IORequest(_strID, _objHTTP, _objParent, _strDataReturnEventNameID, _strRequestMethod, _strRequestURI, _objRequestData)
{
	this.strID = _strID;
	this.objHTTP = _objHTTP;
	this.objParent = _objParent;
	this.strDataReturnEventNameID = _strDataReturnEventNameID;
	this.strRequestMethod = _strRequestMethod;
	this.strRequestURI = _strRequestURI;
	this.objRequestData = _objRequestData;

	this.makeRequest();
}
IORequest.prototype.makeRequest = function()
{
	this.objHTTP.open(this.strRequestMethod, this.strRequestURI, true);
	this.objHTTP.onreadystatechange = this.recieveData;
	this.objHTTP.send(this.serilizeData())
}
IORequest.prototype.serilizeData = function()
{
	return "SERIALIZED DATA";
}
IORequest.prototype.deserilizeData = function()
{
	return "DESERIALIZED DATA";
}
IORequest.prototype.recieveData = function()
{
	if (this.objHTTP.status == 200)
	{
		EM.trigger(this.strDataReturnEventNameID, this.deserilizeData(this.objHTTP.responseText));
	}
	this.selfDestruct();
}
IORequest.prototype.selfDestruct = function()
{
	delete this.objParent.objActiveRequests[this.strID];
}

EM.register(SERVER_IO)