import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = new URL('../index.html', import.meta.url);
const readPage = () => readFileSync(page, 'utf8');

test('opens with an AIPM pain and names the product', () => {
  const html = readPage();
  assert.match(html, /模型每天更新、竞品不断改版/);
  assert.match(html, /AI 产品经理/);
  assert.match(html, /AI 产品情报雷达/);
});

test('the first screen names the audience and the breadth of public sources', () => {
  const intro = readPage().match(/<section class="intro"[\s\S]*?<\/section>/)?.[0];
  assert.ok(intro);
  assert.match(intro, /专为 AI 产品经理/);
  assert.match(intro, /官方博客/);
  assert.match(intro, /开发者更新/);
  assert.match(intro, /专业媒体/);
});

test('shared page descriptions carry the audience and evidence-first positioning', () => {
  const html = readPage();
  assert.match(html, /<meta name="description" content="面向 AI 产品经理[^\"]*官方[^\"]*来源等级/);
  assert.match(html, /<meta property="og:description" content="[^\"]*官方[^\"]*原文/);
});

test('explains official sources and a rigorous evidence-first selection rule', () => {
  const method = readPage().match(/<section id="method"[\s\S]*?<\/section>/)?.[0];
  assert.ok(method);
  assert.match(method, /OpenAI.*Google DeepMind.*Microsoft.*NVIDIA/);
  assert.match(method, /直达原文优先.*来源等级.*相关度.*多源佐证.*时效/);
  assert.match(method, /合并重复/);
  assert.match(method, /待核验线索/);
  assert.match(method, /不代表.*合作或背书/);
});

test('presents a dated, redacted historical briefing with its original source', () => {
  const html = readPage();
  assert.match(html, /真实历史简报 · 脱敏整理/);
  assert.match(html, /2026\.09\.16/);
  assert.match(html, /Introducing Gemini 3\.8 Live and 3\.8 Live Extended Thinking/);
  assert.match(html, /https:\/\/deepmind\.google\/blog\/introducing-gemini-3-8-live-and-3-8-live-extended-thinking\//);
  assert.match(html, /下一步验证/);
});

test('credits the upstream project and does not offer a subscription', () => {
  const html = readPage();
  assert.match(html, /https:\/\/github\.com\/sansan0\/TrendRadar/);
  assert.match(html, /尚未开放订阅/);
  assert.doesNotMatch(html, /<input\b|<form\b|免费试用|立即订阅|付款|价格/);
});

test('does not expose private system paths, email addresses or credentials', () => {
  const html = readPage();
  assert.doesNotMatch(html, /[\w.+-]+@[\w.-]+\.[a-z]{2,}|EMAIL_PASSWORD|AI_API_KEY|gho_|sk-|\/private\/tmp|\/Users\/|github\.com\/1ivy403\/ai-intelligence-radar(?:["'/]|$)/i);
});

test('keeps fragment links valid and has one main heading', () => {
  const html = readPage();
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(fragments.length > 0);
  for (const target of fragments) assert.ok(ids.has(target), `Missing target #${target}`);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
});

test('attributes the official illustration and leaves the briefing readable as text', () => {
  const html = readPage();
  assert.match(html, /<img\b[^>]*alt="[^"]+"/);
  assert.match(html, /图片来源：Google/);
  assert.match(html, /发生了什么/);
  assert.match(html, /为什么重要/);
  assert.match(html, /产品影响/);
});

test('uses a versioned stylesheet so readers get the matching layout after updates', () => {
  assert.match(readPage(), /href="styles\.css\?v=[0-9a-f]{8}"/);
});
