//code by http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first & Lzbk (%%quizzyear%%)
// Licensed under the MIT license
// version: %%quizzversion%%

	/*
	 * takes the content of a JSON file interprets it and 
	 * returns it when synchronous or calls success(JSON content)
	 */

var Util = {
	loadJSON: function (url, async, success){			
		var theJSON;
		/**/window.alert('using jquery');
		if(typeof async === "undefined"){
			async = false;//in our context, we need it now
		}
		if(async === false){
			success = function(data){theJSON = data;};
		}
		if(typeof success !== "function"){
			success = function(){null;};
		}
		$.ajax({url: url,
			dataType: "json",
			async: async,
			success: success});
		if(async === false){
			return theJSON;
		}
	},
    test: function(){
        window.alert('testOK');
    }
};
