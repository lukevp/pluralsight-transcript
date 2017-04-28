//var myPort = browser.runtime.connect({name:"port-from-transcript"});
var title = "";
var currentTab = -1;
var currentModuleAndClip = "";
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
        text += "<div id='" + moduleroot + "' class='module'><h1>" + module.title + "</h1>";
        for (var clipindex = 0; clipindex < module.clips.length; clipindex++)
        {
            var clip = module.clips[clipindex];
            var cliproot = moduleroot+"clip"+clipindex;
            text += "<div id='" + cliproot + "' class='clip'><h2>" + clip.title + "</h2><div class='clip-body'><p>";
            var sentenceCount = 0;
            for (var segmentindex = 0; segmentindex < clip.segments.length; segmentindex++)
            {
                var segment = clip.segments[segmentindex];
                /* Count the # of sentences & add a break every 5 sentences. */
                var newText = "";
                var endlocation = 0;
                var foundIndex = 0;
                while (endlocation >= 0)
                {
                    var endlocation = segment.text.search(/\.(\s|$)/);
                    if (endlocation != -1)
                    {
                        newText += segment.text.substring(0, endlocation+1);
                        sentenceCount += 1;
                        if (sentenceCount >= 5)
                        {
                            newText += "</span></p><p><span id='" + cliproot + "segment" + segmentindex +"-1' class='segment'>";
                            sentenceCount = 0;
                        }
                        segment.text = segment.text.substring(endlocation+1);
                    }
                    else
                    {
                        newText += segment.text;
                    }
                }
                text += "<span id='"+cliproot+"segment"+segmentindex+"' class='segment'>"+newText+"</span>&nbsp;";
            }
            text += "</p></div></div>";
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
    document.getElementById('module' + module + 'clip' + clip).classList.add('selected');

    // If clip/module has changed, scroll to new clip.
    var newModuleAndClip = 'm' + module + 'c' + clip;
    if (currentModuleAndClip != newModuleAndClip)
    {
        window.scrollTo(0, document.getElementById('module' + module + 'clip' + clip).offsetTop);
        currentModuleAndClip = newModuleAndClip;
    }
    // Find the clip we're on and get our list of segments.
    var segments = transcriptData.modules[module].clips[clip].segments;
    // Select the active segment. Default to the last segment.
    var activeSegment = -1;//segments.length;
    for (var i = segments.length - 1; i >= 0; i--)
    {
        if (time >= segments[i].displayTime)
        {
            activeSegment = i;
            break;
        }
    }
    document.getElementById('module' + module + 'clip' + clip + 'segment' + (activeSegment)).classList.add('selected');
    document.getElementById('module' + module + 'clip' + clip + 'segment' + (activeSegment) + "-1").classList.add('selected');
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
