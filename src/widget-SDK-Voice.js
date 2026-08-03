import { Desktop } from "@wxcc-desktop/sdk";
//import Calling from '@webex/calling';

const template = document.createElement("template");
var loaded = false;

function customLog(msg, args, logNameSuffix){
  let logName = "cc-widget-logger:"
  if(logNameSuffix){
    logName += logNameSuffix + ":";
  } else {
    logName += "default:";
  }
  if(args){
    console.log(logName+ msg, args);  
  } else {
    console.log(logName, msg);
  }
}

template.innerHTML = `
  <style>

  .loading-icon {
    width: 30px;
    left: 50%;
    position: relative;
    transform: translateX(-50%);
  }

  .button-loading-icon {
    position: relative;
    width: 20px;
    left: 45px;
    top: 3px;
    /*transform: translate(-45px, 5px);*/
  }

  .invisible {
    visibility: hidden;
  }

  .hidden {
    display:none;
  }

  .result-span {
    text-align:center;
    display:block;
    min-height: 24px;
  }

  .fieldset {
    width: 550px;
    border-radius: 5px;
    max-height:675px;
    overflow:scroll;
  }

  .button{
    display: block;
    border-radius: 5px;
    background: #064157;
    color: white;
    padding: 4px;
    margin-top: 10px;
    width: 100%;
    border: none;
    transition:.3s;
  }

  button:disabled,
  button[disabled]{
    border: 1px solid #999999;
    background-color: #cccccc;
    color: #666666;
  }
  
  input{
    border-top: none;
    border-right: none;
    border-left: none;
    border-color: #DDDDDD;
    border-width: 1.5px;
    color: #005E7D
  }

  *:focus {
    outline: none;
  }

  button:hover:enabled{
    cursor: pointer;
  }

  table {
    margin-top:10px;
  }

  h4 {
    margin:0px;
  }

  p {
    margin:0px;
  }

  .faded {
    color: #888;
  }

  .column-one {
    padding-right: 30px;
  }

  .origin-cell {
    height:30px; /*this keeps our sizing when the claim buttons disappear*/
  }

  .card {
    /* Add shadows to create the "card" effect */
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transform: translateX(-100%); /* Start off-screen to the left */
    opacity: 0;
    transition: transform 0.5s ease-out, opacity 0.5s ease-out;
    /* transition: 0.3s; */
    border-radius: 5px; /* 5px rounded corners */
  }

  .card.animate {
    transform: translateX(0); /* Slide in to its final position */
    opacity: 1;
  }

  /* On mouse-over, add a deeper shadow */
  /* .card:hover {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  } */

  /* Add some padding inside the card container */
  .container {
    padding: 2px 16px;
  }
 
  .flat-rounded-button {
    background-color: #6aeb6a; /* Flat background color */
    color: white; /* Text color */
    border: none; /* Remove default border for a flat look */
    padding: 5px 15px; /* Adjust padding as needed */
    border-radius: 8px; /* Rounded corners */
    font-size: 16px;
    cursor: pointer; /* Indicate interactivity */
    transition: background-color 0.3s ease; /* Smooth transition on hover */
    margin-left: 10px;
  }

  .flat-rounded-button:hover:enabled {
    background-color: #59c959; /* Darker background on hover */
  }

  .flat-rounded-button:active:enabled {
    background-color: #459945; /* Even darker background on click */
  }

  .flat-rounded-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .flat-rounded-conference-button {
    background-color: #0d6efd; /* Blue-ish color */
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease, opacity 0.3s ease;
    margin-left: 10px;
  }

  .flat-rounded-conference-button:hover:enabled {
    background-color: #0b5ed7; /* Darker blue on hover */
  }

  .flat-rounded-conference-button:active:enabled {
    background-color: #0a58ca; /* Even darker blue on click */
  }

  .flat-rounded-conference-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-container {
    display: inline-block;
    margin-right: 15px; /* Adjust spacing as needed */
  }

  #mainContainer {
    display: flex;
    gap: 20px;
  }

  #merge-panel {
    min-width: 250px;
    max-width: 300px;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    background-color: white;
    align-self: flex-start;
  }

  #merge-panel h3 {
    margin-top: 0;
    color: #064157;
    font-size: 18px;
  }

  #merge-panel .merge-info {
    margin: 15px 0;
    padding: 10px;
    background-color: #f0f8ff;
    border-radius: 5px;
    border-left: 3px solid #064157;
  }

  #merge-panel .merge-info label {
    font-weight: bold;
    color: #064157;
    font-size: 12px;
    display: block;
    margin-bottom: 5px;
  }

  #merge-panel .merge-info .number {
    font-size: 16px;
    color: #005E7D;
    font-weight: 600;
  }

  #merge-button {
    width: 100%;
    background-color: #6aeb6a;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }

  #merge-button:hover:enabled {
    background-color: #59c959;
  }

  #merge-button:active:enabled {
    background-color: #459945;
  }

  #merge-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #cccccc;
  }

  </style>

    <div id="mainContainer">
      <div>
        <div id="main-fieldset" class="fieldset">
          <div>
            <img id="loading-icon" src="${process.env.HOST_URI}/img/loading-1.gif" class="loading-icon"/>
            <div id="queue-content" style="display:none;">
              <div class="checkbox-container">
                <input class="checkbox-input" type="checkbox" id="queued" name="queued" value="queued" checked>
                <label for="queued">Queued</label>
              </div>
              <div class="checkbox-container">
                <input class="checkbox-input" type="checkbox" id="assigned" name="assigned" value="assigned" checked>
                <label for="assigned">Assigned</label>
              </div>
              <div class="checkbox-container">
                <input class="checkbox-input" type="checkbox" id="abandoned" name="abandoned" value="abandoned" checked>
                <label for="abandoned">Abandoned</label>
              </div>
              <div class="checkbox-container">
                <input class="checkbox-input" type="checkbox" id="completed" name="completed" value="completed" checked>
                <label for="completed">Completed</label>
              </div>
              <div id="my-queue"></div>
            </div>
            <span id="result-span" class="result-span"></span>
          </div>
        </div>
      </div>
      <div id="merge-panel" class="invisible">
        <h3>Merge Calls</h3>
        <div class="merge-info">
          <label>Caller Number:</label>
          <div class="number" id="merge-caller-number">-</div>
        </div>
        <button id="merge-button">Merge</button>
      </div>
    </div>
`;

