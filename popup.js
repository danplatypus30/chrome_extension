
function addResults(data){
    //filter by those between <p> tags
    const matches = data.match(/<p>(.*?)<\/p>/g); //array of strings between ptags
    var matchesFormatted = [];
    for(var a = 0; a < matches.length; a++){
        //take out the <p> tags
        var noPtag = matches[a].toString().substr(3, matches[a].length - 7);
        // //need to take out any other html tags here, including text in between
        // const htmlStrings = noPtag.match(/<\s*[a-z]*[^>]*>(.*?)<\s*\/\s*[a-z]*>/g); //https://www.regextester.com/27540
        // if(htmlStrings != null){
        //     for(var b = 0; b < htmlStrings.length; b++){
        //         noPtag = noPtag.replace(htmlStrings[b],"");
        //     }
        // }
        //take out single tag html, like <br> <hr>
        const singlehtmltagstrings = noPtag.match(/<\s*[\/]?\s*[a-z]*[^>]*>/g);
        if(singlehtmltagstrings != null){
            for(var c = 0; c < singlehtmltagstrings.length; c++){
                noPtag = noPtag.replace(singlehtmltagstrings[c],"");
            }
        }
        noPtag = noPtag.replace(/&nbsp;/g, " ");
        matchesFormatted.push(noPtag);
    }
    document.getElementById("legitimacy_results").innerText = matchesFormatted.join(" ");
}

function addVTResults(data){
    document.getElementById("malware_results").innerHTML = data;
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    //addResults("fake 25%"); //temporary put in because idw to keep calling the api
    //callVirusTotalAPI();
    //callFakeNewsCheckerAPI();
    //callAzureAPI();
    getTextFromHtml();
});

function getTextFromHtml(){
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.executeScript(activeTab.id, {
            code: `document.body.innerHTML`,
            allFrames: false, // this is the default
            runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
            // results.length must be 1
            var result = results[0];
            addResults(result);
        });
    });
}

function callVirusTotalAPI(){
    var scan_url = "www.google.com";
    var b64_url = btoa(scan_url).replace("=","");
    var vt_api_key = "7b95432dccf2df176c906a8e2971d571a3f0863d585a9064442b6035f2553405";
    var retrieve_url = "https://www.virustotal.com/api/v3/urls/{id}".replace("{id}", b64_url);
    var results = "not called";
    //call api
    $.ajax({
        url:  retrieve_url,
        type: "GET",
        headers: {
            "X-Apikey": vt_api_key
        },
        contentType: "application/json",
        timeout: 5000,
        crossDomain : true, //mandatory
        success: function (data, status, jqXHR) {
            // data
            // "HTTP Request triggered correctly, try to add a name parameter in your request
            //  for a personalised response."
            // status "success"
            // jqXHR
            //  {"readyState":4,"responseText":"HTTP Request triggered correctly, 
            //  try to add a name parameter in your request for a personalised response.",
            //  "status":200,"statusText":"OK"}
            //alert("done" + JSON.stringify(data));
            results = JSON.parse(jqXHR.responseText)['data']['attributes']['last_analysis_stats'];
            addVTResults(JSON.stringify(results));
        },
        error: function (jqXHR, status) {
            // error handler
            addVTResults(JSON.stringify(jqXHR));
        }
    });
}

// function callAzureAPI(){
//     var masterkey = "qX3ocFWaQ0d3xgFfgu84cgKb6PiJvFMoKVmeSfQGNOyKFWab1nT/oA==";
//     var httpReqLink = "https://teamrev3lations.azurewebsites.net/api/python_azure?code=" + masterkey;
//     var urlString = "www.google.com";
//     //call api
//     try{
//         $.ajax({
//             url:  httpReqLink,
//             type: "GET",
//             data: {
//                 url: urlString
//             },
//             contentType: "application/json",
//             timeout: 5000,
//             crossDomain : true, //mandatory
//             success: function (data, status, jqXHR) {
//                 // data
//                 // "HTTP Request triggered correctly, try to add a name parameter in your request
//                 //  for a personalised response."
//                 // status "success"
//                 // jqXHR
//                 //  {"readyState":4,"responseText":"HTTP Request triggered correctly, 
//                 //  try to add a name parameter in your request for a personalised response.",
//                 //  "status":200,"statusText":"OK"}
//                 //alert("done" + JSON.stringify(data));
//                 addResults(JSON.stringify(jqXHR));
//             },
//             error: function (jqXHR, status) {
//                 // error handler
//                 addResults(JSON.stringify(jqXHR));
//             }
//         });
//     } catch (e){
//         alert("cant call api " + e)
//     }
// }

// call andre's backend AI fake news checker
//{"readyState":4,"responseText":"Real","status":200,"statusText":"success"}
function callFakeNewsCheckerAPI(){
    var fakenewsurl = "https://apollorevelation.azurewebsites.net/api";
    var dataString = {
        "data":"The dog had a lot of work to do. He was co-starring in a political ad that had to showcase the candidate’s good-natured warmth. But the ad also needed to deflect an onslaught of racialized attacks without engaging them directly, and to convey to white voters in Georgia that the Black pastor who led Ebenezer Baptist Church could represent them, too. Of course, Alvin the beagle couldn’t have known any of that when he went for a walk with the Rev. Raphael Warnock last fall as a film crew captured their time together in a neighborhood outside Atlanta. Tugging a puffer-vest-clad Mr. Warnock for an idealized suburban stroll — bright sunshine, picket fencing, an American flag — Alvin would appear in several of Mr. Warnock’s commercials pushing back against his Republican opponent in the recent Georgia Senate runoffs. In perhaps the best known spot, Mr. Warnock, a Democrat, deposits a plastic baggie of Alvin’s droppings in the trash, likening it to his rival’s increasingly caustic ads. The beagle barks in agreement, and as Mr. Warnock declares that “we” — he and Alvin — approve of the message, the dog takes a healthy lick of his goatee."
    };
    var result = "not called";
    //var data = {"name":"John", "age": 34}
    $.ajax({
        url: fakenewsurl,
        type: "POST",
        timeout: 5000,
        crossDomain : true, //mandatory
        contentType: "application/json", // this is the default value, so it's optional
        data: JSON.stringify(dataString),
        success : function(data, status, jqXHR) {
            result = jqXHR.responseText;
            addResults(result);
        },
        error: function (jqXHR, status) {
            // error handler
            result = JSON.stringify(jqXHR);
            addResults(result);
        }
    });
}