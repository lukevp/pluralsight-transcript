var currentModule = -1;
var currentClip = -1;
var currentTime = -1;
var transcriptData = undefined;

/* Get JSON from pluralsight and parse it into DOM elements.
*/
function renderTranscript(course) {
    // Production Transcript URL
    var transcriptJSONurl = "https://app.pluralsight.com/learner/courses/" + course + "/transcript";
    // Local Mock Transcript URL (IIS can't easily serve static files with no extension).
    //var transcriptJSONurl = "http://app.pluralsight.com/learner/courses/" + course + "/transcript.html";

    console.log("requesting: " + transcriptJSONurl);
    var request = new XMLHttpRequest();
    request.open('GET', transcriptJSONurl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            transcriptData = data;
        } else {
            // We reached our target server, but it returned an error
        }
    };
    request.send();

    request.onerror = function () {
        // There was a connection error of some sort
    };
}

urlParams = parseQuery(window.location.href);
var course = urlParams["course"];
renderTranscript(course);

function hasClass(item, className) {
    for (var i = 0; i < item.classList.length; i++) {
        if (item.classList[i] == className) {
            return true;
        }
    }
    return false;
}

var sendDataCalls = 0;
function sendData() {
    sendDataCalls += 1;
    // Try to send the whole transcript data every couple seconds.
    if (sendDataCalls % 8 == 0) {
        browser.runtime.sendMessage({
            course: course,
            module: currentModule,
            clip: currentClip,
            time: currentTime,
            transcript: transcriptData
        });
    }
    else {
        browser.runtime.sendMessage({
            course: course,
            module: currentModule,
            clip: currentClip,
            time: currentTime
        });
    }
}

/* From: http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript & heavily modified */
function parseQuery(url) {
    var query = {};
    var result = url.split('?');
    var querystring = url;
    if (result.length > 1) {
        querystring = result[result.length - 1].split('&');
    }
    for (var i = 0; i < querystring.length; i++) {
        var components = querystring[i].split('=');
        query[decodeURIComponent(components[0])] = decodeURIComponent(components[1] || '');
    }
    return query;
}

function updateData() {
    // Set up a recursive loop to constantly check to see if any of our watched values
    // have changed since the last time, and if so, notify the background script.
    window.setTimeout(updateData, 250);
    var videoPlayer = document.getElementsByTagName('video')[0];
    if (videoPlayer == undefined) {
        return;
    }
    var newTime = videoPlayer.currentTime;
    var urlParams = parseQuery(window.location.href);
    var nameComponents = urlParams["name"].split('-');
    var targetModule = nameComponents[nameComponents.length - 1].substring(1);
    var targetClip = urlParams["clip"];
    if (currentModule != targetModule || currentClip != targetClip) {
        console.log("Module and clip changed.");
        console.log(currentModule);
        console.log(targetModule);
        console.log(currentClip);
        console.log(targetClip);
        currentModule = targetModule;
        currentClip = targetClip;
    }
    currentTime = newTime;
    sendData();
}
// Invoke updateData immediately upon definition so we don't have any lag time
// from the first time the button is clicked.
updateData();
