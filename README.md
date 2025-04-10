<p align="center"><img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Ultraviolet-Static/main/public/uv.png" height="200"></p>

<h1 align="center">Web Proxy</h1>

## Deployment

You can run this compose. (recomended)

```yaml
services:
  webproxy:
    image: "ghcr.io/epic-person-on/webproxy/webproxy:latest"
    ports:
      - "3000:3000"
    dns:
      - 94.140.14.14
      - 94.140.14.15
```

or

```bash
# start with docker compose
git clone https://github.com/epic-person-on/webproxy.git

cd webproxy

docker compose up -d

# or run the docker image
docker run ghcr.io/epic-person-on/webproxy/webproxy:latest
```

> [!WARNING]  
> Do Not use this as an anonymization tool because it leaks your ip address in WebRTC. Also searches are logged on the route /stats so assume nothing is private.
