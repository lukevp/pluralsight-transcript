
const CSS = "body { border: 20px solid red; }";

function showTranscript(tab) {
  console.log("Show Transcript");
  // TODO: parse out course name, use in this URL:
  // "https://app.pluralsight.com/learner/courses/" + courseName + "/transcript"
  browser.windows.create(
    {
      type : "popup",
      url : "transcript.html"
    });
}
//https://app.pluralsight.com/player?course=getting-started-opencv-net&author=kobi-hikri&name=getting-started-opencv-net-m2&clip=0&mode=live
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //if (tab.url.match(/^https\:\/\/app\.pluralsight\.com\/player/)) {
  if (tab.url.match(/^https\:\/\/app\.pluralsight\.com\/library/courses/)) {

    browser.pageAction.show(tab.id);
  }
});

browser.pageAction.onClicked.addListener(showTranscript);