//Creating a custom logger
const logger = Desktop.logger.createLogger("cc-widget-logger");

var initResult = false;
var queueTasks = {};
var callerIds = {};
var queueStatuses = ["queued", "assigned", "abandoned", "completed"];
var agentIsOnCall = false;
var socket;
var currentCall;
var previousCall;
var previousCallNumber;
var trackedTransferPayload;
var showMergePanel = false;
var mergeAwaitingReturnCall = false;
var mergeSecondCallId = null;
var mergeTimeoutId = null;
var currentWidgetInstance = null;
var conferenceTransferredTaskIds = new Set();
var desktopListenersRegistered = false;
var taskPollIntervalId = null;
var buttonSyncIntervalId = null;

function getCookie(name) {
  if (typeof Cookies === 'undefined') return undefined;
  return Cookies.get(name);
}

function setCookie(name, value) {
  if (typeof Cookies === 'undefined') return;
  Cookies.set(name, value);
}

function registerDesktopEventListeners() {
  if (desktopListenersRegistered) return;
  desktopListenersRegistered = true;

  Desktop.agentStateInfo.addEventListener('updated', (contact) => {
    customLog('New state updated received:', contact);
  });

  Desktop.agentContact.addEventListener('eAgentOfferContact', (contact) => {
    const widget = currentWidgetInstance;
    if (!widget) return;
    customLog('New eAgentOfferContact received:', contact);
    const taskId = contact.data.interactionId;
    const loadingIcon = widget.shadowRoot.getElementById(taskId + '-loading');
    if (loadingIcon) loadingIcon.classList.add('invisible');
  });

  Desktop.agentContact.addEventListener('eAgentContactAssigned', (contact) => {
    customLog('Agent answered call - enabling Conference buttons');
    currentWidgetInstance?.updateButtonStates(true);
  });

  Desktop.agentContact.addEventListener('eAgentContactEnded', (contact) => {
    customLog('Agent call ended - disabling Conference buttons');
    currentWidgetInstance?.updateButtonStates(false);
  });

  Desktop.agentContact.addEventListener('eAgentWrapup', (contact) => {
    customLog('Agent entered wrapup - disabling Conference buttons');
    currentWidgetInstance?.updateButtonStates(false);
  });

  Desktop.agentContact.addEventListener('eContactEnded', (contact) => {
    customLog('Contact ended - disabling Conference buttons');
    currentWidgetInstance?.updateButtonStates(false);
  });
}

async function postTransferCache(payload) {
  const endpoint = payload.command === 'transfer-merge' ? '/transfer-merge' : '/transfer-hold-init';
  try {
    const resp = await fetch(`${process.env.HOST_URI}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    customLog(`${endpoint} HTTP status:`, resp.status);
    return resp.ok;
  } catch (err) {
    customLog(`${endpoint} HTTP failed:`, err);
    return false;
  }
}

async function runTelephonyConference(secondCallId, heldCallId) {
  const callingToken = Desktop.agentContact.SERVICE.webexCalling.getAccessTokenFunc();
  customLog('Starting telephony conference:', { secondCallId, heldCallId });
  const conferenceResponse = await fetch('https://webexapis.com/v1/telephony/conference', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${callingToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      callIds: [secondCallId, heldCallId]
    })
  });

  if (conferenceResponse.ok) {
    customLog('Conference started successfully');
    if (currentWidgetInstance) {
      currentWidgetInstance.finishConferenceMerge();
    } else {
      mergeAwaitingReturnCall = false;
      mergeSecondCallId = null;
      showMergePanel = false;
      trackedTransferPayload = null;
      previousCallNumber = null;
    }
    return true;
  }

  customLog(`Error starting conference: ${conferenceResponse.status} ${conferenceResponse.statusText}`);
  try {
    customLog(await conferenceResponse.json());
  } catch (_) { /* ignore */ }
  return false;
}

function clearMergeWaitTimeout() {
  if (mergeTimeoutId) {
    clearTimeout(mergeTimeoutId);
    mergeTimeoutId = null;
  }
}

function scheduleMergeWaitTimeout() {
  clearMergeWaitTimeout();
  mergeTimeoutId = setTimeout(() => {
    if (!mergeAwaitingReturnCall) return;
    customLog('Merge timed out — held caller never returned to agent');
    mergeAwaitingReturnCall = false;
    mergeSecondCallId = null;
    if (currentWidgetInstance) {
      currentWidgetInstance.updateResultSpan(
        'Merge timed out waiting for held caller. Check CallMerge flow /transfer-hold URL and server replica count.',
        'red'
      );
      const mergeButton = currentWidgetInstance.shadowRoot?.getElementById('merge-button');
      if (mergeButton) mergeButton.disabled = false;
    }
  }, 45000);
}

function addOrReplaceEventListener(element, eventName, newListener) {
  // Check if an event listener with the same name already exists
  const hasExistingListener = element.hasOwnProperty(`_${eventName}Listener`);
  if (hasExistingListener) {
    element.removeEventListener(eventName, element[`_${eventName}Listener`]);
  }
  element.addEventListener(eventName, newListener);
  // Store the new listener for future replacement
  element[`_${eventName}Listener`] = newListener;
}

function capitalizeFirstLetter(string) {
  if (typeof string !== 'string' || string.length === 0) {
    return string; // Handle empty strings or non-string inputs
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function makeStringTime(epochTime){
  const millisecondDiff = Date.now() - epochTime;
  const seconds = Math.floor(millisecondDiff / 1000);
  const minutes = Math.round(seconds/60);
  return `${minutes}m`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getInteractionIdFromContact(contact) {
  return contact?.data?.interactionId ?? contact?.interactionId ?? null;
}

function taskMapHasInteraction(taskMap, interactionId) {
  for (const [, task] of taskMap) {
    if (task.interactionId === interactionId) return true;
    if (task.interaction?.interactionId === interactionId) return true;
  }
  return false;
}

// Wait until WxCC puts the agent into wrap-up after transfer (call disconnected, channel still busy).
function waitForAgentWrapupStart({ timeoutMs = 15000, interactionId } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for wrap-up to start`));
      }
    }, timeoutMs);

    const onWrapup = (contact) => {
      const id = getInteractionIdFromContact(contact);
      customLog('waitForAgentWrapupStart: eAgentWrapup', id);
      if (id === interactionId && !settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve('eAgentWrapup');
      }
    };

    Desktop.agentContact.addEventListener('eAgentWrapup', onWrapup, { once: true });
  });
}

