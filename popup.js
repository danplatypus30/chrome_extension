
function addResults(data){
    document.getElementById("malware_results").innerHTML = "no malicious links";
    document.getElementById("legitimacy_results").innerHTML = data;
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    addResults("fake 25%"); //temporary put in because idw to keep calling the api
    //callapi();
});

function callapi(){
    var masterkey = "qX3ocFWaQ0d3xgFfgu84cgKb6PiJvFMoKVmeSfQGNOyKFWab1nT/oA==";
    var httpReqLink = "https://teamrev3lations.azurewebsites.net/api/python_azure?code=" + masterkey;
    //call api
    try{
        $.ajax({
            url:  httpReqLink,
            type: "GET",
            data: {
                name: "daniel",
                bodyText: "This is legit"
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
                addResults(data);
            },
            error: function (jqXHR, status) {
                // error handler
                alert("Error: " + JSON.stringify(jqXHR) + JSON.stringify);
                }
            });
    } catch (e){
        alert("cant call api " + e)
    }
}