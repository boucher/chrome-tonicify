(function(){

var ForEach = Array.prototype.forEach;
var Map = Array.prototype.map;

function replaceGist(script)
{
    function replaceFile(el)
    {
        el.style.border = "none";
        el.id = "tonicify" + (counter++);

        var source = Map.call(el.getElementsByTagName("tr"), function(row){ return row.innerText }).join("\n");

        var gistURL = script.src.slice(0,-3).replace(/"/g, '').replace(/'/g, '');
        var meta = "<div class=\"gist-meta\">" +
                   "<a href=\"" + gistURL + "\">gist</a> " +
                   "hosted with ❤ by <a href=\"https://github.com\">GitHub</a></div>"

        queue.push({
            id: el.id,
            source: source,
            prependHTML: meta
        })
    }

    var el = script.nextSibling;
    while (el && el.nodeName.toLowerCase() !== "div" && el.className !== "gist")
        el = el.nextSibling;

    if (!el)
        return;

    ForEach.call(el.getElementsByClassName("gist-file"), replaceFile);
}

function replaceGithubSnippet(el)
{
    el.id = "tonicify" + (counter++);
    queue.push({
        id: el.id,
        source: el.innerText
    })
}

function replaceNPMSnippet(el)
{
    el.id = "tonicify" + (counter++);
    queue.push({
        id: el.id,
        source: el.innerText
    })
}

/*
function drainQueue()
{
    queue.forEach(function(opts)
    {
        var stringOpts = JSON.stringify(opts);

        var scriptSource = "var opts = " + stringOpts + "; " +
                           "var el = document.getElementById(opts.id); " +
                           "el.innerHTML = '" + (opts.prependHTML || '') + "'; " +
                           "Tonic.createNotebook({ element: el, source: opts.source })"

        var script = document.createElement("script");
        script.appendChild(document.createTextNode(scriptSource));

        document.body.appendChild(script);
    })
}
*/

function drainQueue()
{
    queue.forEach(function(opts)
    {
        var iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('frame.html');
        iframe.name = opts.source;
        var initialHeight = (opts.source.split("\n").length * 21 + 10) || 0;
        iframe.style.height = (Math.max(100, initialHeight) + 50) + "px";
        iframe.style.width = "calc(100% + 200px)";
        iframe.style.padding = "0px";
        iframe.style.margin = "0px";
        iframe.style.marginLeft = "-100px";
        iframe.style.border = "0px";
        iframe.style.backgroundColor = "transparent";
        iframe.frameBorder = "0";
        iframe.allowTransparency="true";

        var el = document.getElementById(opts.id);
        el.innerHTML = opts.prependHTML || '';
        el.appendChild(iframe);

        window.addEventListener("message", function(message)
        {
            try {
                var parsed = JSON.parse(message.data);
            } catch(e) {
            }

            if (parsed && parsed.name === opts.source && parsed.height) {
                 iframe.style.height = (parsed.height + 50) + "px";
            }
        }.bind(this));
    })
}


var queue = [];
var counter = 0;

// detect Gists
ForEach.call(document.getElementsByTagName("script"), function(script)
{
    if (/^http(s)?:\/\/gist.github.com/.test(script.src)) {
        replaceGist(script)
    }
})

// detect Highlight.js snippets in Github comments
if (window.location.hostname === "github.com") {
    ForEach.call(document.querySelectorAll(".comment-body .highlight-source-js"), replaceGithubSnippet)
}

// detect Highlight snippets on NPM
if (window.location.hostname === "www.npmjs.com") {
    ForEach.call(document.querySelectorAll("pre code.highlight.js"), replaceNPMSnippet)
}



if (queue.length === 0)
    return;
/*
var tonic = document.createElement("script");
tonic.src = "https://embed.tonicdev.com"
tonic.onload = drainQueue;

document.body.appendChild(tonic);
*/

drainQueue();

})()
