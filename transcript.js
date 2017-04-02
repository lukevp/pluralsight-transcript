var myPort = browser.runtime.connect({name:"port-from-cs"});
var title = "";
var currentTab = -1;
function updateTitle()
{

}

browser.tabs.getCurrent().then(updateTitle, undefined);
var myId = tab.id;
function dataChanged() {
    if (currentTab != -1)
    {
        myPort.postMessage(
        {
            source: "transcript",
            tabid: currentTab,
            title: title
        });
    }
    window.setTimeout(dataChanged, 1000);
}
dataChanged();
