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

test('keeps the original introduction, evidence bar and method copy', () => {
  const html = readPage();
  assert.match(html, /基于 TrendRadar · 为 AI 产品经理定制/);
  assert.match(html, /从公开信源筛选模型、竞品和产品变化，附原始链接与产品影响/);
  assert.match(html, /从哪里来，如何判断/);
  assert.match(html, /按问题与来源排序/);
});

test('shows the configured sources by type immediately after the introduction', () => {
  const html = readPage();
  const introEnd = html.indexOf('</section>', html.indexOf('<section class="intro"'));
  const sourcesStart = html.indexOf('<section class="sources"');
  const evidenceStart = html.indexOf('<section class="evidence"');
  assert.ok(introEnd < sourcesStart && sourcesStart < evidenceStart);

  const sources = html.slice(sourcesStart, evidenceStart);
  assert.match(sources, /10 路订阅源.*5 个公开热榜/);
  assert.match(sources, /官方与开发者[\s\S]*OpenAI.*Google DeepMind.*Microsoft.*NVIDIA.*Hugging Face/);
  assert.match(sources, /科技媒体与观察[\s\S]*WIRED.*量子位.*Simon Willison/);
  assert.match(sources, /热榜线索[\s\S]*华尔街见闻.*财联社.*微博.*知乎/);
  assert.match(sources, /原文为准/);
});

test('removes the scenarios section and keeps remaining sections numbered in order', () => {
  const html = readPage();
  assert.doesNotMatch(html, /id="scenarios"|href="#scenarios"|适用场景|需要做判断的时刻，先找到依据/);
  assert.match(html, /href="#briefing"/);
  assert.match(html, /href="#method"/);
  assert.match(html, /01 \/ 实际产出/);
  assert.match(html, /02 \/ 工作方式/);
  assert.match(html, /03 \/ 项目说明/);
});

test('presents the complete September 17 briefing with five source-linked items', () => {
  const html = readPage();
  assert.match(html, /真实历史简报 · 脱敏整理/);
  assert.match(html, /2026-09-17 13:44:18/);
  assert.match(html, /抓取 109 条.*筛出 5 条.*15 个来源，14 个正常/);
  const report = html.slice(html.indexOf('<section id="briefing"'), html.indexOf('<section id="method"'));
  assert.equal([...report.matchAll(/<article class="brief-item"/g)].length, 5);
  assert.equal([...report.matchAll(/<dt>发生了什么<\/dt>/g)].length, 5);
  assert.equal([...report.matchAll(/<dt>为什么重要<\/dt>/g)].length, 5);
  assert.equal([...report.matchAll(/<dt>产品影响<\/dt>/g)].length, 5);
  for (const url of [
    'https://developer.nvidia.com/blog/how-to-use-ai-agents-to-prepare-3d-scenes-for-simulation/',
    'https://www.qbitai.com/2026/09/490974.html',
    'https://www.wired.com/story/washington-wont-be-regulating-ai-anytime-soon/',
    'https://www.qbitai.com/2026/09/490839.html',
    'https://simonwillison.net/2026/Sep/16/one-claude/',
  ]) assert.ok(report.includes(url), `Missing original source: ${url}`);
  assert.match(report, /今日重点[\s\S]*今日观察[\s\S]*行动建议/);
  assert.match(report, /由 TrendRadar 生成/);
  assert.match(report, /自动生成.*核验/);
  assert.doesNotMatch(html, /2026\.09\.16|Gemini 3\.8 Live/);
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
  assert.match(html, /图片来源：NVIDIA Developer Blog/);
  assert.match(html, /发生了什么/);
  assert.match(html, /为什么重要/);
  assert.match(html, /产品影响/);
});

test('uses a versioned stylesheet so readers get the matching layout after updates', () => {
  assert.match(readPage(), /href="styles\.css\?v=[0-9a-f]{8}"/);
});
