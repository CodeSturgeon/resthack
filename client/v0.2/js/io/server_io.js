SERVER_IO =
{
	strName : "The server IO Object",
	strDescription : "Makes requests to the server, stores them in a hash table and deletes them once there done.",
	objActiveRequests:{},
	objCurrHTTPRequest : null,

	getHTTPObj:function()
	{
		try
		{
			return new XMLHttpRequest();
		}
		catch(e){}

		try
		{
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {}

		alert("XMLHttpRequest not supported");
		return null;
	},

	getXMLDoc : function(_strWhatXMLText)
	{
		var _objXMLReturnData = {}
		_objXMLReturnData['string'] = _strWhatXMLText
		if (window.DOMParser)
		{
			var _objXMLParser = new DOMParser();
		  _objXMLReturnData['xml'] = _objXMLParser.parseFromString(_strWhatXMLText, "text/xml");
		  return _objXMLReturnData;
		}
		else
		{
			var _objXMLParser = new ActiveXObject("Microsoft.XMLDOM");
			_objXMLParser.async="false";
			_objXMLParser.loadXML(_strWhatXMLText);
			_objXMLReturnData['xml'] = _objXMLParser;
			return _objXMLReturnData;
		}
	},

	sendRequestData : function (_strDataReturnEventNameID, _strRequestMethod, _strRequestURI, _strRequestData)
	{
		this.debug("SERVER_IO.sendRequestData(_strDataReturnEventNameID: " + _strDataReturnEventNameID + " , _strRequestMethod: " + _strRequestMethod + ", _strRequestURI " + _strRequestURI + ", _strRequestData: " + _strRequestData + ")",1);

		var _strEventID = new Date().getTime() + Math.random();
		var _objNewHTTP = this.getHTTPObj();

		var objCurrHTTPRequest = this.objActiveRequests[_strEventID] = new IORequest(_strEventID, _objNewHTTP, this, _strDataReturnEventNameID);

		objCurrHTTPRequest.objHTTP.open(_strRequestMethod, _strRequestURI, true);
		objCurrHTTPRequest.objHTTP.onreadystatechange = SERVER_IO.recieveData;
		objCurrHTTPRequest.objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		objCurrHTTPRequest.objHTTP.send(_strRequestData);
	},

	recieveData : function ()
	{
		// This is called with external scope
		var objThat = SERVER_IO;
		for (var _strCurrObjID in objThat.objActiveRequests)
		{
			var _objCurrRequest = objThat.objActiveRequests[_strCurrObjID];
			if (_objCurrRequest.objHTTP.readyState == 4)
			{
				if (_objCurrRequest.objHTTP.status != 200)
				{
					objThat.debug("SERVER_IO.recieveData(), ERROR: _objCurrRequest.objHTTP.status: " + _objCurrRequest.objHTTP.status + "\n_objCurrRequest.objHTTP.statusText: " + _objCurrRequest.objHTTP.statusText, 3);
				}
				objThat.debug("SERVER_IO.recieveData(), _objCurrRequest.objHTTP.status: " + _objCurrRequest.objHTTP.status + "\nReturn handler: " + _objCurrRequest.strDataReturnEventNameID, 1);
				var _strServerText = _objCurrRequest.objHTTP.responseText;
				var _objReturnData = {};
				eval("_objReturnData = " + _strServerText)
				EM.trigger(_objCurrRequest.strDataReturnEventNameID, _objReturnData);
				delete objThat.objActiveRequests[_strCurrObjID];
			}
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

function IORequest(_strID, _objHTTP, _objParent, _strDataReturnEventNameID)
{
	this.strID = _strID;
	this.objHTTP = _objHTTP;
	this.objParent = _objParent;
	this.strDataReturnEventNameID = _strDataReturnEventNameID;
}

EM.register(SERVER_IO)