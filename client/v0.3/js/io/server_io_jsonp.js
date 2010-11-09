SERVER_IO =
{
	strName : "The server IO Object",
	strDescription : "Makes requests to the server via JSONP, each request is synched to a specific callback object.",
	objRequests:{},

	_booPurgeScriptBlocks : false,

	_objDOM : null,

	_strJSONPCallbackPrefix : "?jsonp_callback=SERVER_IO.objRequests.",
	_strJSONPCallbackSuffix : ".receive",

	_strBaseURI : "http://reddit-maze.appspot.com/",

	handleEvent_primeDOMLinks : function (_objWhatDOM)
	{
		this._objDOM = _objWhatDOM;
	},

	makeRequest : function (_strResourcePath, _strRequestType, _arrRequestParams, _strReturnEventCall)
	{
		var _strEventID = "e" + new Date().getTime() + Math.round(Math.random() + 10000);
		var _strRequestParams = this._encodeRequest(_strRequestType, _arrRequestParams);
		this.debug("_strRequestParams: " + unescape(_strRequestParams), 1);
		var _strFullRequestURI = this._strBaseURI + _strResourcePath + this._strJSONPCallbackPrefix + _strEventID + this._strJSONPCallbackSuffix + _strRequestParams;
		//alert("_strFullRequestURI: " + _strFullRequestURI)

		this.objRequests[_strEventID] = new IORequest(this, _strEventID, _strFullRequestURI, _strReturnEventCall)
	},

	recieveData : function (_objWhatIORequest, _strWhatData)
	{
		var _objJSONData = eval(_strWhatData);
		EM.trigger(_objWhatIORequest.strReturnEventCall, _objJSONData);

		//alert("_objWhatIORequest.domScriptTag.src: " + _objWhatIORequest.domScriptTag.src)
		if (this._booPurgeScriptBlocks)
		{
			this._removeScriptBlock(_objWhatIORequest.domScriptTag);
		}

		delete this.objRequests[_objWhatIORequest.strID];
	},

	_encodeRequest : function (_strRequestType, _arrRequestParams)
	{
		if ((_strRequestType != "") && (_arrRequestParams.length > 0))
		{
			var _arrEncodedRequests = [];
			var count = 0;
			while (count < _arrRequestParams.length)
			{
				var _objCurrRequestData = _arrRequestParams[count];
				var _arrCurrRequestPairs = [];
				for (var _strCurrKey in _objCurrRequestData)
				{
					// REFACTOR NOTE: This will most like need to detect
					// the data type and convert/add quotes as required.
					_arrCurrRequestPairs[_arrCurrRequestPairs.length] = '"' + _strCurrKey + '":' + _objCurrRequestData[_strCurrKey];
				}
				_arrEncodedRequests[_arrEncodedRequests.length] = "{" + _arrCurrRequestPairs.join(",") + "}";
				count++;
			}
			var _strEncodedRequest = "[" + _arrEncodedRequests.join(",") + "]";

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