const assert = require('node:assert/strict');
const {test} = require('node:test');
const {gunzipSync} = require('node:zlib');
const {MockAgent, setGlobalDispatcher} = require('undici');
const {RoolinkClient} = require('../dist');
const {version} = require('../package.json');

test('compression', async () => {
  const script = 'var _ac=function(){};';
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);

  // Parses the script with the client, and returns the request it sent.
  async function send(client) {
    let sent;
    agent
      .get('https://web.roolink.io')
      .intercept({path: '/api/v1/parse', method: 'POST'})
      .reply(200, request => {
        sent = request;
        return {};
      });
    await client.parseScript(script);
    return sent;
  }

  const compressed = await send(new RoolinkClient('roo_test'));
  assert.equal(compressed.headers['Content-Encoding'], 'gzip');
  assert.equal(gunzipSync(compressed.body).toString(), script);

  const uncompressed = await send(
    new RoolinkClient('roo_test', {compress: false}),
  );
  assert.equal(uncompressed.headers['Content-Encoding'], undefined);
  assert.equal(uncompressed.body, script);
});

test('pixel', async () => {
  const sensor = 'ap=true&bt=%7B%22charging%22%3Atrue%7D&fonts=null';
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  agent
    .get('https://web.roolink.io')
    .intercept({path: '/api/v1/pixel', method: 'POST'})
    .reply(200, sensor, {headers: {'Content-Type': 'text/plain'}});

  const response = await new RoolinkClient('roo_test').generatePixel({
    userAgent: 'Mozilla/5.0',
    bazadebezolkohpepadr: 1,
    hash: 'abc',
  });
  assert.deepEqual(response, {sensor});
});

test('user agent', async () => {
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  let sent;
  agent
    .get('https://web.roolink.io')
    .intercept({path: '/api/v1/parse', method: 'POST'})
    .reply(200, request => {
      sent = request;
      return {};
    });

  await new RoolinkClient('roo_test').parseScript('var _ac=function(){};');
  assert.equal(sent.headers['User-Agent'], `roolink-js/${version}`);
});

// Answers one POST to path on the Kasada API with reply. The returned object holds the request once the client sends it.
function interceptKasada(path, reply) {
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  const sent = {};
  agent
    .get('https://ksd.roolink.io')
    .intercept({path, method: 'POST'})
    .reply(
      200,
      request => {
        Object.assign(sent, request);
        return reply;
      },
      {headers: {'Content-Type': 'application/json'}},
    );
  return sent;
}

function assertKasadaRequest(sent, body) {
  assert.equal(sent.headers['x-api-key'], 'roo_test');
  assert.equal(sent.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(sent.body), body);
}

test('kasada payload', async () => {
  const sent = interceptKasada(
    '/api/v1/payload',
    '{"headers":{"x-kpsdk-ct":"ct","x-kpsdk-v":"j-1.1.0"},"payload":"APv/EA=="}\n',
  );
  const req = {
    script: '(function(){})();',
    ipsUrl: 'https://www.example.com/a/b/ips.js?x-kpsdk-v=j-1.1.0',
    language: 'en-US',
    referer: 'https://www.example.com/',
    userAgent: 'Mozilla/5.0',
  };

  const response = await new RoolinkClient('roo_test').generateKasadaPayload(
    req,
  );
  assertKasadaRequest(sent, req);
  assert.deepEqual(response, {
    headers: {'x-kpsdk-ct': 'ct', 'x-kpsdk-v': 'j-1.1.0'},
    payload: Buffer.from([0x00, 0xfb, 0xff, 0x10]),
  });
});

test('kasada cd', async () => {
  const cd =
    '{"workTime":1788893087900,"id":"0123456789abcdef0123456789abcdef","answers":[3,7],"duration":2,"d":120,"st":1788893087778,"rst":1788893087898}';
  for (const req of [
    {
      st: 1788893087778,
      ct: '0aGzYc9d3d1b8f6f4e0e2d7c1b9a5f3e',
      fc: 'eyJ4IjoxfQ==',
      domain: 'www.example.com',
    },
    {
      st: 1788893087778,
      ct: '0aGzYc9d3d1b8f6f4e0e2d7c1b9a5f3e',
      domain: 'www.example.com',
    },
  ]) {
    const sent = interceptKasada('/api/v1/cd', JSON.stringify({payload: cd}));
    const response = await new RoolinkClient('roo_test').generateKasadaCD(req);
    assertKasadaRequest(sent, req);
    assert.deepEqual(response, {payload: cd});
  }
});

test('kasada botid', async () => {
  const header =
    '{"b":0,"v":0.08084381062192014,"e":"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..uydqejFMULzuEHyK.Eh2s.aM1k","s":"q+/0Zm9v","d":2,"vr":"3"}';
  const sent = interceptKasada('/api/v1/botid', `${header}\n`);

  const response = await new RoolinkClient('roo_test').generateKasadaBotID({
    script: '(function(){})();',
  });
  assertKasadaRequest(sent, {script: '(function(){})();'});
  assert.deepEqual(response, {
    b: 0,
    v: 0.08084381062192014,
    e: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..uydqejFMULzuEHyK.Eh2s.aM1k',
    s: 'q+/0Zm9v',
    d: 2,
    vr: '3',
  });
  // The x-is-human header is the response serialized back to JSON, which must match what the API sent.
  assert.equal(JSON.stringify(response), header);
});
