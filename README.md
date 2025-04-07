<p align="center"><img src="https://raw.githubusercontent.com/titaniumnetwork-dev/Ultraviolet-Static/main/public/uv.png" height="200"></p>

<h1 align="center">Web Proxy</h1>

## Deployment

```bash
# start with docker compose
docker compose up -d

# or run the docker image
docker run ghcr.io/epic-person-on/webproxy/webproxy:latest
```

> [!IMPORTANT]  
> Until deployed on a domain with a valid SSL certificate, Firefox will not be able to load the site. Use chromium for testing on localhost
