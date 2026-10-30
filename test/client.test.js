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
