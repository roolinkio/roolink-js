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

// Answers one POST to path on origin with reply and status. The returned object holds the request once the client
// sends it.
function interceptJSON(origin, path, reply, status = 200) {
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  const sent = {};
  agent
    .get(origin)
    .intercept({path, method: 'POST'})
    .reply(
      status,
      request => {
        Object.assign(sent, request);
        return reply;
      },
      {headers: {'Content-Type': 'application/json'}},
    );
  return sent;
}

function assertJSONRequest(sent, body) {
  assert.equal(sent.headers['x-api-key'], 'roo_test');
  assert.equal(sent.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(sent.body), body);
}

test('kasada payload', async () => {
  const sent = interceptJSON(
    'https://ksd.roolink.io',
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
  assertJSONRequest(sent, req);
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
    const sent = interceptJSON(
      'https://ksd.roolink.io',
      '/api/v1/cd',
      JSON.stringify({payload: cd}),
    );
    const response = await new RoolinkClient('roo_test').generateKasadaCD(req);
    assertJSONRequest(sent, req);
    assert.deepEqual(response, {payload: cd});
  }
});

test('kasada botid', async () => {
  const header =
    '{"b":0,"v":0.08084381062192014,"e":"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..uydqejFMULzuEHyK.Eh2s.aM1k","s":"q+/0Zm9v","d":2,"vr":"3"}';
  const sent = interceptJSON(
    'https://ksd.roolink.io',
    '/api/v1/botid',
    `${header}\n`,
  );

  const response = await new RoolinkClient('roo_test').generateKasadaBotID({
    script: '(function(){})();',
  });
  assertJSONRequest(sent, {script: '(function(){})();'});
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

test('imperva payload', async () => {
  // Callers post the submission to Imperva unchanged, so the client must return the text the API sent.
  const submission =
    '{"solution":{"interrogation":{"p":"AAEC/w==","st":1788893087,"sr":3420118839,"cr":2045817226,"og":2},"version":"stable"},"old_token":null,"error":null,"errors":[],"performance":{"1030820235":41,"4203433130":12,"total":43}}';
  const req = {
    script: '(function(){})();',
    scriptUrl: '/Hedge-the-Stage-Thy-Seed/script.js',
    pageUrl: 'https://www.example.com/',
    userAgent: 'Mozilla/5.0',
    language: 'en-US,en;q=0.9',
  };
  for (const pow of [{pow: 'eyJjIjoiYWJjIiwiZCI6NH0='}, {}]) {
    const sent = interceptJSON(
      'https://imperva.roolink.io',
      '/api/v1/payload',
      submission,
    );
    const response = await new RoolinkClient('roo_test').generateImpervaPayload(
      {...req, ...pow},
    );
    assertJSONRequest(sent, {...req, ...pow});
    assert.equal(response, submission);
  }
});

test('imperva payload error', async () => {
  // An error body is JSON as well, and posting it to Imperva as a submission would fail without saying why.
  interceptJSON(
    'https://imperva.roolink.io',
    '/api/v1/payload',
    '{"code":"device_not_found","error":"no collected browser has this User-Agent"}',
    422,
  );
  await assert.rejects(
    new RoolinkClient('roo_test').generateImpervaPayload({
      script: '(function(){})();',
      scriptUrl: '/Hedge-the-Stage-Thy-Seed/script.js',
      pageUrl: 'https://www.example.com/',
      userAgent: 'Mozilla/5.0',
      language: 'en-US,en;q=0.9',
    }),
    /device_not_found/,
  );
});

test('imperva utmvc', async () => {
  const cookie = {
    name: '___utmvc',
    value:
      'jxKgPCxkaWdlc3Q9NzI2MSxzPTlkYTQ5YmE0OWY1ZmE5OTJhM2E2NjNhMWEzYTdhOQ==',
    cookie:
      '___utmvc=jxKgPCxkaWdlc3Q9NzI2MSxzPTlkYTQ5YmE0OWY1ZmE5OTJhM2E2NjNhMWEzYTdhOQ==',
    setCookie:
      '___utmvc=jxKgPCxkaWdlc3Q9NzI2MSxzPTlkYTQ5YmE0OWY1ZmE5OTJhM2E2NjNhMWEzYTdhOQ==; expires=Mon, 09 Nov 2026 19:04:40 GMT; path=/',
    fingerprint: 'navigator%3Dtrue,navigator.vendor%3DGoogle%20Inc.',
    digest: '7261',
    signature: '9da49ba49f5fa992a3a663a1a3a7a9',
    salt: 'fresh-salt-plus',
    key: 'fresh',
    version: 'version-one',
    windowKeyCount: 289,
  };
  // The API requires cookies, so an empty document.cookie must still be sent.
  for (const cookies of [
    'incap_ses_1234_567890=abc; visid_incap_567890=def',
    '',
  ]) {
    const sent = interceptJSON(
      'https://imperva.roolink.io',
      '/api/v1/utmvc',
      `${JSON.stringify(cookie)}\n`,
    );
    const req = {script: '(function(){})();', cookies, userAgent: 'Mozilla/5.0'};
    const response = await new RoolinkClient('roo_test').generateImpervaUTMVC(
      req,
    );
    assertJSONRequest(sent, req);
    assert.deepEqual(response, cookie);
  }
});
