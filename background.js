
const CSS = "body { border: 20px solid red; }";

// Production Regex
var playerRegex = /^https?\:\/\/app\.pluralsight\.com\/player\?.*course=([^&]*)(&|$)/ig;
// Local Mock Regex (IIS can't easily serve static files with no extension).
//var playerRegex = /^https?\:\/\/app\.pluralsight\.com\/player.html\?.*course=([^&]*)(&|$)/ig;


/*
  Define callback function that will lookup the active course popup in our list and
  Update the DOM to highlight the current line of the transcript.
  Also define a second callback that will call updateTranscriptTIme
*/

//var transcriptPort = undefined;
function updateTranscriptTime(m) {
    if (m.source == "content")
    {
        console.log("In background script, received message from content script");
        console.log("MODULE: " + m.module);
        console.log("CLIP: " + m.clip);
        console.log("TIME: " + m.time);
        /*if (transcriptPort != undefined)
        {
            transcriptPort.postMessage(
            {
                source: "background",
                module: m.module,
                clip: m.clip,
                time: m.time
            })
        }*/
    }
    else if (m.source == "transcript")
    {
        console.log("In background script, received message from transcript");
        console.log("TabID: " + m.tabid);
        console.log("Title: " + m.title);

    }
}

function onCreated(windowInfo, tab, active_course) {
  console.log(`Created window: ${windowInfo.id}`);
  //transcriptPort = browser.tabs.connect(windowInfo.tabs[0].id, {name: "bg-to-transcript"});
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

    var transcriptURL = "transcript.html";
    transcriptURL += "?course=" + active_course;


    browser.tabs.executeScript(tab.id, { file: "content.js" });
    var creating = browser.windows.create(
    {
      type : "popup",
      url : transcriptURL
    });
    creating.then(function(windowInfo) { onCreated(windowInfo, tab, active_course); }, onError);
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
//browser.runtime.onConnect.addListener(function(p) { p.onMessage.addListener(updateTranscriptTime); });
//browser.runtime.onDisconnect.addListener(function(p) { p.}