// Wait until the agent voice channel is free (202 != completed).
function waitForAgentChannelFree({ timeoutMs = 30000, interactionId = null } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let pollId;
    let timeoutId;

    const finish = (reason) => {
      if (settled) return;
      settled = true;
      clearInterval(pollId);
      clearTimeout(timeoutId);
      customLog('waitForAgentChannelFree resolved:', reason);
      resolve(reason);
    };

    const fail = (message) => {
      if (settled) return;
      settled = true;
      clearInterval(pollId);
      clearTimeout(timeoutId);
      reject(new Error(message));
    };

    const channelIsFree = async () => {
      const taskMap = await Desktop.actions.getTaskMap();
      customLog(`waitForAgentChannelFree: taskMap.size=${taskMap.size}`);
      if (taskMap.size === 0) return true;
      if (interactionId && !taskMapHasInteraction(taskMap, interactionId)) return true;
      return false;
    };

    const onReleased = (contact, eventName) => {
      const id = getInteractionIdFromContact(contact);
      customLog(`waitForAgentChannelFree: ${eventName}`, id);
      if (!interactionId || id === interactionId) {
        channelIsFree().then(free => { if (free) finish(eventName); });
      }
    };

    Desktop.agentContact.addEventListener('eAgentContactEnded', (c) => onReleased(c, 'eAgentContactEnded'), { once: true });
    Desktop.agentContact.addEventListener('eAgentWrapup', (c) => onReleased(c, 'eAgentWrapup'), { once: true });
    Desktop.agentContact.addEventListener('eContactEnded', (c) => onReleased(c, 'eContactEnded'), { once: true });

    channelIsFree().then(free => { if (free) finish('alreadyFree'); });

    pollId = setInterval(async () => {
      if (await channelIsFree()) finish('taskMapPoll');
    }, 200);

    timeoutId = setTimeout(
      () => fail(`Timed out after ${timeoutMs}ms waiting for agent channel to free`),
      timeoutMs
    );
  });
}

async function assignTaskWithRetry(widget, taskId, { maxAttempts = 6, delayMs = 1000, confirmDelayMs = 500 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    customLog(`assignTaskWithRetry attempt ${attempt}/${maxAttempts} for ${taskId}`);
    const result = await widget.assignTask(taskId);
    if (!result.ok) {
      customLog(`assignTask HTTP error: ${result.status}`);
      if (attempt < maxAttempts) await sleep(delayMs);
      continue;
    }
    await sleep(confirmDelayMs);
    const taskMap = await Desktop.actions.getTaskMap();
    if (taskMapHasInteraction(taskMap, taskId)) {
      customLog(`assignTaskWithRetry succeeded on attempt ${attempt}`);
      return { ok: true, attempt };
    }
    customLog(`assignTaskWithRetry: task ${taskId} not on agent yet, retrying...`);
    if (attempt < maxAttempts) await sleep(delayMs);
  }
  return { ok: false };
}


function normalizePhoneNumber(num) {
  if (!num) return '';
  return String(num).replace(/\D/g, '');
}

function phoneNumbersMatch(a, b) {
  const na = normalizePhoneNumber(a);
  const nb = normalizePhoneNumber(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 10 && nb.length >= 10 && na.slice(-10) === nb.slice(-10)) return true;
  return false;
}

async function getCallerIds(taskIds){
  customLog("getCallerIds:");
  customLog(taskIds);
  const resp = await fetch(`${process.env.HOST_URI}/callerIds`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      taskIds
    })
  });
  customLog(`getCallerIds.status:${resp.status}`);
  let json = await resp.json();
  customLog(json);
  return json;
}


class myDesktopSDK extends HTMLElement {
  constructor() {
    super();

    const font = document.createElement("link");
    font.href = "https://fonts.googleapis.com/css2?family=Cutive+Mono&family=Darker+Grotesque:wght@300&family=Poppins:wght@200;400&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    const cookieSDK = document.createElement("script");
    cookieSDK.src = "https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js";
    document.head.appendChild(cookieSDK);

    const socketIOSDK = document.createElement("script");
    socketIOSDK.src = `${process.env.HOST_URI}/socket.io.min.js`;
    let self = this;
    socketIOSDK.onload = function(){
        customLog("loaded socket.io.min.js");
        socket = io(process.env.HOST_URI,{
            withCredentials: true,
              auth: {
                "agentId": Desktop.agentContact.SERVICE.conf.profile.agentId,
                "agentName": Desktop.agentContact.SERVICE.conf.profile.agentName,
                "agentMailId": Desktop.agentContact.SERVICE.conf.profile.agentMailId,
                "orgId": Desktop.agentContact.SERVICE.conf.profile.orgId
              }
          });

          
          socket.on('connect', (msg) => {
            customLog("socket connected!");
          });

          socket.on('disconnect', (msg) => {
            customLog("socket disconnected!");
          });

          socket.on('message', (msg) => {
            customLog("socket message:");
            customLog(msg);
            if(msg.InteractionId){
              callerIds[msg.InteractionId] = msg;
              const convertTask = {
                status: "created", origin: msg.ANI, queue: {name: msg.DNIS},
                createdTime: Date.now(), lastUpdatedTime: Date.now()
              }
              if(!queueTasks.hasOwnProperty(msg.InteractionId)){
                queueTasks[msg.InteractionId] = convertTask;
                window.queueTasks = queueTasks;
              }
              self.addTask(msg.InteractionId, convertTask);
            }
          });
        customLog("finished loading socket.io")
    }
    document.head.appendChild(socketIOSDK);

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    customLog("attached shadow");
    window.shadowRoot = this.shadowRoot;
    this.interactionId = null;
  }

