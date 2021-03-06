
function addResults(data){
    if(data != "error"){
        var ifFake = "The website contains fake news";
        //var ifFakeExp = "Our machine learning algorithm has detected fake news on this website";
        var ifFakeExp = "We advise you NOT to continue visiting this website";
        var ifReal = "This website is safe";
        var ifRealExp = "Nothing wrong has been detected by our algorithms";
        var legitimacy = false;
        if(data == "Real"){
            legitimacy = true;
        }
        if(legitimacy){
            document.getElementById("legitimacy_results").innerText = ifReal;
            document.getElementById("legitimacy_results_exp").innerText = ifRealExp;
        } else {
            document.getElementById("legitimacy_results").innerText = ifFake;
            document.getElementById("legitimacy_results_exp").innerText = ifFakeExp;
        }
    } else {
        document.getElementById("legitimacy_results").innerText = "We are unable to detect any information";
        //document.getElementById("legitimacy_results_exp").innerText = "We are unable to detect any information";
    }
}

function addVTResults(data){
    //more than 5 hits on malicious we will mark as fake
    //sample output
    //{"harmless":75,"malicious":0,"suspicious":0,"timeout":0,"undetected":8}
    //for azure api, new sample output
    //{"maldomain_result": false, "whois_result": false, "vt_result": {"harmless": 76, "malicious": 0, "suspicious": 0, "timeout": 0, "undetected": 7}, "puny_result": false}
    var malicioushits = JSON.parse(data).malicious;
    var ifFake = "We have detected a malicious presence on this website";
    var ifFakeExp = "There are " + malicioushits + " engines that detected this website as malicious, we advise you not to visit this website";
    var ifReal = "This website is safe";
    var ifRealExp = "Nothing wrong has been detected by our malicious detection algorithms"
    var malicious = false;
    //if(malicioushits > 0){
    //    malicious = true
    //}
    if(!malicious){
        document.getElementById("malware_results").innerText = ifReal;
        document.getElementById("malware_results_exp").innerText = data;
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
    //callVirusTotalAPI();
    //callFakeNewsCheckerAPI();
    callAzureAPI();
    try{
        getTextFromHtml();
    } catch (e) {
        addResults("error");
    }
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
    try{
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
    }catch(e){
        return e;
    }
}

function callVirusTotalAPI(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var scan_url = tabs[0].url;
        var b64_url = btoa(scan_url).toString().replace(/[=]/g,"");
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
    );
}

function callAzureAPI(){
    var funckey = "y/cfuUUQAjm6ZD1Y5zvqa1gqvOlun3K3aiA1/5Fdv/OpUu0tnXVhiA==";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var scan_url = tabs[0].url;
        //var scan_url = "www.channelnewsasia.com";
        var httpReqLink = "https://teamrev3lations.azurewebsites.net/api/domaincheck?code=" + funckey + "&url=" + scan_url;
        //call api
        try{
            $.ajax({
                url:  httpReqLink,
                type: "POST",
                // data: {
                //     url: scan_url
                // },
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
                    // {"readyState":4,
                    // "responseText":"{\"maldomain_result\": false, \"whois_result\": false, 
                    // \"vt_result\": {\"harmless\": 76, \"malicious\": 0, \"suspicious\": 0, \"timeout\": 0, \"undetected\": 7}, 
                    // \"puny_result\": false}","status":200,"statusText":"OK"}
                    
                    addVTResults(jqXHR.responseText);
                },
                error: function (jqXHR, status) {
                    // error handler
                    addVTResults(JSON.stringify(jqXHR));
                }
            });
        } catch (e){
            alert("cant call api " + e)
        }
    });
}

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