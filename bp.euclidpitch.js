//	The purpose of this file is to generate a list that represents an 
//	even distribution of exents. These "events" are then translated into 
//	intervals in a given scale. For instance, if one wishes to distribute
//	7 events over 12 possible slots, this algorithm will produce the list
//	[1,0,1,1,0,1,0,1,0,1,1,0], which corrensponds to a scale in dorian
//  mode. The algorithm makes use of the structure of Euclid's algorithm 
//  for computing the greatest common divisor of two integers.
	
//	Written by Zach Kondak 2015
//	zachk414@gmail.com
//	www.kondak.info

//global variables for max
inlets = 2;
//inlet help
setinletassist(0, function () {assist("zkEuklid inlet 1\nint; things to be spaced.", 0);});
setinletassist(1, function () {assist("zkEuclid inlet 2\nint: number of spaces", 1);});
//outlet help
setoutletassist(0, function () {assist("zrkNoteList outlet 1\nlist: evenly distributed list", 0);});

//default values
var DEFAULT_TOTAL_SLOTS = 12;
var DEFAULT_ACTIVE_SLOTS = 7;

//this function is doing most of the work
var euclidHelp = function (numOfGroups, remainder, euclist)
{
	var returnList = [];
	var i;
	if(numOfGroups === 0 || remainder === 0)
	{
		//get rid of nested sub-arrays 
		//for example [[1],[1],[1]] -> [1,1,1]
		for (i = 0; i < euclist.length; i++)
		{
			returnList = returnList.concat(euclist[i]);
		}
		return returnList;
	}
	else
	{
		var minVal = Math.min(numOfGroups, remainder);
		var maxVal = Math.max(numOfGroups, remainder);
		//group sub-arrays
		//for example [[1],[1],[0]] -> [[1,0],[1],[0]]
		for(i = 0; i < minVal; i++)
		{
			euclist[i] = euclist[i].concat(euclist[euclist.length - i - 1]);
		}
		//get rid of extra elements
		//for example [[1],[1],[0]] -> [[1,0],[1],[0]] -> [[1, 0],[1]]
		euclist.splice(euclist.length - minVal, minVal);
		return euclidHelp(Math.max(minVal, 0), maxVal - minVal, euclist);
	}
};

//euclid(numOf1s, numOf0s) is wrapper function 
//for euclidHelp(numOfGroups, remainder, euclist).
//It constructs an array of numOf1s [1]'s
//(array containing only the value 1), and
//numOf0s [0]'s.
var euclid = function (numOf1s, numOf0s)
{
	var euclist = [];
	var i;
	//add numOf1s 1s to euclist
	for (i = 0; i < numOf1s; i++)
	{
		//Each element of array euclist is an array to facilitate grouping
		euclist[i] = [1];
	}
	//add numOf0s 0s to euclist
	for (i = 0; i < numOf0s; i++)
	{
		euclist[i + numOf1s] = [0];
	}
	return euclidHelp(numOf1s, numOf0s, euclist);
};

//function immediately evaluates and returns a class that
//keeps track of the internal state of the program.
var euclidList = function ()
{
	//the object 'that' is what is eventially returned
	var that = {};
	var activeSlots;
	var totalSlots;
	//rhythmList is a list of 1's and 0's returned by a call to 
	//the euclid(numOf1s, numOf0s) function defined above
	var rhythmList;
	//set variables based on arguments from max
	switch(jsarguments.length)
	{
		case 3:
			activeSlots = jsarguments[1];
			totalSlots = jsarguments[2];
			break;
		case 2:
			activeSlots = jsarguments[1];
			totalSlots = jsarguments[1];
			break;
		case 1:
			activeSlots = DEFAULT_ACTIVE_SLOTS;
			totalSlots = DEFAULT_TOTAL_SLOTS;
			break;
	}
	//set initial rhythmList
	rhythmList = euclid(Math.min(activeSlots, totalSlots), (totalSlots - Math.min(activeSlots, totalSlots)))

	//method that returns the current rhythmList. rhythmList is only recomputed
	//after setActive(numActiveSlots) or setTotal(numTotalSlots) is called.
	that.getList = function ()
	{
		return rhythmList;
	};
	//sets activeSlots variable, recomputes and returns rhythmList
	that.setActive = function (numActiveSlots)
	{
		activeSlots = numActiveSlots;
		//calls Math.min(activeSlots, totalSlots) to make sure that we don't pass in negative 
		//values to euclid(). In other words, totalSlots cannot be less than activeSlots.
		rhythmList = euclid(Math.min(activeSlots, totalSlots), (totalSlots - Math.min(activeSlots, totalSlots)));
		return rhythmList;
	};
	//sets totalSlots variable, recomputes and returns rhythmList
	that.setTotal = function (numTotalSlots)
	{
		//totalSlots cannot be greater than 1024
		totalSlots = Math.max(0, Math.min(numTotalSlots, 1024));
		rhythmList = euclid(Math.min(activeSlots, totalSlots), (totalSlots - Math.min(activeSlots, totalSlots)));
		return rhythmList;
	};
	return that;
}();

//function called when an int is received from max
function msg_int(value)
{
	switch(inlet)
	{
		//left inlet, produces output from left outlet
		case 0:
			outlet(0, euclidList.setActive(value));
			break;
		//right inlet, does not produce output
		case 1:
			euclidList.setTotal(value);
			break;
	}
}

//function called when an bang is received from max
function bang()
{
	//left inlet, produces output from left outlet
	if(inlet === 0)
	{
		var finalOutput = euclidList.getList();
		outlet(0, finalOutput);
	}
}