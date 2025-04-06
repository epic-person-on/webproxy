const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

window.addEventListener('load', function () {

    registerSW();

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        const frame = document.getElementById('search-frame');
        
        let iframeSrc;

        function isValidUrl(string) {
            try {
                new URL(string);  
                return true;
            } catch (_) {
                return false;  
            }
        }

        if (isValidUrl(searchQuery)) {
            iframeSrc = searchQuery;
        } else {
            iframeSrc = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        }

        const isBlocked = blocked.some(blockedUrl => iframeSrc.toLowerCase().includes(blockedUrl.toLowerCase()));

        if (isBlocked) {
            frame.src = "block.html";  
        } else {
            let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
            if (connection.getTransport() !== "/epoxy/index.mjs") {
                connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
            }

            frame.src = __uv$config.prefix + __uv$config.encodeUrl(iframeSrc);
        }
    }
});
