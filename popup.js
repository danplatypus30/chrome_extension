
function addResults(data){
    var ifFake = "The website contains fake news";
    var ifFakeExp = "Our machine learning algorithm has detected fake news on this website";
    var ifReal = "This website is safe";
    var ifRealExp = "Nothing wrong has been detected by our algorithms";
    var legitimacy = false;
    legitimacy = true;
    if(legitimacy){
        document.getElementById("legitimacy_results").innerText = ifReal;
        document.getElementById("legitimacy_results_exp").innerText = ifRealExp;
    } else {
        document.getElementById("legitimacy_results").innerText = ifFake;
        document.getElementById("legitimacy_results_exp").innerText = ifFakeExp;
    }
}

function addVTResults(data){
    var ifFake = "The website is associated with malicious websites";
    var ifFakeExp = "VirusTotal has detected malicious presence on this website";
    var ifReal = "This website is safe";
    var ifRealExp = "Nothing wrong has been detected by VirusTotal"
    var malicious = false;
    malicious = true;
    if(malicious){
        document.getElementById("malware_results").innerText = ifReal;
        document.getElementById("malware_results_exp").innerText = ifRealExp;
    } else {
        document.getElementById("malware_results").innerText = ifFake;
        document.getElementById("malware_results_exp").innerText = ifFakeExp;
    }
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    //addResults("fake 25%"); //temporary put in because idw to keep calling the api
    callVirusTotalAPI();
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
            callFakeNewsCheckerAPI(filterOutWordsFromHTML(result));
        });
    });
}

//returns formatted data
function filterOutWordsFromHTML(data){
    //only works if news page uses p tags
    //filter by those between <p> tags
    const matches = data.match(/<p(\s[^>]*)?>(.*?)<\s*\/\s*p>/g); //array of strings between <p> or <p class="dfsfd"> tags
    var matchesFormatted = [];
    for(var a = 0; a < matches.length; a++){
        var noPtag = matches[a].toString();
        //take out all the html tags
        noPtag = noPtag.replace(/<\s*[\/]?\s*[a-z]*[^>]*>/g, "");
        // //need to take out any other html tags here, including text in between
        // const htmlStrings = noPtag.match(/<\s*[a-z]*[^>]*>(.*?)<\s*\/\s*[a-z]*>/g); //https://www.regextester.com/27540
        // if(htmlStrings != null){
        //     for(var b = 0; b < htmlStrings.length; b++){
        //         noPtag = noPtag.replace(htmlStrings[b],"");
        //     }
        // }
        //change tabs to space
        noPtag = noPtag.replace(/&nbsp;/g, " ");
        //remove if only consists of one word
        //if the string consists of 4 or more whitespaces
        if(noPtag.split(/\s/g).length >= 4){
            matchesFormatted.push(noPtag);
        } 
    }
    return matchesFormatted.join(" ");
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
function callFakeNewsCheckerAPI(textToCheck){
    var fakenewsurl = "https://apollorevelation.azurewebsites.net/api";
    var dataString = {
        "data": textToCheck
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