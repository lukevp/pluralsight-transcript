/*document.body.style.border = "5px solid red";
pageAction.show();
$(document).ready(function() {
  //$('#course-title').html($('#course-title'.html() + "F U"));//<button id="button-notes" class="active side-menu-tab-button">Notes</button>
  alert($('#course-title').html());
});
*/



function hasClass(item, className) {
    for (var i = 0; i < item.classList.length; i++) {
        if (item.classList[i] == className) {
            return true;
        }
    }
    return false;
}


var activeModule = -1;
var activeClip = -1;
// First find all <section> items under #modules
var children = document.getElementsByClassName("modules")[0].children;

for (var i = 0; i < children.length; i++) {

    var currentChild = children[i];
    // Class "open"
    var foundActive = hasClass(currentChild, "open");
    if (foundActive) {
        var clipList = currentChild.children[1].children;
        for (var j = 0; j < clipList.length; j++) {
            if (hasClass(clipList[j], "selected")) {
                activeModule = i;
                activeClip = j;
            }
        }
    }
}

var currentTime = document.getElementsByTagName('video')[0].currentTime