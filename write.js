document.write(window.name);

window.addEventListener("message", function(message)
{
    try {
        var parsed = JSON.parse(message.data);
        if (parsed && parsed.name === "tonic-embed-0")
        {
            if (parsed.height) {
                window.parent.postMessage(JSON.stringify({
                    height: parsed.height,
                    name: window.name
                }), "*");
            }
        }
    } catch(e) {
        console.log(e);
    }
}.bind(this));
