SERVER_IO =
{
	strName : "The server IO Object",
	strDescription : "Makes requests to the server via JSONP, each request is synched to a specific callback object.",
	objRequests:{},
	_objDOM : null,

	_strJSONPCallbackPrefix : "?jsonp_callback=SERVER_IO.objRequests.",
	_strJSONPCallbackSuffix : ".receive",

	_strBaseURI : "http://reddit-maze.appspot.com/",

	handleEvent_primeDOMLinks : function (_objWhatDOM)
	{
		this._objDOM = _objWhatDOM;
	},

	makeRequest : function (_strResourcePath, _strRequestType, _objRequestParams, _strReturnEventCall)
	{
		var _strEventID = "e" + new Date().getTime() + Math.round(Math.random() + 10000);
		var _strRequestParams = this._encodeRequest(_strRequestType, _objRequestParams);
		var _strFullRequestURI = this._strBaseURI + _strResourcePath + this._strJSONPCallbackPrefix + _strEventID + this._strJSONPCallbackSuffix;

		this.objRequests[_strEventID] = new IORequest(this, _strEventID, _strFullRequestURI, _strReturnEventCall)
	},

	recieveData : function (_objWhatIORequest, _strWhatData)
	{
		var _objJSONData = eval(_strWhatData);
		EM.trigger(_objWhatIORequest.strReturnEventCall, _objJSONData);

		//alert("_objWhatIORequest.domScriptTag.src: " + _objWhatIORequest.domScriptTag.src)
		//this._removeScriptBlock(_objWhatIORequest.domScriptTag);

		delete this.objRequests[_objWhatIORequest.strID];
	},

	_encodeRequest : function (_strRequestType, _objWhatRequestData)
	{
		if (_strRequestType != "")
		{
			var _arrRequestPairs = [];
			for (var _strCurrKey in _objWhatRequestData)
			{
				// REFACTOR NOTE: This will most like need to detect
				// the data type and convert/add quotes as required.
				_arrRequestPairs[_arrRequestPairs.length] = '"' + _strCurrKey + '":' + _objWhatRequestData[_strCurrKey]
			}
			var _strEncodedRequest = "[{" + _arrRequestPairs.join(",") + "}]";

			return "&" + _strRequestType + "=" + escape(_strEncodedRequest);
		}
		else
		{
			return "";
		}
	},

	createScriptBlock : function (_strWhatURI)
	{
		var _domScriptTag = this._objDOM.createElement('script');
		_domScriptTag.setAttribute('type', 'text/javascript');
		_domScriptTag.setAttribute('charset', 'ISO-8859-1');
		_domScriptTag.setAttribute('src', _strWhatURI);

		_objHeadTag = this._objDOM.getElementsByTagName('head')[0];
		_objHeadTag.appendChild(_domScriptTag);
		return _domScriptTag;
	},

	_removeScriptBlock : function (_domWhatScriptTag)
	{
		_objHeadTag = this._objDOM.getElementsByTagName('head')[0];
		_objHeadTag.removeChild(_domWhatScriptTag);
	},

	debug : function (strMessage, intPriority, objCallerObject, booCalleeChain)
	{
		if (DEBUG)
		{
			DEBUG.lert(strMessage, intPriority, objCallerObject, booCalleeChain);
		}
	}
}

function IORequest(_objParent, _strID, _strFullRequestURI, _strReturnEventCall)
{
	this.strID = _strID;
	this.strReturnEventCall = _strReturnEventCall;
	//this.domScriptTag = _domScriptTag;

	this._objParent = _objParent;
	this._strFullRequestURI = _strFullRequestURI;

	this.domScriptTag = this._objParent.createScriptBlock(this._strFullRequestURI);
}

IORequest.prototype.receive = IORequestReceive

function IORequestReceive(_strWhatData)
{
	this._objParent.recieveData(this, _strWhatData);
}

EM.register(SERVER_IO)