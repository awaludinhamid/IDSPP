/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/**
 * we have to count how many animations have been started
 * so they only stop when all animations have been done
 * @type Number
 */
var animationCount = 0;

/**
 * variable modal message
 * @type various
 */
var messageMdl = $("div#message-mdl");
var messageMdlContent = messageMdl.find(".modal-content");
var messageMdlTitle = messageMdlContent.find(".modal-title");
var messageMdlBody = messageMdlContent.find(".modal-body");
var backColInfo = "rgba(16,64,112,0.8)";
var backColError = "rgba(10,20,40,0.8)";
var mdlTitleInfo = "&nbsp;Information";
var mdlTitleError = "&nbsp;Error";
var mdlTitleClassInfo = "glyphicon glyphicon-info-sign";
var mdlTitleClassError = "glyphicon glyphicon-exclamation-sign";
var colInfo = "white";
var colError = "red";
 
/**
 * show warning/error message
 * @param {String} msg
 * @returns void
 */
function showErrorMessage(msg) {
  messageMdlTitle.children("span:first-child").attr("class",mdlTitleClassError);
  messageMdlTitle.children("span:last-child").html(mdlTitleError);
  messageMdlContent.css("background-color",backColError).css("color",colError);
  messageMdlBody.html(msg);
  messageMdl.modal("show");
}

/**
 * show info message 
 * @param {String} msg
 * @returns void
 */
function showInfoMessage(msg) {
  messageMdlTitle.children("span:first-child").attr("class",mdlTitleClassInfo);
  messageMdlTitle.children("span:last-child").html(mdlTitleInfo);
  messageMdlContent.css("background-color",backColInfo).css("color",colInfo);
  messageMdlBody.html(msg);
  messageMdl.modal("show");
}

/**
 * start the foreground animation
 * @returns void
 */
function startAnimation() {
  animationCount += 1;
  $(".fore-cover").show();
  //$(".back-cover, .red-ball, .blue-ball, .green-ball, .loading-text").css("animation-play-state","running");
}

/**
 * end the foreground animation
 * @returns void
 */
function endAnimation() {
  animationCount -= 1;
  if(animationCount < 1) {
    $(".fore-cover").hide();
    //$(".back-cover, .red-ball, .blue-ball, .green-ball, .loading-text").css("animation-play-state","paused");
  }
}

/**
 * generate number in monetary format
 * @param {Number} x
 * @param {String} separator
 * @param {String} suffix ,
 * @param {String} prefix ,the currency
 * @returns {String} formatted number
 */
function numberFormat(x,separator,prefix,suffix) {
  if(x == null) return "";
  x = parseInt(x);
  if(suffix == null) suffix = "";
  if(prefix == null) prefix = "";
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return prefix+parts.join(".")+suffix;
}
  
// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest() {
  // This is a sample server that supports CORS.
  //var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';
  var url = 'https://ids-fe1.com/PPMobileProject/webresources/inq';
  var scope = $("div#div-content").scope(); //angular scope

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert(xhr.responseText);
    alert(JSON.stringify(xhr));
    alert('Woops, there was an error making the request.');
  };
  xhr.setRequestHeader("Content-Type","text/plain");
  xhr.send(JSON.stringify(scope.assignData()));
}

//left padding text with given char
function leftpad(text,charToPad,numOfChar) {
  var output = text;
  var cycle = 0;
  while(cycle < numOfChar) {
    output = charToPad + output;
    cycle++;
  }
  return output;
}