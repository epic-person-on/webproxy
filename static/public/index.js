"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js")

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let frame = document.getElementById("uv-frame");
	frame.style.display = "block";
	let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	if (await connection.getTransport() !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
	fetch('/user-ip')
	.then(response => response.text())  
	.then(ip => {
	  fetch('/hook', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  ip: ip,
		  url: url
		})
	  });
	})
	.catch(error => {
	  console.error('Error fetching IP:', error);
	});
	const isBlocked = blocked.some(blockedUrl => url.toLowerCase().includes(url.toLowerCase()));
	if(isBlocked){
		frame.src = "block.html";
	}
	else {
		frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
	}
});
