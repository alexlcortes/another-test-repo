

// Add disabled class to the search tabs.
// We only want the classes to show if we have search results.
$("li.tab").addClass("disabled");

var controler = {
	addressValue: null
};

$(document).ready(function(){
	$('.parallax').parallax();
	$(".button-collapse").sideNav();
});


//modal triggers

// Empty the articles div
$("div.articles").empty();

//modal triggers

//global tab varaiables


var counter = 0;
var url ='https://intense-inferno-5888.firebaseio.com/';
var dataRef = new Firebase(url);
var demoCounter = 1;
var repubCounter = 1;
var otherCounter = 1;

$(document).on('click','.modal-trigger',function()
{


	if($(this).data("target") == "modal1")
	{
		//firebase update
		var party = $(this).data("party");
		if ( party == "Democratic")
		{
			demoCounter++;
			dataRef.update({
				"party_democrat": demoCounter
			});
		} 
		else if ( party == "Republican")
		{
			repubCounter++;
			dataRef.update({
				"party_republican": repubCounter
			});
		}
		else 
		{
			otherCounter++;
			dataRef.update({
				"party_Other": otherCounter
			});
		}



		//Wiki search
		var searchPage = $(this).data("repsearch");
		$.getJSON('https://en.wikipedia.org/w/api.php?action=parse&page='+ searchPage+ '&prop=text&format=json&callback=?', function(json) { 
			console.log(json);
    	var printDiv = $('<div>').html(json.parse.text['*']); 
    	$(printDiv).find('img').attr("src", function(){
    			var src = $(this).attr("src");
    			return ('https:' + src);
    	});
    	$(printDiv).find('a').replaceWith(function(){
    			var text = $(this).text();
    			return text;
    	});

    	
    	$(printDiv).find(".hatnote").remove();
    	$(printDiv).find(".reference").remove();
    	$(printDiv).find(".nowrap").remove();
    	$(printDiv).find(".vertical-navbox").remove();
    	$(printDiv).find(".noprint").remove();
    	$("#wikiInfo").html(printDiv);
    	$("div[id*='toc']").nextUntil(removeEnd).remove();
    	$('#modal1').openModal();
  });
	}

	//if the #submitAddress modal is hit get address to be confirmed by user
	if($(this).data("target") == "modal2")
	{
		//do quick ajax query to ensure address is correct
		//Empty the previously displayed address info
		$("#userAddress").empty();
		//API url call info
		var url = 'https://www.googleapis.com/civicinfo/v2/representatives?';
		var apiKey = 'key=AIzaSyBYo9BM0LkbN7SIHRGcQOGrG8bhCJFW3B4';
		controler.addressValue = $("#addressInput").val();
		var address = "&address=" + controler.addressValue;

		var queryURL = url + apiKey + address;
		//Ajax call to retreive info
		$.ajax({url: queryURL, method: 'GET'}).done(function(response) {
			//Shortcut variables assigned so that data calls are truncated
			var addressResponse = response.normalizedInput;
			$("#userAddress").append(addressResponse.line1+ "<br>" + addressResponse.city + " " + addressResponse.state + " " + addressResponse.zip);
		});
		$('#modal2').openModal();
	}

});

//user filter
$(".tab").on("click" , function()
{
	var filter = $(this).data("filter");
	getCivicData(filter);	

});


//When user confirms address
$("#commenceQuery").on("click" , function()
{

	getCivicData("all");
	// We have data now, so remove the disabled class from the tabs
	$("li").removeClass("disabled");
	return false;
});

