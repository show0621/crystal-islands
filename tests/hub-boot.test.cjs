const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = name => fs.readFileSync(path.join(__dirname, '..', 'dist', name), 'utf8');

test('the first HTML paint shows the hub boot copy instead of the homepage', () => {
  const html = read('index.html');
  assert.match(html, /<body class="hub-booting">/);
  assert.match(html, /id="hub-boot"/);
  assert.match(html, /正在準備群島與居民/);
  assert.match(html, /id="hub-boot-css"/);
  assert.match(html, /body\.hub-booting>:not\(#hub-boot\)\{visibility:hidden!important\}/);
  assert.ok(html.indexOf('id="hub-boot"') < html.indexOf('<header'));
  assert.ok(html.indexOf('window.TPHubBoot=') < html.indexOf('src="app.js"'));
});

test('the old flat map is not painted while the hub is still booting', () => {
  const app = read('app.js');
  assert.match(app, /function drawMap\(\)\{if\(document\.body\.classList\.contains\('hub-booting'\)\|\|document\.getElementById\('island-canvas'\)\)return;/);
});

test('the 3D scene marks itself ready after the first painted frame', () => {
  const scene = read('island-3d.js');
  assert.match(scene, /TPHubBoot\?\.ready\('scene'\)/);
  assert.match(scene, /function safeRender\(/);
  assert.match(scene, /canvas\.dataset\.renderState==='active'\)window\.TPHubBoot\?\.ready\('scene'\)/);
});

test('the homepage stays hidden until both the scene and the hub UI are ready', () => {
  const html = read('index.html');
  const stage = read('island-stage.js');
  const css = read('island-stage.css');
  assert.match(html, /marks\.has\('scene'\)&&marks\.has\('ui'\)\)hide\(\)/);
  assert.match(html, /setTimeout\(hide,8000\)/);
  assert.match(stage, /TPHubBoot\?\.ready\('ui'\)/);
  assert.match(css, /body\.hub-booting>:not\(#hub-boot\)\{visibility:hidden!important\}/);
});
