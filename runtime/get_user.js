// Name: Get User
// Path: /get_user
// Check for valid Twilio signature = CHECKED

const got = require("got");

exports.handler = function(context, event, callback) {
  let response = new Twilio.Response();

  got
    .post(context.ServiceNowScriptedAPIRootURL + "find_user_phone", {
      body: JSON.stringify({ phoneNumber: event.From }),
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
