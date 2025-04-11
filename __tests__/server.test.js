import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import disableCache from 'fastify-disablecache';
import { createHash } from 'crypto';
import { publicPath } from 'ultraviolet-static';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import wisp from 'wisp-server-node';

let fastify;

beforeAll(async () => {
  fastify = Fastify();

  // Replicate only relevant parts of the original server
  const ipUrlData = [];

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
    const clientIp = createHash('sha256').update(request.ip).digest('base64');
    reply.send(clientIp);
  });

  fastify.register(disableCache);
  fastify.register(fastifyStatic, { root: publicPath });

  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /hook', () => {
  it('should save IP and URL data', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/hook',
      payload: { ip: '127.0.0.1', url: 'https://example.com' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Data saved successfully' });

    const getResponse = await fastify.inject({
      method: 'GET',
      url: '/hook'
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toEqual({
      data: [{ ip: '127.0.0.1', url: 'https://example.com' }]
    });
  });

  it('should return 400 if ip or url is missing', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/hook',
      payload: { ip: '127.0.0.1' } // url is missing
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'IP and URL are required' });
  });
});

describe('GET /user-ip', () => {
  it('should return a SHA-256 hashed IP address', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/user-ip',
      headers: {
        'x-forwarded-for': '123.123.123.123'
      }
    });

    const expectedHash = createHash('sha256').update('123.123.123.123').digest('base64');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(expectedHash);
  });
});