  async claimButtonClick(self, event){
    try{
      customLog("claimButtonClicked:");
      customLog(event);
      let taskId = event.id.split("-button")[0];
      const claimButton = this.shadowRoot.getElementById(event.id);
      const loadingIcon = this.shadowRoot.getElementById(taskId+"-loading");
      
      claimButton.style.display = "none";
      loadingIcon.classList.remove("invisible");
      customLog(taskId);
      
      setTimeout(function(){
        loadingIcon.classList.add("invisible");
        try{
          customLog(`status of ${taskId} after claim:`)
          const taskStatus = queueTasks[taskId]?.status;
          customLog(taskStatus);
          if(taskStatus && ["queued", "created"].indexOf(taskStatus) >= 0){
            claimButton.style.display = agentIsOnCall ? "none" : "inline-block";
          }
        }catch(ex){
          customLog("claimButton Timeout error:");
          customLog(ex);
          claimButton.style.display = agentIsOnCall ? "none" : "inline-block";
        }
      },10000);
      await self.assignTask(taskId);
    }catch(e){
      customLog("claimButtonClicked Error:");
      customLog(e);
    }
  }

  async conferenceButtonClick(self, event){
    try{
      customLog("conferenceButtonClick:");
      customLog(event);
      let taskId = event.id.split("-conference-button")[0];
      const conferenceButton = this.shadowRoot.getElementById(event.id);
      const loadingIcon = this.shadowRoot.getElementById(taskId+"-loading");
      
      conferenceButton.style.display = "none";
      loadingIcon.classList.remove("invisible");
      customLog(taskId);
      
      setTimeout(function(){
        loadingIcon.classList.add("invisible");
        try{
          customLog(`status of ${taskId} after conference click:`)
          const taskStatus = queueTasks[taskId]?.status;
          customLog(taskStatus);
          if(taskStatus && ["queued", "created"].indexOf(taskStatus) >= 0){
            conferenceButton.style.display = agentIsOnCall ? "inline-block" : "none";
          }
        }catch(ex){
          customLog("conferenceButton Timeout error:");
          customLog(ex);
          conferenceButton.style.display = agentIsOnCall ? "inline-block" : "none";
        }
      },10000);
      const interaction = await this.getInteraction();
      customLog(interaction);
      customLog("interaction.contactDirection.type:", interaction.contactDirection?.type);
      var trackNumber = interaction.callAssociatedDetails.ani;
      if(interaction.contactDirection?.type === "OUTBOUND"){
        trackNumber = interaction.callAssociatedDetails.dn;
      }
      customLog("interaction trackNumber:", trackNumber);
      const transferTaskId = interaction.interactionId;
      trackedTransferPayload = {
        command: "transfer-hold",
        owner: interaction.owner,
        transferTaskId: transferTaskId,
        number: trackNumber,
        agentNumber: window.agentDetails?.extension,
        direction: interaction.contactDirection
      };
      await postTransferCache(trackedTransferPayload);
      socket.emit("message", trackedTransferPayload);
      previousCallNumber = trackNumber;
      
      // Show merge panel
      showMergePanel = true;
      const mergePanel = self.shadowRoot.getElementById('merge-panel');
      const mergeCallerNumber = self.shadowRoot.getElementById('merge-caller-number');
      if (mergePanel && mergeCallerNumber) {
        mergeCallerNumber.textContent = trackNumber;
        mergePanel.classList.remove('invisible');
      }
      const transferResult = await self.transferTask(process.env.TRANSFER_NUMBER, transferTaskId);
      if (!transferResult.ok) {
        customLog('conferenceButtonClick: transfer failed, aborting');
        self.updateResultSpan('Conference failed: transfer rejected', 'red');
        return;
      }

      // First call is in transfer queue — hide its action buttons for the rest of the conference flow.
      self.deactivateConferenceTaskCard(transferTaskId, 'transferred');

      // Transfer triggers ACW; force wrap-up via API to skip the Desktop auto-wrap-up timer (~4s).
      try {
        await waitForAgentWrapupStart({ timeoutMs: 10000, interactionId: transferTaskId });
      } catch (wrapStartErr) {
        customLog('conferenceButtonClick: wrap-up start wait timed out, forcing wrap-up anyway');
        customLog(wrapStartErr);
      }

      customLog('conferenceButtonClick: forcing wrap-up to clear ACW');
      await self.wrapUpTask(transferTaskId);

      customLog('conferenceButtonClick: waiting for agent channel to free...');
      try {
        await waitForAgentChannelFree({ timeoutMs: 15000, interactionId: transferTaskId });
      } catch (waitErr) {
        customLog('conferenceButtonClick: channel wait timed out, will retry assign anyway');
        customLog(waitErr);
      }

      const assignResult = await assignTaskWithRetry(self, taskId);
      if (!assignResult.ok) {
        customLog('conferenceButtonClick: assign failed after retries');
        self.updateResultSpan('Conference failed: could not assign second call', 'red');
        return;
      }
    }catch(e){
      customLog("conferenceButtonClick Error:");
      customLog(e);
    }
  }

  getTimestampRow(task){
    const createdAgo = makeStringTime(task.createdTime);
    const updatedAgo = makeStringTime(task.lastUpdatedTime);
    return `<td class="column-one">Age: ${createdAgo}</td><td>Last updated: ${updatedAgo}</td>`;
  }

  hideTaskActionButtons(taskId) {
    const claimButton = this.shadowRoot.getElementById(taskId + "-button");
    const conferenceButton = this.shadowRoot.getElementById(taskId + "-conference-button");
    const loadingIcon = this.shadowRoot.getElementById(taskId + "-loading");
    if (claimButton) claimButton.style.display = "none";
    if (conferenceButton) conferenceButton.style.display = "none";
    if (loadingIcon) loadingIcon.classList.add("invisible");
  }

