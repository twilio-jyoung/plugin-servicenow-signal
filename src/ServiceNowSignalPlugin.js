import { FlexPlugin } from "flex-plugin";
import React from "react";

const PLUGIN_NAME = "ServicenowSignalPlugin";

export default class ServicenowSignalPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {
    // enum for types of events we need to feed to ServiceNow
    const eventType = {
      ACCEPT_TASK: "accept_task",
      COMPLETE_TASK: "complete_task"
    };

    // get the twilio runtime domain for the flex instance
    const runtimeDomain = "https://" + manager.store.getState().flex.config.serviceBaseUrl;

    // remove the panel2 in flex
    flex.AgentDesktopView.defaultProps.showPanel2 = false;

    // attach to the accept task event
    flex.Actions.addListener("beforeAcceptTask", payload => {
      payload.eventType = eventType.ACCEPT_TASK;
      return flex.Actions.invokeAction("ForwardEventToServiceNow", payload);
    });

    // attach to the complete task event
    flex.Actions.addListener("beforeCompleteTask", payload => {
      payload.eventType = eventType.COMPLETE_TASK;
      return flex.Actions.invokeAction("ForwardEventToServiceNow", payload);
    });

    // create an action to handle forwarding all events to ServiceNow through Twilio Functions
    flex.Actions.registerAction("ForwardEventToServiceNow", payload => {
      const url = runtimeDomain + "/task_event";
      const options = {
        method: "POST",
        body: JSON.stringify({
          worker: payload.task.source._worker.attributes,
          task: {
            sid: payload.task.sid,
            attributes: payload.task.attributes
          },
          eventType: payload.eventType
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };

      // Make a request to our function to pop or close the appropriate UI in ServiceNow
      fetch(url, options)
        .then(resp => resp.json())
        .then(resp => {
          console.log("////////////////////////////");
          console.log(payload.eventType);
          console.log(resp);
          console.log("////////////////////////////");
        })
        .catch(error => {
          console.log(error);
          throw error;
        });
    });

    manager.strings.TaskInfoPanelContent = `
    <h1>Customer Info</h1>
    <h2>Name</h2>
    <p>{{task.attributes.user.name}}</p>
    <h2>Title</h2>
    <p>{{task.attributes.user.title}}</p>
    <h2>Department</h2>
    <p>{{task.attributes.user.department}}</p>
    <h2>Phone</h2>
    <p>{{task.attributes.user.phone}}</p>
    <h2>Location</h2>
    <p>{{task.attributes.user.location}}</p>
    <h2>user_sys_id</h2>
    <p>{{task.attributes.user_sys_id}}</p>
    <hr />
    <h1>Task Info</h1>
    <h2>Ticket #</h2>
    <p>{{task.attributes.ticket_number}}</p>
    <h2>SID</h2>
    <p>{{task.sid}}</p>
    <h2>Channel</h2>
    <p>{{task.attributes.channelType}}</p>
    <h2>Priority</h2>
    <p>{{task.priority}}</p>
    <h2>Create Date</h2>
    <p>{{task.dateCreated}}</p>
    <hr />
    `;
  }
}