function getCivicData(filter)
{	
//API url call info
var url = 'https://www.googleapis.com/civicinfo/v2/representatives?';
var apiKey = 'key=AIzaSyBYo9BM0LkbN7SIHRGcQOGrG8bhCJFW3B4';
var address = "&address=" + controler.addressValue;

var queryURL = url + apiKey + address;
//Ajax call to retreive info
$.ajax({url: queryURL, method: 'GET'}).done(function(response) {
	//list and list item which will contain query response
	list = $("<ul>").attr("class", "collection with-header");
	var listItemHeader = $("<li>");
	console.log(response);
	//Shortcut variables assigned so that data calls are truncated
	var division = response.divisions;
	console.log(division);
	var office = response.offices;
	var official = response.officials;
	//Main header for list
	$(listItemHeader).attr("class", "collection-header listHeader");
	$(listItemHeader).append("<h4>Representatives</h4>");
	$(list).append(listItemHeader);
	//for each division in the results
		$.each(division, function(key,value)
		{
			console.log(key);
			console.log(value);

			if(filter == "federal")
			{
				if(value.name != "United States")
					return;
			}
			else if(filter == "state")
			{
				if(value.name != "Florida")
					return;
			}
			else if (filter == "local")
			{
				if(value.name == "Florida" || value.name == "United States")
					return;
			}
			else
			{

			}

			//for each office in the results
			for(var i = 0; i<value.officeIndices.length; i++ )
			{
				console.log(office[value.officeIndices[i]]);
				console.log(value.officeIndices[i]);
				//list item which will contain query response
				var listItemOffice = $("<li>");
				//for each itteration set class back to header
				$(listItemOffice).attr("class", "collection-header officeHeader center");
				//pushes headers for office names
				$(listItemOffice).append('<h4>' + office[value.officeIndices[i]].name + '</h4>');
				$(list).append(listItemOffice);
				//for each individual who holds that office
				for(var j = 0; j< office[value.officeIndices[i]].officialIndices.length; j++)
				{
					console.log(official[office[value.officeIndices[i]].officialIndices[j]]);
					console.log(office[value.officeIndices[i]].officialIndices[j]);
					var listItemRep = $("<li>");
					//sets list item elements to collection items
					$(listItemRep).attr("class", "collection-item avatar card-panel hoverable");
					//target part
					$(listItemRep).attr("data-party", official[office[value.officeIndices[i]].officialIndices[j]].party);
					//image and img properties for each representative
					var img = $("<img>");
					if(!('photoUrl' in official[office[value.officeIndices[i]].officialIndices[j]]))
					{
						$(img).attr("src", "http://placehold.it/160x200");
					}
					else
					{
						$(img).attr("src", official[office[value.officeIndices[i]].officialIndices[j]].photoUrl);
					}
					$(img).attr("class", "imgCanidates");
					$(img).css("max-height", "200px");
					$(listItemRep).append(img);

					// Div for articles
					var div = $("<div>").attr("class", "articles"+counter + " art");
					$(listItemRep).append(div);

					//span and span properties for each representative's name
					var span = $("<span>").attr("class", "title repHeader");
					$(span).append('<br>' + official[office[value.officeIndices[i]].officialIndices[j]].name);
					$(listItemRep).append(span);
					
					if ((official[office[value.officeIndices[i]].officialIndices[j]].party) == "Democratic")
					{
						$(listItemRep).append('<img id="demo" src="assets/images/DemocraticLogo.png">' + "<br>");
					}
					else if ((official[office[value.officeIndices[i]].officialIndices[j]].party) == "Republican")
					{

						$(listItemRep).append('<img id="rep" src="assets/images/republicanlogo.jpg">' + "<br>");
					}
					//social media 
					var facebook = null;
					var twitter = null;
					var youtube = null;
					if('channels.length' in official[office[value.officeIndices[i]].officialIndices[j]])
					{
						for(var z = 0; z < official[office[value.officeIndices[i]].officialIndices[j]].channels.length; z++)
						{
							if(official[office[value.officeIndices[i]].officialIndices[j]].channels[z].type == "Facebook")
							{
								facebook ==official[office[value.officeIndices[i]].officialIndices[j]].channels[z].id;
							}
							if(official[office[value.officeIndices[i]].officialIndices[j]].channels[z].type == "Twitter")
							{
								twitter ==official[office[value.officeIndices[i]].officialIndices[j]].channels[z].id;
							}
							if(official[office[value.officeIndices[i]].officialIndices[j]].channels[z].type == "YouTubes")
							{
								youtube ==official[office[value.officeIndices[i]].officialIndices[j]].channels[z].id;
							}
						}
					}

					// adding font awesome icons to candidate
					if(facebook != null)
					{
						$(listItemRep).append('<a id="faceIcon" href="http://www.facebook.com/'+ facebook +'" target="_blank"><i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i></a>');
					}
					else
					{
						$(listItemRep).append('<a id="faceIcon" href="http://www.facebook.com" target="_blank"><i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i></a>');
					}
					if(twitter != null)
					{
						$(listItemRep).append('<a id="twitterIcon" href="http://www.twitter.com/'+ twitter +'" target="_blank"><i class="fa fa-twitter-square fa-2x" aria-hidden="true"></i>');
					}
					else
					{
						$(listItemRep).append('<a id="twitterIcon" href="http://www.twitter.com" target="_blank"><i class="fa fa-twitter-square fa-2x" aria-hidden="true"></i>');
					}
					if(facebook != null)
					{
						$(listItemRep).append('<a id="youTubeIcon" href="http://www.youtube.com/'+ youtube +'" target="_blank"><i class="fa fa-youtube-play fa-2x" aria-hidden="true"></i>');
					}
					else
					{
						$(listItemRep).append('<a id="youTubeIcon" href="http://www.youtube.com" target="_blank"><i class="fa fa-youtube-play fa-2x" aria-hidden="true"></i>');
					}

					$(list).append(listItemRep);
					// Call the getArticles
					getArticles(official[office[value.officeIndices[i]].officialIndices[j]].name, counter);
					// Update the counter
					counter++;
				}
			}
		});
		//Empty the previously displayed representative info
		$("#repInfo").empty();
		//adds entire list to div
		$("#repInfo").append(list);

	});
}

