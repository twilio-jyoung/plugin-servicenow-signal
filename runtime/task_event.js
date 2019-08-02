// Name: Task Event
// Path: /task_event
// Check for valid Twilio signature = UNCHECKED!

const got = require("got");

exports.handler = function(context, event, callback) {
  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  got
    .post(context.ServiceNowScriptedAPIRootURL + "status_v2", {
      body: JSON.stringify(event),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(context.ServiceNowUsername + ":" + context.ServiceNowPassword).toString("base64")
      },
      json: true
    })
    .then(function(data) {
      response.appendHeader("Content-Type", "application/json");
      response.setBody(data.body);
      callback(null, response);
    })
    .catch(function(error) {
      response.appendHeader("Content-Type", "plain/text");
      response.setBody(error.message);
      response.setStatusCode(500);
      callback(response);
    });
};
