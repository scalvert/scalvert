#!/usr/bin/env node
// Refreshes the generated blocks in README.md from GitHub and npm.
//
// The prose in README.md is written by hand. Only the text between
// <!-- BEGIN:name --> and <!-- END:name --> markers is generated, from the
// project list in projects.json and live data. If any request fails, the
// script exits without writing, so the README never shows partial numbers.
//
// Usage:
//   node scripts/update-readme.mjs           # update README.md in place
//   node scripts/update-readme.mjs --check   # exit 1 if README.md is stale
//
// Set GITHUB_TOKEN (or GH_TOKEN) to avoid GitHub's unauthenticated rate limit.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(root, 'README.md');
const config = JSON.parse(await readFile(path.join(root, 'projects.json'), 'utf8'));
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, headers = {}, attempt = 1) {
  const response = await fetch(url, { headers });
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(1000 * 2 ** attempt);
    return getJson(url, headers, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function github(endpoint) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${config.user}-profile-readme`,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return getJson(`https://api.github.com/${endpoint}`, headers);
}

// npm's bulk endpoint takes several unscoped names per request. It documents
// a limit of 128, but in practice returns 403 for batches of 50, so stay
// small. Scoped names must be requested one at a time.
const NPM_BATCH_SIZE = 20;

async function npmDownloads(names) {
  const counts = new Map();
  const unscoped = names.filter((name) => !name.startsWith('@'));
  const scoped = names.filter((name) => name.startsWith('@'));

  for (let i = 0; i < unscoped.length; i += NPM_BATCH_SIZE) {
    const batch = unscoped.slice(i, i + NPM_BATCH_SIZE);
    const data = await getJson(
      `https://api.npmjs.org/downloads/point/last-month/${batch.join(',')}`,
    );
    // A batch of one returns a single record instead of a map.
    const records = batch.length === 1 ? { [batch[0]]: data } : data;
    for (const name of batch) counts.set(name, records[name]?.downloads ?? 0);
  }

  for (const name of scoped) {
    const data = await getJson(
      `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
    );
    counts.set(name, data.downloads ?? 0);
    await sleep(250);
  }

  return counts;
}

async function maintainedPackages() {
  const data = await getJson(
    `https://registry.npmjs.org/-/v1/search?text=maintainer:${config.npmMaintainer}&size=250`,
  );
  return data.objects.map((entry) => entry.package.name);
}

async function mergedPullRequests() {
  const all = await github(`search/issues?q=author:${config.user}+is:pr+is:merged&per_page=1`);
  const external = await github(
    `search/issues?q=author:${config.user}+is:pr+is:merged+-user:${config.user}&per_page=1`,
  );
  return { all: all.total_count, external: external.total_count };
}

async function recentReleases() {
  const { count, maxAgeDays } = config.releases;
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const repos = await github(`users/${config.user}/repos?type=owner&sort=pushed&per_page=100`);
  const candidates = repos.filter(
    (repo) =>
      !repo.fork && !repo.archived && !repo.private && Date.parse(repo.pushed_at) >= cutoff,
  );

  const latest = [];
  for (const repo of candidates) {
    const releases = await github(`repos/${repo.full_name}/releases?per_page=10`);
    const release = releases.find((r) => !r.draft && !r.prerelease && r.published_at);
    if (release && Date.parse(release.published_at) >= cutoff) {
      latest.push({ repo, release });
    }
  }

  return latest
    .sort((a, b) => Date.parse(b.release.published_at) - Date.parse(a.release.published_at))
    .slice(0, count);
}

function compact(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1e4) return `${Math.round(n / 1e3)}k`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

// Show the short name. The link still points at the owner's repo, and an
// explicit label in projects.json wins.
function repoLabel(project) {
  return project.label ?? project.repo.split('/')[1];
}

// Zero reads as "nobody uses this" on a new project, so show nothing instead.
function count(n) {
  return n > 0 ? compact(n) : '';
}

function renderTable(projects, repoData, downloads) {
  const columns = [
    { heading: 'Project', align: '---', cell: (p, repo) => `[${repoLabel(p)}](${repo.html_url})` },
    { heading: 'What it does', align: '---', cell: (p) => p.summary },
    { heading: 'Stars', align: '--:', cell: (p, repo) => count(repo.stargazers_count) },
    { heading: 'npm/month', align: '--:', cell: (p) => (p.npm ? count(downloads.get(p.npm) ?? 0) : '') },
  ];
  const cells = projects.map((project) =>
    columns.map((column) => column.cell(project, repoData.get(project.repo))),
  );
  // Drop a column when every row in this table leaves it empty.
  const keep = columns.map((_, i) => cells.some((row) => row[i] !== ''));
  const pick = (values) => values.filter((_, i) => keep[i]);
  const line = (values) => `| ${pick(values).join(' | ')} |`;

  return [
    line(columns.map((column) => column.heading)),
    line(columns.map((column) => column.align)),
    ...cells.map(line),
  ].join('\n');
}

function renderStats({ totalDownloads, packageCount, pulls }) {
  return (
    `The ${packageCount} packages I maintain on [npm](https://www.npmjs.com/~${config.npmMaintainer}) ` +
    `get about ${compact(totalDownloads)} downloads a month. ` +
    `I've had ${pulls.all.toLocaleString('en-US')} pull requests merged on GitHub, ` +
    `${pulls.external.toLocaleString('en-US')} of them in other people's projects.`
  );
}

function renderReleases(releases) {
  if (releases.length === 0) return '_No releases in the last year._';
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return releases
    .map(
      ({ repo, release }) =>
        `- [${repo.name} ${release.tag_name}](${release.html_url}) on ` +
        `${date.format(new Date(release.published_at))}`,
    )
    .join('\n');
}

function replaceBlock(text, name, content) {
  const pattern = new RegExp(`(<!-- BEGIN:${name} -->)[\\s\\S]*?(<!-- END:${name} -->)`);
  if (!pattern.test(text)) throw new Error(`README.md has no ${name} block`);
  return text.replace(pattern, `$1\n${content}\n$2`);
}

async function main() {
  const projects = config.sections.flatMap((section) => section.projects);

  const repoData = new Map();
  for (const project of projects) {
    repoData.set(project.repo, await github(`repos/${project.repo}`));
  }

  const maintained = await maintainedPackages();
  const featuredPackages = projects.map((project) => project.npm).filter(Boolean);
  const downloads = await npmDownloads([...new Set([...maintained, ...featuredPackages])]);
  const totalDownloads = maintained.reduce((sum, name) => sum + (downloads.get(name) ?? 0), 0);

  const pulls = await mergedPullRequests();
  const releases = await recentReleases();

  const before = await readFile(readmePath, 'utf8');
  let after = replaceBlock(
    before,
    'stats',
    renderStats({ totalDownloads, packageCount: maintained.length, pulls }),
  );
  for (const section of config.sections) {
    after = replaceBlock(after, section.id, renderTable(section.projects, repoData, downloads));
  }
  after = replaceBlock(after, 'releases', renderReleases(releases));

  if (process.argv.includes('--check')) {
    if (after !== before) {
      console.error('README.md is out of date. Run node scripts/update-readme.mjs.');
      process.exit(1);
    }
    console.log('README.md is up to date.');
    return;
  }

  if (after === before) {
    console.log('README.md is already up to date.');
    return;
  }
  await writeFile(readmePath, after);
  console.log(
    `Updated README.md: ${projects.length} projects, ${maintained.length} packages, ` +
      `${releases.length} releases.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