  deactivateConferenceTaskCard(taskId, reason = 'transferred') {
    conferenceTransferredTaskIds.add(taskId);
    const card = this.shadowRoot.getElementById(taskId);
    if (card) {
      card.dataset.conferenceState = reason;
    }
    this.hideTaskActionButtons(taskId);
    const container = this.shadowRoot.getElementById(taskId + "-container");
    if (container) container.classList.add('faded');
    const statusEl = this.shadowRoot.getElementById(taskId + "-status");
    if (statusEl && reason === 'transferred') {
      statusEl.innerText = 'In conference hold';
    } else if (statusEl && reason === 'merged') {
      statusEl.innerText = 'Merged';
    }
  }

  finishConferenceMerge() {
    clearMergeWaitTimeout();
    mergeAwaitingReturnCall = false;
    mergeSecondCallId = null;
    if (trackedTransferPayload?.transferTaskId) {
      this.deactivateConferenceTaskCard(trackedTransferPayload.transferTaskId, 'merged');
    }
    showMergePanel = false;
    if (currentWidgetInstance?.shadowRoot) {
      const mergePanel = currentWidgetInstance.shadowRoot.getElementById('merge-panel');
      const mergeButton = currentWidgetInstance.shadowRoot.getElementById('merge-button');
      if (mergePanel) mergePanel.classList.add('invisible');
      if (mergeButton) mergeButton.disabled = false;
    }
    trackedTransferPayload = null;
    previousCallNumber = null;
  }


  addTask(taskId, task){
    try{
      customLog('addTask, task:', null, "task-loop");
      customLog(task, null, "task-loop");
      const card = document.createElement("div");
      card.id = taskId;
      card.dataset.updated = `${task.lastUpdatedTime}`;
      card.classList.add('card');

      const container = document.createElement("div");
      container.id = taskId+"-container";
      container.classList.add('container');
      let filterStatus = task.status;
      if(["queued", "created"].indexOf(task.status) < 0){
        container.classList.add('faded');
        card.dataset.status = task.status;
      } else {
        filterStatus = "queued";
        card.dataset.status = "queued";
      }

      const table = document.createElement("table");

      let callerName = ""
      if(callerIds[taskId]?.Headers){
        try{
          callerName = callerIds[taskId].Headers.split("caller_id_name=")[1];
          callerName = callerName.split("}")[0];
          callerName = `(${callerName})`
        } catch(ex){
          customLog('addTask callerId split error:', null, "task-loop");
          customLog(ex, null, "task-loop");
        }
      }
      const row1 = document.createElement("tr");
      row1.innerHTML = `<td class="column-one origin-cell"><h4><b>${task.origin}</b></h4></td><td><h4>${callerName}</h4></td>`
      const lastCell = document.createElement("td");
      if(["queued", "created"].indexOf(task.status) >= 0){
        let self = this;

        // Create Claim button
        const claimButton = document.createElement("button");
        claimButton.id = taskId + "-button";
        claimButton.classList.add("flat-rounded-button");
        claimButton.innerHTML = "Claim";
        claimButton.style.display = agentIsOnCall ? "none" : "inline-block";
        claimButton.addEventListener('click', async function(event){
          await self.claimButtonClick(self, this)
        });
        lastCell.appendChild(claimButton);

        // Create Conference button
        const conferenceButton = document.createElement("button");
        conferenceButton.id = taskId + "-conference-button";
        conferenceButton.classList.add("flat-rounded-conference-button");
        conferenceButton.innerHTML = "Conference";
        conferenceButton.style.display = agentIsOnCall ? "inline-block" : "none";
        conferenceButton.addEventListener('click', async function() {
          await self.conferenceButtonClick(self, this);
        });
        lastCell.appendChild(conferenceButton);

        // Single loading icon for both buttons
        const loadingImg = document.createElement("img");
        loadingImg.id = taskId+"-loading";
        loadingImg.src = `${process.env.HOST_URI}/img/loading-1.gif`;
        loadingImg.classList.add("button-loading-icon");
        loadingImg.classList.add("invisible");
        lastCell.appendChild(loadingImg);
        
      }
      row1.appendChild(lastCell);
      table.appendChild(row1);
      
      const row2 = document.createElement("tr");
      row2.innerHTML = `<td id="${taskId}-status" class="column-one">${capitalizeFirstLetter(task.status)}</td><td>${task.queue.name}</td>`;
      table.appendChild(row2);

      const row3 = document.createElement("tr");
      row3.id = taskId + "-timestamps";
      row3.innerHTML = this.getTimestampRow(task);
      table.appendChild(row3);

      container.appendChild(table);
      card.appendChild(container);

      let statusType = this.shadowRoot.getElementById(filterStatus);
      if(statusType && !statusType.checked){
        card.classList.add("hidden");
      }

      customLog(this.shadowRoot.getElementById("my-queue"), null, "task-loop");
      this.shadowRoot.getElementById("my-queue").prepend(card);
      customLog(`appended task ${taskId} to my-queue`, null, "task-loop");
      
      if(!statusType || statusType.checked){
        setTimeout(function(){
          card.classList.add('animate');
        },100);
      }

      if (conferenceTransferredTaskIds.has(taskId)) {
        this.deactivateConferenceTaskCard(taskId, card.dataset.conferenceState || 'transferred');
      }
    }catch(e){
      customLog(`addTask Error:`, null, "task-loop");
      customLog(e, null, "task-loop");
    }  
  }

