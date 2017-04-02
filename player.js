// http://app.pluralsight.com/player.html?course=ionic2-angular2-typescript-mobile-apps&author=steve-michelotti&name=ionic2-angular2-typescript-mobile-apps-m0&clip=0&mode=live

var myPort = browser.runtime.connect({name:"port-from-cs"});/*
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

function hasClass(item, className) {
    for (var i = 0; i < item.classList.length; i++) {
        if (item.classList[i] == className) {
            return true;
        }
    }
    return false;
}

function dataChanged() {
    myPort.postMessage(
    {
        module: currentModule,
        clip: currentClip,
        time: currentTime
    });
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
    if (data_changed)
    {
        dataChanged();
    }
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
