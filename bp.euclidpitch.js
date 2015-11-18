/*	
	This the purpose of this file is to
	generate a list that represents
	the an even distribution of exents.
	These "events" are then translated 
	into intervals in a given scale.
	For instance, if one wishes to distribute
	7 events over 12 possible slots,
	this algorithm would produce the list
	[1,0,1,1,0,1,0,1,0,1,1,0], which 
	corrensponds to a standard natural
 	minor scale. The algorithm makes use 
	of the structure of Euclid's algorithm
 	for computing the greatest common divisor
	of two integers.
	
	Written by Zach Kondak 2015
	zachk414@gmail.com
	www.kondak.info
*/

//global variables for max
inlets = 2;
//inlet help
setinletassist(0, function () {assist("zkEuklid inlet 1\nint; things to be spaced.", 0);});
setinletassist(1, function () {assist("zkEuclid inlet 2\nint: number of spaces", 1);});
//outlet help
setoutletassist(0, function () {assist("zrkNoteList outlet 1\nlist: evenly distributed list", 0);});

var DEFAULT_TOTAL_SLOTS = 12;
var DEFAULT_ACTIVE_SLOTS = 7;

var euclidHelp = function (m, k, theList)
{
	if(k === 0 || m === 0)
	{
		var returnList = [];
		for (var i = 0; i < theList.length; i++)
		{
			returnList = returnList.concat(theList[0].trim().split(' ').map(Number));
		}
		return returnList;
	}
	else
	{
		var i = 0;
		var minKM = Math.min(k, m);
		var maxKM = Math.max(k, m);
		for(i; i < minKM; i++)
		{
			theList[i] = theList[i] + theList[theList.length - i - 1];
		}
		theList.splice(theList.length - minKM, minKM);
		return euclidHelp(Math.max(minKM, 0), maxKM - minKM, theList);
	}
};


var euclid = function (m, k)
{
	var newList = [];
	var mNum = m;
	var kNum = k;
	for (m; m > 0; m--)
	{
		newList[(m + k - 1)] = "0 ";
	}
	for (k; k > 0; k--)
	{
		newList[(k - 1)] = "1 ";
	}
	return euclidHelp(mNum, kNum, newList);
};

var euclidList = function ()
{
	var that = {};
	var activeSlots = DEFAULT_ACTIVE_SLOTS;
	var totalSlots = DEFAULT_TOTAL_SLOTS;
	//set variables based on arguments
	switch(jsarguments.length)
	{
		case 3:
			activeSlots = jsarguments[1];
			totalSlots = jsarguments[2];
			break;
		case 2:
			activeSlots = jsarguments[1];
			totalSlots = 1 + (jsarguments[1] * 2);
			break;
		case 1:
			activeSlots = DEFAULT_ACTIVE_SLOTS;
			totalSlots = DEFAULT_TOTAL_SLOTS;
			break;
	}
	var rhythmList = euclid((totalSlots - Math.min(activeSlots, totalSlots)), Math.min(activeSlots, totalSlots));
	
	that.getList = function ()
	{
		return rhythmList;
	};
	that.setActive = function (numActiveSlots)
	{
		activeSlots = numActiveSlots;
		rhythmList = euclid((totalSlots - Math.min(activeSlots, totalSlots)), Math.min(activeSlots, totalSlots));
		return rhythmList;
	};
	that.setTotal = function (numTotalSlots)
	{
		totalSlots = Math.max(0, Math.min(numTotalSlots, 1024));
		rhythmList = euclid((totalSlots - Math.min(activeSlots, totalSlots)), Math.min(activeSlots, totalSlots));
		return rhythmList;
	};
	return that;
}();

function msg_int(value)
{
	switch(inlet)
	{
		case 0:
			euclidList.setActive(value);
			var finalOutput = euclidList.getList();
			outlet(0, finalOutput);
			break;
		case 1:
			euclidList.setTotal(value);
			break;
	}
}

function bang()
{
	var finalOutput = euclidList.getList();
	outlet(0, finalOutput);
}