  updateTask(taskId, task){
    try{
      customLog('updateTask, task:', null, "task-loop");
      customLog(task, null, "task-loop");
      const card = this.shadowRoot.getElementById(taskId);
      card.dataset.updated = `${task.lastUpdatedTime}`;

      if (conferenceTransferredTaskIds.has(taskId)) {
        this.deactivateConferenceTaskCard(taskId, card.dataset.conferenceState || 'transferred');
        this.shadowRoot.getElementById(taskId+"-timestamps").innerHTML = this.getTimestampRow(task);
        return;
      }

      this.shadowRoot.getElementById(taskId+"-status").innerText = capitalizeFirstLetter(task.status);
      this.shadowRoot.getElementById(taskId+"-timestamps").innerHTML = this.getTimestampRow(task);
      if(["queued", "created"].indexOf(task.status) < 0){
        if(task.status !== card.dataset.status){
          card.dataset.status = task.status;
          this.filterTasks();
        }
        
        this.shadowRoot.getElementById(taskId+"-container").classList.add('faded');
        let button = this.shadowRoot.getElementById(taskId+"-button");
        let loadingIcon = this.shadowRoot.getElementById(taskId+"-loading");
        let conferenceButton = this.shadowRoot.getElementById(taskId+"-conference-button");
        if(button){
          button.style.display = "none";
        }
        if(loadingIcon){
          loadingIcon.classList.add("invisible");
        }
        if(conferenceButton){
          conferenceButton.style.display = "none";
        }
      } else {
        if(task.status !== card.dataset.status){
          card.dataset.status = "queued";
          this.filterTasks();
        }
      }
    }catch(e){
      customLog("updateTask error:");
      customLog(e);
    }
  }

  removeTask(taskId){
    let card = this.shadowRoot.getElementById(taskId);
    card.classList.remove('animate');
    setTimeout(function(){
      card.remove();
    },500);
  }

  updateButtonStates(isOnCall){
    agentIsOnCall = isOnCall;
    
    // Only update buttons on cards that are still queued (active); leave deactivated cards alone
    const confButtons = this.shadowRoot.querySelectorAll('[id$="-conference-button"]');
    confButtons.forEach(button => {
      const taskId = button.id.split("-conference-button")[0];
      const card = this.shadowRoot.getElementById(taskId);
      if (!card || card.dataset.status !== "queued") return;
      if (conferenceTransferredTaskIds.has(taskId) || card.dataset.conferenceState) return;
      const loadingIcon = this.shadowRoot.getElementById(taskId + "-loading");
      if(!loadingIcon || loadingIcon.classList.contains("invisible")){
        button.style.display = isOnCall ? "inline-block" : "none";
      }
    });
    
    const claimButtons = this.shadowRoot.querySelectorAll('.flat-rounded-button');
    claimButtons.forEach(button => {
      const taskId = button.id.split("-button")[0];
      const card = this.shadowRoot.getElementById(taskId);
      if (!card || card.dataset.status !== "queued") return;
      if (conferenceTransferredTaskIds.has(taskId) || card.dataset.conferenceState) return;
      const loadingIcon = this.shadowRoot.getElementById(taskId + "-loading");
      if(!loadingIcon || loadingIcon.classList.contains("invisible")){
        button.style.display = isOnCall ? "none" : "inline-block";
      }
    });
    
    customLog(`Updated buttons: agentIsOnCall = ${isOnCall}`);
  }