dataRef.on("value", function(snapshot) {

var data = snapshot.val();
demoCounter = data.party_democrat;
console.log(demoCounter);
repubCounter = data.party_republican;
console.log(demoCounter);
otherCounter = data.party_Other;
console.log(demoCounter);

AmCharts.makeChart("chartdiv",
		{
			"type": "pie",
			"balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
			"innerRadius": "40%",
			"colors": [
				"#0000FF",
				"#FF0000",
				"#33FF00",
				"#FCD202",
				"#F8FF01",
				"#B0DE09",
				"#04D215",
				"#0D8ECF",
				"#0D52D1",
				"#2A0CD0",
				"#8A0CCF",
				"#CD0D74",
				"#754DEB",
				"#DDDDDD",
				"#999999",
				"#333333",
				"#000000",
				"#57032A",
				"#CA9726",
				"#990000",
				"#4B0C25"
			],
			"titleField": "category",
			"valueField": "column-1",
			"theme": "none",
			"allLabels": [],
			"balloon": {},
			"titles": [],
			"dataProvider": [
				{
					"category": "Democratic",
					"column-1": demoCounter
				},
				{
					"category": "Republican",
					"column-1": repubCounter
				},
				{
					"category": "Other",
					"column-1": otherCounter
				}
			]
		}
	);
	
});

// This function is for the voice recognition
function startDictation() {
 
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
 
      var recognition = new webkitSpeechRecognition();
 
      recognition.continuous = false;
      recognition.interimResults = false;
 
      recognition.lang = "en-US";
      recognition.start();
 
      recognition.onresult = function(e) {
        document.getElementById('addressInput').value
                                 = e.results[0][0].transcript;
        recognition.stop();
       //document.getElementById('labnol').submit();
      };
 
      recognition.onerror = function(e) {
      	console.log(e);
        recognition.stop();
      }
 
    }
}

function getArticles(candidateName, counter) {
	console.log("candidateName: "+candidateName);
	// Split name
	var candidateNameArray = candidateName.split(" ");
	var firstName = candidateNameArray[0];
	var lastName = candidateNameArray[1];

	// Number of days to go back in time to get the articles
	var days = 3;
	//completely fresh API key
	//var apiKey = "19f613fb974376f0c88ac48da3603e4273457e39";
	// Richard's API Key
	//var apiKey = "7fb6488ed8a21e2f195e86044da7b925de2c18c3";
	// Alex's API Key
	//var apiKey = "f0faba359d051da2cbcc649312e730f4722257f7";
	// Jonathan's API Key
	var apiKey = "853f8322566373ed7568a226d8366b34bc8aeb6b";
	
 	var queryURL = "https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey="+apiKey+"&outputMode=json&start=now-"+days+"d&end=now&count=5&q.enriched.url.enrichedTitle.keywords.keyword.text="+firstName+"+"+lastName+"&return=enriched.url.url,enriched.url.title";
	
	$.ajax({
	        url: queryURL,
	        method: 'GET'
	    })           
	.done(function(response) {
		 console.log(response);  
		 var test = 'result' in response;
		 var docsLength;
		 console.log(!test);
		 if(!test)
		 {
		 	docsLength = 0;
		 }
		 else if(!('docs' in response.result))
		 {
		 	docsLength = 0;
		 }
		 else
		 {
		 	docsLength = response.result.docs.length;  
		 }
		 var docDifference = 0;
		 var placeHolderText = "Article not available . . . ";
		 if(docsLength < 5)
		 {
		 	docDifference = 5 - docsLength;
		 }
		 console.log(docsLength);
		 console.log(docDifference);
		for (var i = 0; i < docsLength; i++)
		{
			var url = response.result.docs[i].source.enriched.url.url;
	        var title = response.result.docs[i].source.enriched.url.title;
	        if (title.length > 60)
	        {
	        	title = title.substring(0, 59);
	        	title += " . . . ";
	        }
            var hostname = $('<a>').prop('href', url).prop('hostname');
	        $(".articles"+counter).append("<p><a href='"+url+"' class='articleA' target=\"_blank\">"+title+"</a></p>");            
		}
		for(var i = 0; i <= docDifference; i++)
        {
        	$(".articles"+counter).append("<p><a href='#' class='articleA' target=\"_blank\">"+placeHolderText+"</a></p>"); 
        }  
		$(".articles"+counter).append('<a class="waves-effect waves-light btn blue darken-2 modal-trigger" id="submitAddress" href="#modal1" data-repsearch="'+ candidateName +'" data-target="modal1">More Info</a>');
		return false;
	});
}