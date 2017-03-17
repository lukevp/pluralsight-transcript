
const CSS = "body { border: 20px solid red; }";
var active_course = "";
function showTranscript(tab) {
    console.log("Show Transcript");
    console.log("Tab: " + tab);
    console.log("Course: " + active_course);
  // TODO: parse out course name, use in this URL:
  // "https://app.pluralsight.com/learner/courses/" + courseName + "/transcript"
  /*browser.windows.create(
    {
      type : "popup",
      url : "transcript.html"
    });*/
    browser.windows.create(
        {
            type: "popup",
            url: "https://app.pluralsight.com/learner/courses/" + active_course + "/transcript"
        });
}
//https://app.pluralsight.com/player?course=getting-started-opencv-net&author=kobi-hikri&name=getting-started-opencv-net-m2&clip=0&mode=live
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //if (tab.url.match(/^https\:\/\/app\.pluralsight\.com\/player/?.*course=[^&]*&)) {
    regex = /^https\:\/\/app\.pluralsight\.com\/library\/courses\/([^\/]*)/ig;
    if (tab.url.match(regex)) {
        match = regex.exec(tab.url);
        browser.pageAction.show(tab.id);
        active_course = match[1];
  }
});

browser.pageAction.onClicked.addListener(showTranscript);
