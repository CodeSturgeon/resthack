/*

Author: Johnc
Start Date: 09/06/06

*/

var DEBUG =
{
	id: "DeBugger",

	// Used to hold the HTML that is to be written until the next update cycle.
	debugMessageCache: "",

	// Used to determine wether to update during the setInterval loop.
	autoUpdate : true,

	// The setInterval is attached to this.
	timerObj : false,

	// The amount of millisecounds between each update cycle.
	updateCyclicRate : 500,

	// Use this to filter out different message level's.
	debugPriorityThreshold :5,

	// If set to true, the message's will be written out using document.write()
	// if false, .innerHTML().
	// Whilst document.write() is handy for debugging the debugger, it
	// causes the message window to stop recieving messages once the window
	// is interacted with.
	outputAsWrite : false,

	// Determines wether to include the body or just the title of a callee function
	showCalleeFunctionsInFull : false,

	// Used to deal with a "feature" in function.callee, whereby recursive
	// function ALWAYS cause an infinite loop, regardless of wether the
	// actual recursion itself breaks.
	// This is the number of times a function name can appear before
	// the .callee chain is regarded as an infinite loop.
	recursionThreshold : 2,

/* ============================ START DEBUG WINDOW PARAM's ============================ */
	debug : false,
	debugWin : null,
	debugWinName : "DeBuggerWin" + new String(Math.round(Math.random() * 10000)),
	debugWinX : 0,
	debugWinY : 0,
	debugWinWidth : 300,
	debugWinHeight : 600,
	debugCounter : 0,	// Very important, used to generate the ID's of the various Debug elements.
/* ============================= END DEBUG WINDOW PARAM's ============================= */



/* ============================ START STYLE MARKUP ============================ */
	// Whilst I agree this is quite a lot of style info outside of a style
	// sheet, I didn't want to have to include a .css file alongside a .js
	// Currently set as:
	//	- Header	(black)
	//	- Normal (green)
	//	- Warning (orange)
	//	- Error (red)
	//	- Debug (purple)
	fontWrapper : new Array(
	"<div style='margin:2px; padding:5px; border-top:1px solid black; border-bottom:1px solid black; background-color:#efefef;'><span style='font-family: Verdana, Arial, Sans-Serif; font-size: 20pt; color:black;'>",
	"<div style='margin:2px; padding:5px; border-top:1px solid green;'><span style='font-family: Verdana, Arial, Sans-Serif; font-size: 10pt; color:green;'>",
	"<div style='margin:2px; margin-bottom:10px; padding:10px; border:1px solid darkorange;'><span style='font-family: Verdana, Arial, Sans-Serif; font-size: 10pt; color:darkorange;'>",
	"<div style='margin:2px; margin-bottom:10px; padding:10px; border:2px solid red;'><span style='font-family: Verdana, Arial, Sans-Serif; font-size: 10pt; color:red;'>",
	"<div style='margin:2px; margin-bottom:10px; padding:10px; border:2px dashed purple;'><span style='font-family: Verdana, Arial, Sans-Serif; font-size: 10pt; color:purple;'>"
	),

	endFont : "</span></div>",
/* ============================= END STYLE MARKUP ============================= */



/* ============================ START PUBLIC METHODS ============================ */
	// The main function public function, it is little more than a wrapper for
	// this.createDebugMessage(). Its main job is to increment this.debugCounter.
	// It takes 4 param's:
	//	- whatMessage: A string of the message text.
	//	- whatPriority: Defines which of the this.fontWrapper[] array will be used to wrap around
	//									the whatMessage text. It also effects how this.createDebugMessage() behaves
	//									with regards to priority 0 (header) messages.
	//	- showCalleeChain: A boolean variable that dictates wether or not to show the
	//										 callee chain. As generating the callee chain can cause a LARGE
	//										 processing drain, it is advised to use this flag sparingly.
	//	- whatCallerObject: An optional object that will have its properties recursivly display'd
	//											in the debug window. In the event multiple object require interigating
	//											simply collate them into an array and pass that as the param.
	//
	// The function is named lert because you country needs lert's as told by the graffiti
	// I saw on an old advert:
	//
	//	BOMBS - BE AWARE
	//
	//		- Don't be a ware, there are two many ware's already, be a lert instead.
	// (msg, priority, whatObj, showCallee)
	lert : function (whatMessage, whatPriority, whatCallerObject, showCalleeChain)
	{
		if (whatPriority >= this.debugPriorityThreshold)
		{
			//alert("whatMessage: " + whatMessage)
			this.debugCounter++;
			var msgText = this.createDebugMessage(whatMessage, whatPriority, whatCallerObject, showCalleeChain);
			this.debugMessageCache += msgText;
		}
	},


	// If autoUpdate where set to false, this method is exposed to allow
	// manual purging. Of the cache.
	forceUpdate : function ()
	{
		this.updateWindow();
	},

	// Again, only likely to be used if the DEBUGer was operating in manual.
	clearCache : function ()
	{
		this.debugMessageCache = "";
	},

	// Stop the automatic updates
	pause : function ()
	{
		this.autoUpdate = false;
	},

	// Restarts them
	resume : function ()
	{
		this.autoUpdate = true;
	},

	// This should be called onunload. It will clean
	// up the open window and the setInterval.
	goAway : function ()
	{
		this.stopTimer();
		this.closeWindow();
		//alert("Bye!")
	},

/* ============================= END PUBLIC METHODS ============================= */



/* ============================ START PRIVATE METHODS =========================== */

	/* ================ START WINDOW METHODS ================ */

	// First checks to see if the window already exists, and if it does,
	// that it hasn't been closed. If thats the case, the function returns there,
	// if not, it opens the window and writes the expand/collapse code.
	checkAndOpenWindow : function ()
	{
		if (this.debugWin)
		{
			if (!this.debugWin.closed)
			{
				return
			}
		}

		// Most of these options are set up the top in DEBUG WINDOW PARAM's section
		var winOptions ="top=" + this.debugWinY + ",left=" + this.debugWinX + ",width=" + this.debugWinWidth + ",height=" + this.debugWinHeight + ",toolbar=no,menubar=no,status=yes,scrollbars=yes,resizable=yes,fullscreen=no";

		this.debugWin = window.open('', this.debugWinName, winOptions);

		// Write out the basic expand/collapse function along with
		// a skeleton web page with a holder DIV.
		var baseContent = '<html>'
		baseContent += '<head>'
		baseContent += '<title>' + this.id + '</title>'
		baseContent += '<script>'
		baseContent += 'function toggleBodyVis(whatID)'
		baseContent += '{'
		baseContent += '	var currBody = document.getElementById(whatID + "BodyHolderID");'
		baseContent += '	var currLink = document.getElementById(whatID + "LinkTextID");'
		baseContent += '	if (currBody)'
		baseContent += '	{'
		baseContent += '		if (currBody.style.display == "none")'
		baseContent += '		{'
		baseContent += '			currBody.style.display = "block";'
		baseContent += '			currLink.innerHTML = currLink.innerHTML.replace("+","-");'
		baseContent += '		}'
		baseContent += '		else'
		baseContent += '		{'
		baseContent += '			currBody.style.display = "none";'
		baseContent += '			currLink.innerHTML = currLink.innerHTML.replace("-","+");'
		baseContent += '		}'
		baseContent += '	}'
		baseContent += '}'
		baseContent += '</script>'
		baseContent += '</head>'

		baseContent += '<body>'
		baseContent += '<div id="outputID"></div>'
		baseContent += '</body>'
		baseContent += '</html>'

		this.debugWin.document.write(baseContent)
	},


	// This is either called manually from DEBUG.forceUpdate()
	// or automatically from DEBUG.doTimer(). It calls this.checkAndOpenWindow()
	// to ensure the window is present and then flush's the cache into the
	// holder DIV on the popup window.
	updateWindow : function ()
	{
		this.checkAndOpenWindow()
		if (!this.debugWin.closed)
		{
			if (!this.outputAsWrite)
				this.debugWin.document.getElementById("outputID").innerHTML += this.debugMessageCache;
			else
				this.debugWin.document.getElementById("outputID").document.write(this.debugMessageCache);

			this.debugMessageCache = "";
			this.stopTimer();
		}
	},

	closeWindow : function ()
	{
		if ((this.debugWin) && (!this.debugWin.closed))
			this.debugWin.close();
	},
	/* ================ END WINDOW METHODS ================= */




	/* ================ START TIMER METHODS ================ */
	// Called by this.createDebugMessage(), this function
	// first checks timerObj isn't currently a timer, it
	// returns if there is already one running.
	// It then starts the timer based on this.updateCyclicRate.
	startTimer : function ()
	{
		//alert("Timer started")
		if (this.timerObj)
			return
		this.timerObj = window.setInterval("DEBUG.doTimer()", this.updateCyclicRate)
	},

	// This function is technically a public function in that it is
	// called outside of the object by the setInterval code, which
	// has to reference the code as 'DEBUG.doTimer()'.
	// If this.autoUpdate is true, it calls this.updateWindow().
	doTimer : function ()
	{
		if (this.autoUpdate)
		{
			//document.getElementById("tempOutputID").innerHTML += "."
			this.updateWindow()
		}
	},

	// Clears DEBUG.timerObj. Called by this.goAway() and this.updateWindow()
	stopTimer : function ()
	{
		window.clearInterval(DEBUG.timerObj)
		this.timerObj = false;
	},
	/* ================= END TIMER METHODS ================= */




	/* =============== START MESSAGE METHODS =============== */
	// This is the main function for message creation, all other methods
	// are called from this one.
	// It takes 4 param's:
	//	- whatMessage: A string of the message text.
	//	- whatPriority: Defines which of the this.fontWrapper[] array will be used to wrap around
	//									the whatMessage text. It also effects how this.createDebugMessage() behaves
	//									with regards to priority 0 (header) messages.
	//	- whatCallerObject: An optional object that will have its properties recursivly display'd
	//											in the debug window. In the event multiple object require interigating
	//											simply collate them into an array and pass that as the param.
	//	- showCalleeChain: A boolean variable that dictates wether or not to show the
	//										 callee chain. As generating the callee chain can cause a LARGE
	//										 processing drain, it is advised to use this flag sparingly.
	// It first calls this.parseContentOutput(whatMessage) to replace '<' and '>' with &lt; &gt;, TAB with &nbsp;&nbsp;&nbsp;
	// and \n with <br/>.
	// Then a check is made as to wether its a header, if its not, the object and function callee path
	// are appended by calling this.calcCalleePath(); and (if its present) this.showCallerObject();
	// Lastly, the timer is started so the buffer can be flushed shortly.
	createDebugMessage : function (whatMessage, whatPriority, whatCallerObject, showCalleeChain)
	{
		whatMessage = this.parseContentOutput(whatMessage)

		// If its not a header.
		if (whatPriority != 0)
		{
			if (showCalleeChain)
				whatMessage += "<br/>" + this.calcCalleePath();
			if (whatCallerObject)
				whatMessage += "<br/>" + this.showCallerObject(whatCallerObject, this.debugCounter);

			//alert("this.debugCounter: " + this.debugCounter + "\nwhatPriority: " + whatPriority + "\nthis.fontWrapper[whatPriority]: " + this.fontWrapper[whatPriority])

			whatMessage = this.fontWrapper[whatPriority] + this.debugCounter + ") " + whatMessage + this.endFont;
		}
		else
		{
			whatMessage = this.fontWrapper[whatPriority] + whatMessage + this.endFont;
		}
		this.startTimer()
		return whatMessage;
	},


	// After skipping up out of the scope of this objects internal event chain (by
	// the line this.calcCalleePath.caller.caller.caller) it loops until it find's
	// a .callee property thats false.
	// Each time it finds a valid function, it appends a link with the function name to the returnString
	// along with the function body hidden within an expandible div.
	//
	// NOTE: Due to the way .caller is implemented, it can't handle recursive functions
	// properly, by the time you come to read the .callee property for a function that appears
	// more than once in the current event chain, it has been set to the last caller/callee
	// relationship and there is no way to discern the previous caller/callee relationships
	// it may have enjoyed in the event chains past. To counter this, if a function's name
	// appears more than the this.recursionThreshold property, the loop is broken and a
	// red error message is added to notify the user this occured.
	//
	// Furthermore, the function is further hamstrung by good old IE deciding to NOT
	// report .caller if it happens to be in another frame. Thus makings its use in a
	// lot of our project's diminished. Firefox does however give full .caller chain's
	// across frames.
	calcCalleePath : function ()
	{
		// Build the callee wrapper for this message
		var startCalleeWrapper = "<a id='" + this.debugCounter + "CalleeLinkTextID' href='javascript:toggleBodyVis(\"" + this.debugCounter + "Callee\")' title='Show function call path'>"
		startCalleeWrapper += "+ Callee's</a><br/>\n";
		startCalleeWrapper += "<div id='" + this.debugCounter + "CalleeBodyHolderID' style='display:none; padding:3px; margin:3px; border:1px solid #cccccc;'>\n"
		var returnString = ""
		var count = 0;
		// We need to rise above the event chain of this object.
		var currCallerFunction = this.calcCalleePath.caller.caller.caller

		var usedCalleeNames = new Array()

		// While the currCallerFunction is still valid.
		while ((currCallerFunction != false) && (currCallerFunction != null))
		{
			count++

			// Strip's out the function name. Note, if you have defined your functions like this:
			//
			// var myFunc = function () {myCode;}
			//
			// Then the trimFunctionName will return "", which will cause the code below to list
			// the function as "UNAMED_FUNCTION".
			// Consider instead creating your functions like this:
			//
			// var myFunc = function _myFunc() {myCode;}
			//
			// Which will leave a grabbable name for the callee path.
			var currFunctionName = this.trimFunctionName(currCallerFunction.toString())

			if (usedCalleeNames[currFunctionName])
			{
				if (usedCalleeNames[currFunctionName] < this.recursionThreshold)
				{
					usedCalleeNames[currFunctionName]++;
				}
				else
				{
					returnString = "<span style='color:red; font-weight:bold;'>Hit recursion threshold.</span> " + returnString
					break;
				}
			}
			else
			{
				usedCalleeNames[currFunctionName] = 1
			}
			//alert("currFunctionName: " + currFunctionName + "\n\ncount: " + count)
			// Trims between the first { and the last }
			var currFunctionBody = this.trimFunctionContents(currCallerFunction.toString())
			var currFunctionText = "";

			// If there is a caller property on currCallerFunction, reset currCallerFunction to be the next caller.
			if (currCallerFunction)
			{
				currCallerFunction = currCallerFunction.caller
			}
			else	// Otherwise set the currCallerFunction to false so the loop ends.
			{
				currCallerFunction = false;
			}

			currFunctionText += this.buildFunctionPathEntry(currFunctionName, currFunctionBody, (this.debugCounter + "_" + count))

			returnString = currFunctionText + returnString
		}

		// Add the wrapper givings the "+ Callee's" link and needed code.
		returnString = startCalleeWrapper + returnString + "</div>";
		return returnString
	},


	// Gets the function name and the param's by slicing
	// from the end of "function" to the first ")".
	// Checks there is a name present and prefix's the string with
	// "UNAMED_FUNCTION".
	// Returns the adjusted string.
	trimFunctionName : function (whatFunctionString)
	{
		var startTrim = whatFunctionString.indexOf("function") + 9
		var testEndTrim = whatFunctionString.indexOf("(")
		var endTrim = whatFunctionString.indexOf(")") + 1

		var trimmedText = whatFunctionString.slice(startTrim - 1, endTrim)
		var testTrim = this.trimSpacesAndTabs(whatFunctionString.slice((startTrim), (testEndTrim)))

		if (testTrim == "")
			trimmedText = "UNAMED_FUNCTION " + trimmedText

		if (trimmedText.length > 0)
		{
			//alert("this.trimSpacesAndTabs(trimmedText): " + this.trimSpacesAndTabs(trimmedText))
			return this.trimSpacesAndTabs(trimmedText);
		}
		else
		{
			return false;
		}
	},


	// Used by the above function _to extract the inner portion of a function. Its find the first { and the last }
	// and returns any text in-between after trimming spaces and tab's.
	trimFunctionContents : function (whatFunctionString)
	{
		var startTrim = whatFunctionString.indexOf("{") + 1
		var endTrim = whatFunctionString.lastIndexOf("}")
		var trimmedText = this.trimSpacesAndTabs(whatFunctionString.slice(startTrim, endTrim))
		return trimmedText;
	},


	// Four loops remove leading and trailing tabs and spaces
	// and then return the result.
	trimSpacesAndTabs : function (whatString)
	{
		var trimmedString = whatString;
		while (trimmedString.charAt(0) == " ")
			trimmedString = trimmedString.slice(1 , trimmedString.length)

		while (trimmedString.charAt(trimmedString.length-1) == " ")
			trimmedString = trimmedString.slice(0 , trimmedString.length - 1)

		while (trimmedString.charAt(0) == "	")
			trimmedString = trimmedString.slice(1 , trimmedString.length)

		while (trimmedString.charAt(trimmedString.length-1) == "	")
			trimmedString = trimmedString.slice(0 , trimmedString.length - 1)

	return trimmedString;
	},


	// This function takes the name, body and ID of a callee function and constructs the link
	// and collapsed entry for the body.
	// If its finds any anonymous() functions it renames them with the easier to notice "NATIVE_CODE: ''".
	buildFunctionPathEntry : function (whatName, whatBody, whatID)
	{
		var returnString = "<span>";

		if (this.showCalleeFunctionsInFull)
		{
			// Produce the link.
			returnString += "<a id='" + whatID + "FuncLinkTextID' href='javascript:toggleBodyVis(\"" + whatID + "Func\")' ";
			returnString += "title='Click here to expand the function body.'>";
		}
		if (whatName != "anonymous()")
		{
			returnString += "+ " + whatName;
		}
		else
		{
			returnString += "+ NATIVE_CODE: '" + whatName + "'";
		}

		if (this.showCalleeFunctionsInFull)
		{
			returnString += "</a>\n";
			// Produce the collapsed entry for the body.
			returnString += "<div id='" + whatID + "FuncBodyHolderID' style='display:none; border:1px solid #dddddd; padding:5px; margin:5px;'>";
			returnString += "{";
			returnString += this.parseContentOutput(whatBody);
			//alert("this.parseContentOutput(whatBody): " + this.parseContentOutput(whatBody))
			returnString += "}<br/>";
			returnString += "</div>\n";
		}
		else
		{
			returnString += "\n";
		}


		returnString += "</span>\n";

		return returnString;
	},


	// This function takes the (optional) object passed to the lert function
	// and creates a link and a collapsed entry for the 'body' which is a list of the
	// methods and properties of the object.
	// If a property is found to be an object/array, the code will recurse.
	showCallerObject : function (whatObject, whatID)
	{
		var startObjectWrapper = "<a id='" + whatID + "ObjectLinkTextID' href='javascript:toggleBodyVis(\"" + whatID + "Object\")' title='Show Object info'>"

		// Attempt to find an ID property within the object to add meaning to the Object: link.
		//alert("whatObject: " + whatObject)
		if (whatObject.objID)
		{
			startObjectWrapper += "+ Object: " + whatObject.objID + "</a><br/>\n";
		}
		else if (whatObject.id)
		{
			startObjectWrapper += "+ Object: " + whatObject.id + "</a><br/>\n";
		}
		else if (whatObject.name)
		{
			startObjectWrapper += "+ Object: " + whatObject.name + "</a><br/>\n";
		}
		else
		{
			startObjectWrapper += "+ Object</a><br/>\n";
		}
		startObjectWrapper += "<div id='" + whatID + "ObjectBodyHolderID' style='display:none; padding:3px; margin:3px; border:1px solid #cccccc;'>\n"
		// Call the buildObjectBodyText() to parse the object.
		startObjectWrapper += this.buildObjectBodyText(whatObject, whatID);
		startObjectWrapper += "</div>\n";

		return startObjectWrapper
	},


	// Using a 'for in' loop, the function examines each property of whatObj.
	// It will then either call this.trimFunctionName(), this.showCallerObject() (recursivly)
	// or simply list the property if its a simple variable.
	buildObjectBodyText : function (whatObj, whatID)
	{
		var returnText = "<h3>Object properties:</h3>"
		var propertiesArray = new Array();
		var count = 0;

		for (var propCount in whatObj)
		{
			count++
			try
			{
				propType = typeof whatObj[propCount]
				//alert("propCount: " + propCount + ", type: " + propType)
				switch (propType)
				{
					case "function":
						propertiesArray[propertiesArray.length] = propCount + " = " + this.trimFunctionName(whatObj[propCount].toString()) + "<br/>";
						//alert("propertiesArray[propertiesArray.length - 1]: " + propertiesArray[propertiesArray.length - 1])
					break;
					case "object":
						if (whatObj[propCount])
						{
							try
							{
								if (((whatObj[propCount] instanceof Object) || (whatObj[propCount] instanceof Array)) && (propCount != "parentObj") && (propCount != "_objParent") && (propCount != "objParent") && (propCount != "_objParentObj") && (propCount != "objNav") && (propCount != "objContentDOM"))
								{
									propertiesArray[propertiesArray.length] = propCount + " = " + this.showCallerObject(whatObj[propCount], (whatID + "_" + count)) + "<br/>";
								}
								else if ((whatObj[propCount] != null) && (whatObj[propCount] != false))
								{
									if (whatObj[propCount] instanceof Function)
										propertiesArray[propertiesArray.length] = propCount + " = " + this.parseContentOutput(whatObj[propCount].toString()) + "<br/>";
								}
							}
							catch (_strError)
							{
								// Throw error here.
							}
						}
						//else
						//	propertiesArray[propertiesArray.length] = propCount + " = " + whatObj[propCount] + "<br/>";
					break;
					case "string":
						propertiesArray[propertiesArray.length] = propCount + " = " + this.parseContentOutput(whatObj[propCount]) + "<br/>";
					break;
					default:
						propertiesArray[propertiesArray.length] = propCount + " = " + whatObj[propCount] + "<br/>";
					break;
				}
			}
			catch (_strError)
			{
				// Throw error here.
			}
		}
		// Sort then loop through all the values found above adding the X) suffix
		// before returning the string.
		var count = 0;
		propertiesArray.sort()
		while (count < propertiesArray.length)
		{
			returnText += (count + 1) + ") " + propertiesArray[count]
			count++
		}
		return returnText;
	},


	// Called to replace '<' and '>' with &lt; &gt;, TAB with &nbsp;&nbsp;&nbsp;
	// and \n with <br/> on output message text to avoid layout issues.
	parseContentOutput : function (whatOutput)
	{
		whatOutput = whatOutput.replace(/</gi, "&lt;")
		whatOutput = whatOutput.replace(/>/gi, "&gt;")
		whatOutput = whatOutput.replace(/	/gi, "&nbsp;&nbsp;&nbsp;")
		whatOutput = whatOutput.replace(/\n/gi, "<br/>")
		return whatOutput;
	}

/* ============================= END PRIVATE METHODS ============================ */
}

DEBUG.lert("DEBUGGER INITIALIZED.",0,false,false)
DEBUG.lert("DEBUG:",1,DEBUG,true)