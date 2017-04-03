// http://app.pluralsight.com/player.html?course=ionic2-angular2-typescript-mobile-apps&author=steve-michelotti&name=ionic2-angular2-typescript-mobile-apps-m0&clip=0&mode=live

//var myPort = browser.runtime.connect({name:"port-from-cs"});
/*
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener(function(m) {
  console.log("In content script, received message from background script: ");
  console.log(m.greeting);
});
document.body.addEventListener("click", function() {
  myPort.postMessage({greeting: "they clicked the page!"});
});

*/
var currentModule = -1;
var currentClip = -1;
var currentTime = -1;

var transcriptData = undefined;

/* Get JSON from pluralsight and parse it into DOM elements.
*/
function renderTranscript(course)
{
    // Production Transcript URL
    var transcriptJSONurl = "https://app.pluralsight.com/learner/courses/" + course + "/transcript";
    // Local Mock Transcript URL (IIS can't easily serve static files with no extension).
    //var transcriptJSONurl = "http://app.pluralsight.com/learner/courses/" + course + "/transcript.html";

    console.log("requesting: " + transcriptJSONurl);
    var request = new XMLHttpRequest();
    request.open('GET', transcriptJSONurl , true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        transcriptData = data;
      } else {
        // We reached our target server, but it returned an error
      }
    };
    request.send();

    request.onerror = function() {
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

var dataChangedCalls = 0;
function dataChanged() {
    dataChangedCalls += 1;
    // Try to send the whole transcript data every couple seconds.
    if (dataChangedCalls % 4 == 0)
    {
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
   if (result.length > 1)
   {
       querystring = result[result.length - 1].split('&');
   }
   for (var i = 0; i < querystring.length; i++) {
       var components = querystring[i].split('=');
       query[decodeURIComponent(components[0])] = decodeURIComponent(components[1] || '');
   }
   return query;
}


function updateData()
{
    var data_changed = false;
    // First find all <section> items under #modules
    var children = document.getElementsByClassName("modules")[0].children;
    // Then check all children to see what clip is selected.
    for (var i = 0; i < children.length; i++) {

        var currentChild = children[i];
        var clipList = currentChild.children[1].children;
        for (var j = 0; j < clipList.length; j++) {
            if (hasClass(clipList[j], "selected")) {
                if (currentModule != i || currentClip != j)
                {
                    console.log("Module and clip changed.");
                    console.log(currentModule);
                    console.log(i);
                    console.log(currentClip);
                    console.log(j);
                    data_changed = true;
                }
                currentModule = i;
                currentClip = j;
                break;
            }
        }
    }
    var newTime = document.getElementsByTagName('video')[0].currentTime;
    if (currentTime != newTime)
    {
        data_changed = true;
    }
    currentTime = newTime;
    // For debugging so a message is always sent even on static page.
    /*if (data_changed)
    {
        dataChanged();
    }*/
    dataChanged();
    // Set up a recursive loop to constantly check to see if any of our watched values
    // have changed since the last time, and if so, notify the background script.
    window.setTimeout(updateData, 500);
}
// Invoke updateData immediately upon definition so we don't have any lag time
// from the first time the button is clicked.
updateData();

/*
(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'alert("hi")';
    document.body.appendChild(script);
})();
*/