  async wrapUpTask(taskId){
    customLog(`wrapUpTask taskId:${taskId}`);
    try{
      const wrapUpResp = await fetch(`https://api.wxcc-us1.cisco.com/v1/tasks/${taskId}/wrapup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.myAgentService.webex.token.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "auxCodeId": "859de2b3-9767-4b70-b380-cee9785656d5",
          "wrapUpReason": "Conference"
        })
      });
      customLog(`wrapUpResp.status:${wrapUpResp.status}`);
      return { ok: wrapUpResp.ok, status: wrapUpResp.status };
    }catch(e){
      customLog("wrapUpTask Error:");
      customLog(e);
      return { ok: false, error: e };
    }
  }

  async transferTask(extension, taskId){
    customLog(`transferTask extension:${extension}`);
    customLog(`transferTask taskId:${taskId}`); 
    try{
      const transferResp = await fetch(`https://api.wxcc-us1.cisco.com/v1/tasks/${taskId}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.myAgentService.webex.token.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "to": extension,
          "destinationType": "dialNumber"
        })
      });
      customLog(`transferResp.status:${transferResp.status}`);
      return { ok: transferResp.ok, status: transferResp.status, taskId };
    }catch(e){
      customLog("transferTask Error:");
      customLog(e);
      return { ok: false, error: e };
    }
  }

  async assignTask(taskId){
    try{
        const assignResp = await fetch(`https://api.wxcc-us1.cisco.com/v1/tasks/${taskId}/assign`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.myAgentService.webex.token.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        customLog(`assignResp.status:${assignResp.status}`);
        return { ok: assignResp.ok, status: assignResp.status };
    }catch(e){
      customLog("assignTask Error:");
      customLog(e);
      return { ok: false, error: e };
    }
  }

  async getTasks(self){
    try{
        //const pastSeconds = 1800; //1800 seconds = 30 minutes;
        const pastSeconds = 600;
        const fromEpochSeconds = Math.floor(Date.now()) - (pastSeconds * 1000);
        const tasksResp = await fetch(`https://api.wxcc-us1.cisco.com/v1/tasks?from=${fromEpochSeconds}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${window.myAgentService.webex.token.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        customLog(`tasksResp.status:${tasksResp.status}`, null, "task-loop");
        let json = await tasksResp.json();
        customLog(json, null, "task-loop");
        let tempTasks = {};
        if(json.data?.length > 0){
          let missingCallerIdTasks = [];
          for(let i of json.data){
            tempTasks[i.id] = i.attributes;
            if(!callerIds.hasOwnProperty(i.id)){
              missingCallerIdTasks.push(i.id);
            }
          }
          if(missingCallerIdTasks.length > 0){
            let newCallerIds = await getCallerIds(missingCallerIdTasks);
            customLog("newCallerIds:");
            customLog(newCallerIds);
            for(let j of newCallerIds){
              callerIds[j.InteractionId] = j;
            }
            window.callerIds = callerIds;
          }

          customLog('tempTasks', null, "task-loop");
          customLog(tempTasks, null, "task-loop");

          for(let task of Object.keys(tempTasks)){
            let existingCard = self.shadowRoot.getElementById(task)
            if(existingCard){
              customLog('updateTask', task, "task-loop");
              self.updateTask(task, tempTasks[task]);
            } else {
              customLog('newTask', task, "task-loop");
              self.addTask(task, tempTasks[task]);
            }
          }
        }

        for(let card of self.shadowRoot.querySelectorAll(".card")){
          if(fromEpochSeconds > card.dataset.updated){
              customLog('old card', card.id);
              try{
                delete callerIds[card.id];
                delete queueTasks[card.id];
                self.removeTask(card.id);
              }catch(ex){
                customLog("Error with oldTask:");
                customLog(ex);
              }
          }
        }
    } catch(e){
      customLog('getTasks Error:');
      customLog(e);
    }

  }


  filterTasks(){
    let checked = []
    let unchecked = []
    for(let checkbox of queueStatuses){
      let elem = this.shadowRoot.getElementById(checkbox);
      if(elem.checked){
        checked.push(checkbox);
      } else {
        unchecked.push(checkbox);
      }
    }
    customLog("unchecked", unchecked);
    customLog("checked", checked);
    for(let node of this.shadowRoot.querySelectorAll(`.card`)){
      customLog(node);
      if(checked.indexOf(node.dataset.status) >= 0){
        node.classList.remove("hidden");
        setTimeout(function(){
          node.classList.add("animate");
        },200);
      }else{
        node.classList.remove('animate');
        setTimeout(function(){
          node.classList.add("hidden");
        },300);
      }
    }
  }


  async init() {
      customLog("Running Desktop config.init();")
      Desktop.config.init();
      try{
        // ************************** Event listeners ************************** \\

        window.shadowRoot = this.shadowRoot;
        customLog("window.shadowRoot set.");
        customLog(window.shadowRoot);
        customLog(this.shadowRoot);

        for(let checkbox of queueStatuses){
          try{
            addOrReplaceEventListener( this.shadowRoot.getElementById(checkbox), 'change', e => {
              customLog(`${checkbox} change`);
              setCookie(checkbox, e.currentTarget.checked);
              this.filterTasks();
            });
          } catch(e){
            customLog(`Error: Listener not attached for ${checkbox} elements`);
            customLog(e);
          }
        }

        customLog("Initialized Buttons.")
        initResult = true;
      } catch (e){
        customLog("init Error:", e);
        initResult = false;
      }
  }

  // Get interactionID, but more info can be obtained from this method
  async getInteractionId() {
    const currentTaskMap = await Desktop.actions.getTaskMap();
    for (const iterator of currentTaskMap) {
      const interId = iterator[1].interactionId;
      return interId;
    }
  }

  async getInteraction() {
    const currentTaskMap = await Desktop.actions.getTaskMap();
    for (const iterator of currentTaskMap) {
      const interId = iterator[1].interaction;
      return interId;
    }
  }


  showLoadingIcon(message, color){
    this.updateResultSpan(message, color);
    this.shadowRoot.getElementById("queue-content").style.display = "none";
    this.shadowRoot.getElementById("loading-icon").style.display = "block";
  }

  showQueueDiv(message, color){
    this.updateResultSpan(message, color);
    this.shadowRoot.getElementById("loading-icon").style.display = "none";
    this.shadowRoot.getElementById("queue-content").style.display = "block";
  }


  updateResultSpan(text, color){
    if(!text){
      text = "";
    } else {
      customLog(`updateResultSpan text:${text}`);
    }
    this.shadowRoot.getElementById("result-span").innerText = text;
    if(!color){
      color = "inherit";
    }
    this.shadowRoot.getElementById("result-span").style.color = color;
  }


    async loadContent(){
      try{
        const checkSeconds = 5
        let self = this;

        for(let filter of queueStatuses){
          customLog(filter, getCookie(filter));
          if(getCookie(filter) === "false"){
            this.shadowRoot.getElementById(filter).checked = false;
          }
        }

        // Check if agent is already on a call and set initial state
        const currentTaskMap = await Desktop.actions.getTaskMap();
        const isOnCall = currentTaskMap.size > 0;
        customLog(`Initial call state - isOnCall: ${isOnCall}`);
        this.updateButtonStates(isOnCall);

        setTimeout(async function(){
          await self.getTasks(self);
        }, 100);
        if (taskPollIntervalId) clearInterval(taskPollIntervalId);
        taskPollIntervalId = setInterval(async function(){
          await self.getTasks(self);
        }, checkSeconds * 1000);

        // Periodically check and update button states to stay in sync
        if (buttonSyncIntervalId) clearInterval(buttonSyncIntervalId);
        buttonSyncIntervalId = setInterval(async function(){
          const currentTaskMap = await Desktop.actions.getTaskMap();
          const isOnCall = currentTaskMap.size > 0;
          if(isOnCall !== agentIsOnCall){
            customLog(`Button state sync - updating to ${isOnCall}`);
            self.updateButtonStates(isOnCall);
          }
        }, 1000); // Check every second
        
        this.showQueueDiv();
        
        // Setup merge button handler (must be done every time widget loads)
        const mergeButton = this.shadowRoot.getElementById('merge-button');
        if (mergeButton) {
          mergeButton.addEventListener('click', async function() {
            customLog("Merge button clicked");
            
            if (!trackedTransferPayload) {
              customLog("No trackedTransferPayload available");
              return;
            }
            
            mergeAwaitingReturnCall = true;
            mergeSecondCallId = currentCall?.data?.callId || null;
            customLog('Merge: saved active second-call ID:', mergeSecondCallId);
            mergeButton.disabled = true;

            const mergePayload = {
              ...trackedTransferPayload,
              command: "transfer-merge"
            };
            
            customLog("Sending transfer-merge message:", mergePayload);
            await postTransferCache(mergePayload);
            socket.emit("message", mergePayload);

            // Re-post every 4s so CallMerge poll is more likely to hit a pod with fresh cache (multi-replica prod)
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                if (!mergeAwaitingReturnCall) return;
                postTransferCache(mergePayload);
                socket.emit("message", mergePayload);
              }, (i + 1) * 4000);
            }

            scheduleMergeWaitTimeout();
            customLog('Merge requested — waiting for held call to return for auto-conference');
          });
          customLog("Merge button handler initialized");
        }
        
        // Restore merge panel state if needed (after widget reload)
        if ((showMergePanel || mergeAwaitingReturnCall) && trackedTransferPayload) {
          customLog("Restoring merge panel state after widget reload");
          const mergePanel = this.shadowRoot.getElementById('merge-panel');
          const mergeCallerNumber = this.shadowRoot.getElementById('merge-caller-number');
          const mergeButton = this.shadowRoot.getElementById('merge-button');
          if (mergePanel && mergeCallerNumber) {
            mergeCallerNumber.textContent = trackedTransferPayload.number || previousCallNumber;
            mergePanel.classList.remove('invisible');
            customLog("Merge panel restored with number:", trackedTransferPayload.number);
          }
          if (mergeButton && mergeAwaitingReturnCall) {
            mergeButton.disabled = true;
          }
        }
      }catch(e){
        customLog("loadContent Error:");
        customLog(e);
      }
      
  }

  async connectedCallback() {
    try{
      customLog("connectedCallback")
      // Update the global reference to the current widget instance
      currentWidgetInstance = this;
      await this.init();
      customLog("initResult:");
      customLog(initResult);
      if(!initResult){
        throw new Error("Not initialized!");
      }
      customLog("Desktop.agentStateInfo.latestData", Desktop.agentStateInfo.latestData);
      if(!loaded){
        getCookie("queued");

        customLog("myINIT webexService", webexService);
        customLog("myINIT:", Desktop.agentContact)
        //customLog("myINIT accessToken:", Desktop.agentContact.SERVICE.webex.accessToken);
        
        window.myAgentService = Desktop.agentContact.SERVICE;
        window.ccDesktop = Desktop;
        window.lastBroadworksId = null;
        Desktop.agentContact.SERVICE.webex.fetchPersonData("me").then(resp => {
          customLog('Desktop.agentContact.SERVICE.webex.fetchPersonData("me")', resp);
          if(resp.phoneNumbers){
            for (let n of resp.phoneNumbers){
              if(n.type.indexOf("extension") >= 0){
                resp.extension = n.value;
              }
            }
          }
          window.agentDetails = resp;
        });

        registerDesktopEventListeners();
        
        this.loadContent();

        webexService.meetings.register().then(res => {
          customLog("webexService.meetings.register() done!");
          try{
            webexService.internal.mercury.connect().then(() => {
                customLog("Mercury Connected.");

                webexService.internal.mercury.on('event:telephony_calls.received', async (event) => {
                    customLog("mercury telephony_calls.received EVENT:");
                    customLog(event);
                    previousCall = structuredClone(currentCall);
                    customLog("previousCall:", previousCall);
                    currentCall = structuredClone(event);
                    customLog("currentCall:", currentCall);
                    try {
                        const remoteNumber = currentCall?.data?.remoteParty?.number;
                        const heldCallId = currentCall?.data?.callId;
                        const mergePending = showMergePanel || mergeAwaitingReturnCall;
                        const secondCallId = mergeAwaitingReturnCall && mergeSecondCallId
                          ? mergeSecondCallId
                          : previousCall?.data?.callId;
                        const numberMatches = previousCallNumber && phoneNumbersMatch(previousCallNumber, remoteNumber);
                        const isNewInboundLeg = mergeAwaitingReturnCall &&
                          mergeSecondCallId &&
                          heldCallId &&
                          heldCallId !== mergeSecondCallId;
                        customLog('Auto-merge check:', {
                          mergePending,
                          mergeAwaitingReturnCall,
                          previousCallNumber,
                          remoteNumber,
                          numberMatches,
                          isNewInboundLeg,
                          secondCallId,
                          heldCallId
                        });

                        // After Merge click, conference when the held call returns as any new call leg.
                        // Do not require ANI match — CallMerge may present a different remoteParty.
                        if (mergeAwaitingReturnCall && isNewInboundLeg && secondCallId) {
                          customLog('Auto-merge conditions met - starting telephony conference');
                          const ok = await runTelephonyConference(secondCallId, heldCallId);
                          if (!ok) {
                            customLog("Clearing merge state due to conference error");
                            mergeAwaitingReturnCall = false;
                            mergeSecondCallId = null;
                            showMergePanel = false;
                            trackedTransferPayload = null;
                            previousCallNumber = null;
                            clearMergeWaitTimeout();
                          }
                        } else if (mergePending &&
                           !mergeAwaitingReturnCall &&
                           previousCallNumber &&
                           numberMatches &&
                           previousCall?.data?.callId &&
                           heldCallId) {
                          // Pre-merge path (legacy): match by caller ID before Merge was clicked
                          customLog("Auto-merge conditions met (pre-merge) - starting telephony conference");
                          const ok = await runTelephonyConference(previousCall.data.callId, heldCallId);
                          if (!ok) {
                            mergeAwaitingReturnCall = false;
                            mergeSecondCallId = null;
                            showMergePanel = false;
                            trackedTransferPayload = null;
                            previousCallNumber = null;
                            clearMergeWaitTimeout();
                          }
                        }
                    } catch (error) {
                        customLog("Error handling telephony_calls.received event:");
                        customLog(error);
                    }
                });
                customLog("initialized webexService.internal.mercury.on:event:telephony_calls.received listener.");
            });
          }catch(e){
            customLog("webexService.meetings.register() error:");
            customLog(e);
          }
        });

        customLog("loaded = true");
        loaded = true;
      } else {
        customLog("webex already loaded.");
        registerDesktopEventListeners();
        this.loadContent();
      }
    }catch(e){
      customLog('connectedCallback error', e);
      let self = this;
      setTimeout(async function(){
        try{
          customLog("Trying to reload...");
          await self.connectedCallback();
        }catch(ex){
          customLog("setTimeout connectedCallback attempt error:");
          customLog(ex);
        }
      }, 3000);
    }
  }

  disconnectedCallback() {
    customLog("disconnectedCallback — keeping Desktop listeners registered");
  }

}

customElements.define("sa-ds-voice-sdk", myDesktopSDK);
