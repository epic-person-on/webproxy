import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import disableCache from "fastify-disablecache";

// static paths
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const ipUrlData = [];
const fastify = Fastify({
	trustProxy: true,
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
});

// Statistics webhook
fastify.addHook("preHandler", async (request, reply) => {});

fastify.post("/hook", async (request, reply) => {
	const { ip, url } = request.body;

	if (!ip || !url) {
		return reply.status(400).send({ message: "IP and URL are required" });
	}

	ipUrlData.push({ ip, url });

	return { message: "Data saved successfully" };
});

fastify.get("/hook", async (request, reply) => {
	return { data: ipUrlData };
});

fastify.get("/user-ip", (request, reply) => {
	const clientIp = request.ip;
	reply.send(clientIp);
});

fastify.register(disableCache);

fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/uv/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

// Password protection for the /stats/index.html route
const PASSWORD = 'your-secure-password'; // Change this to your desired password

fastify.get("/stats/index.html", async (request, reply) => {
	const authHeader = request.headers["authorization"];
	if (!authHeader) {
		return reply.status(401).send("Authorization required");
	}

	const [scheme, encoded] = authHeader.split(" ");
	if (scheme !== "Basic" || !encoded) {
		return reply.status(401).send("Authorization required");
	}

	const decoded = Buffer.from(encoded, "base64").toString("utf8");
	const [username, password] = decoded.split(":");

	if (password !== PASSWORD) {
		return reply.status(401).send("Unauthorized");
	}

	// If password is correct, serve the stats/index.html
	return reply.sendFile("index.html", join(publicPath, "stats"));
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	fastify.close();
	process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 3000;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
