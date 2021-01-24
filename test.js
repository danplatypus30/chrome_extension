//import axios from "node_modules/axios";

//https://teamrev3lations.azurewebsites.net/api/python_azure?code=
var masterkey = "qX3ocFWaQ0d3xgFfgu84cgKb6PiJvFMoKVmeSfQGNOyKFWab1nT/oA==";
var httpReqLink = "https://teamrev3lations.azurewebsites.net/api/python_azure?code=" + masterkey;

chrome.browserAction.onClicked.addListener(function(tab) {
    //call api
    try{
        // var response = axios.get(`${httpReqLink}`);
        // alert("yay it worked! " + response.ToString());
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
                alert("done" + JSON.stringify(data));
            },
            error: function (jqXHR, status) {
                // error handler
                alert("Error: " + JSON.stringify(jqXHR) + JSON.stringify);
                }
            });
    } catch (e){
        alert("cant call api " + e)
    }
});
