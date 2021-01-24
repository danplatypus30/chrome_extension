//import axios from "node_modules/axios";

chrome.browserAction.onClicked.addListener(function(tab) {
    alert("hey you clicked the cute ghost!");
});

//https://teamrev3lations.azurewebsites.net/api/python_azure?code=
var masterkey = "qX3ocFWaQ0d3xgFfgu84cgKb6PiJvFMoKVmeSfQGNOyKFWab1nT/oA==";
var httpReqLink = "https://teamrev3lations.azurewebsites.net/api/python_azure?code=" + masterkey;

//call api
try{
    // var response = axios.get(`${httpReqLink}`);
    // alert("yay it worked! " + response.ToString());
    $.ajax({
        url:  httpReqLink,
        type: "GET",
        username: user,
        password: pass,
        contentType: "application/json",
        timeout: 5000,
        accepts:"application/json",
        dataType:"json",
        crossDomain : true, //mandatory
        success: function (data, status, jqXHR) {
        },
        error: function (jqXHR, status) {
            // error handler
            alert("Error: "+status);
            }
        });
} catch (e){
    alert("cant call api " + e)
}