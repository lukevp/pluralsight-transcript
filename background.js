
const CSS = "body { border: 20px solid red; }";

// Production Regex
var playerRegex = /^https?\:\/\/app\.pluralsight\.com\/player\?.*course=([^&]*)(&|$)/ig;
// Local Mock Regex (IIS can't easily serve static files with no extension).
//var playerRegex = /^https?\:\/\/app\.pluralsight\.com\/player.html\?.*course=([^&]*)(&|$)/ig;

var active_callbacks = [];

/*
  Define callback function that will lookup the active course popup in our list and
  Update the DOM to highlight the current line of the transcript.
  Also define a second callback that will call updateTranscriptTIme
*/
function updateTranscriptTime(m) {
    console.log("In background script, received message from content script");
    console.log("MODULE: " + m.module);
    console.log("CLIP: " + m.clip);
    console.log("TIME: " + m.time);
}

function onCreated(windowInfo) {
  console.log(`Created window: ${windowInfo.id}`);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

/* Define callback function for onclick of Page Action that will launch transcript
   popup and inject script into player page to update us with the current player time
*/
function showTranscript(tab) {
    active_course = playerRegex.exec(tab.url)[1];
    console.log("Show Transcript");
    console.log("Tab: " + tab);
    console.log("Course: " + active_course);
    // Returns 404 if can't find course.
    // What if can't find transcript but course exists?

    // Production Transcript URL
    var transcriptJSONurl = "https://app.pluralsight.com/learner/courses/" + active_course + "/transcript"
    // Local Mock Transcript URL (IIS can't easily serve static files with no extension).
    //var transcriptJSONurl = "https://app.pluralsight.com/learner/courses/" + active_course + "/transcript.html"
    var transcriptURL = "transcript.html";//browser.extension.getURL("transcript.html");
    transcriptURL += "?course=" + active_course;
    var creating = browser.windows.create(
    {
      type : "popup",
      url : transcriptURL
    });
    creating.then(onCreated, onError);

    if (active_callbacks.indexOf(tab.id) == -1)
    {
        active_callbacks.push(tab.id);
        browser.tabs.executeScript(tab.id, { file: "/player.js" });
    }
}

/* Register an event handler for the pageClick event to open a pop-up window
   with the active course's transcript. */
browser.pageAction.onClicked.addListener(showTranscript);
/* Register event handler to new tab creation to add the page action button
   whenever the user is at a pluralsight player page. */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.match(playerRegex)) {
        browser.pageAction.show(tab.id);
    }
});
/* Register event handler to capture injected client script communication back
 to the background tab. */
 browser.runtime.onConnect.addListener(function(p) { p.onMessage.addListener(updateTranscriptTime); });
