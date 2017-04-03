//var myPort = browser.runtime.connect({name:"port-from-transcript"});
var title = "";
var currentTab = -1;
var transcriptData = undefined;

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

/*function updateTranscriptTime(m) {
  console.log("In transcript script, received message from background script");
}*/
function updateTitle(tab)
{
    currentTab = tab.id;
    var urlParams = parseQuery(tab.url);
    title = urlParams["course"];
    document.title = "Transcript for course: " + title;
}
browser.tabs.getCurrent().then(updateTitle, undefined);

function renderTranscript()
{
    var text = "";
    for (var moduleindex = 0; moduleindex < transcriptData.modules.length; moduleindex++)
    {
        var module = transcriptData.modules[moduleindex];
        var moduleroot = "module"+moduleindex
        text += "<div id='"+moduleroot+"' class='module'><h1>"+module.title+"</h1>";
        for (var clipindex = 0; clipindex < module.clips.length; clipindex++)
        {
            var clip = module.clips[clipindex];
            var cliproot = moduleroot+"clip"+clipindex;
            text += "<div id='"+cliproot+"' class='clip'><h2>"+clip.title+"</h2>";
            for (var segmentindex = 0; segmentindex < clip.segments.length; segmentindex++)
            {
                var segment = clip.segments[segmentindex];
                text += "<span id='"+cliproot+"segment"+segmentindex+"' class='segment'>"+segment.text+"</span>&nbsp;";
            }
            text += "</div>";
        }
        text += "</div>";
    }
    //var text = JSON.stringify(transcriptData);
    document.body.innerHTML = text;
}

function updateTranscript(module, clip, time)
{
    var selected = document.querySelectorAll('.selected');
    for (var i = 0; i < selected.length; i++) {
       selected[i].classList.remove('selected');
    }
    document.getElementById('module'+module).classList.add('selected');
    document.getElementById('module'+module+'clip'+clip).classList.add('selected');
    // Find the clip we're on and get our list of segments.
    var segments = transcriptData.modules[module].clips[clip].segments;
    for (var i = 0; i < segments.length; i++)
    {
        if (time <= segments[i].displayTime)
        {
            document.getElementById('module'+module+'clip'+clip+'segment'+(i-1)).classList.add('selected');
            break;
        }
    }
}

function handleMessage(request, sender, sendResponse) {
    if (request.course == title)
    {
        if (transcriptData == undefined && request.transcript != undefined)
        {
            transcriptData = request.transcript;
            renderTranscript();
        }
        updateTranscript(request.module, request.clip, request.time);
        /*
        console.log("TODO: Update transcript to: ");
        console.log();
        console.log(request.module);
        console.log(request.clip);
        console.log(request.time);*/
    }

  //sendResponse({response: "Response from background script"});
}
browser.runtime.onMessage.addListener(handleMessage);




//browser.runtime.onConnect.addListener(function(p) { p.onMessage.addListener(updateTranscriptTime); });

//var myId = tab.id;
/*
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
*/
