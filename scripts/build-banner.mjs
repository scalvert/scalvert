#!/usr/bin/env node
// Writes assets/banner-dark.svg and assets/banner-light.svg.
// Edit the lines or palettes here, then run: node scripts/build-banner.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Colors follow GitHub's own dark and light themes.
const palettes = {
  dark: {
    panel: '#0d1117',
    bar: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    muted: '#9198a1',
    prompt: '#3fb950',
    accent: '#58a6ff',
  },
  light: {
    panel: '#ffffff',
    bar: '#f6f8fa',
    border: '#d1d9e0',
    text: '#1f2328',
    muted: '#59636e',
    prompt: '#1a7f37',
    accent: '#0969da',
  },
};

const font = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const focus = ['developer platforms', 'MCP', 'agent tooling', 'testing', 'docs tooling'];

function banner(c) {
  const separator = `<tspan fill="${c.muted}"> · </tspan>`;
  const focusLine = focus.map((item) => `<tspan fill="${c.accent}">${item}</tspan>`).join(separator);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="300" viewBox="0 0 960 300" role="img" aria-labelledby="title desc">
  <title id="title">Steve Calvert</title>
  <desc id="desc">A terminal window. whoami prints: Steve Calvert, software engineer at Glean. cat ~/focus prints: ${focus.join(', ')}.</desc>
  <rect x="1" y="1" width="958" height="298" rx="12" fill="${c.panel}" stroke="${c.border}" stroke-width="2"/>
  <path d="M1 13 a12 12 0 0 1 12 -12 h934 a12 12 0 0 1 12 12 v31 h-958 z" fill="${c.bar}"/>
  <line x1="1" y1="44" x2="959" y2="44" stroke="${c.border}" stroke-width="2"/>
  <circle cx="28" cy="23" r="7" fill="#ff5f57"/>
  <circle cx="52" cy="23" r="7" fill="#febc2e"/>
  <circle cx="76" cy="23" r="7" fill="#28c840"/>
  <text x="480" y="28" text-anchor="middle" font-family="${font}" font-size="14" fill="${c.muted}">scalvert@github: ~</text>
  <g font-family="${font}" font-size="19">
    <text x="40" y="92"><tspan fill="${c.prompt}">$</tspan><tspan fill="${c.text}"> whoami</tspan></text>
    <text x="40" y="132" font-size="30" font-weight="700" fill="${c.text}">Steve Calvert<tspan font-size="19" font-weight="400" fill="${c.muted}">  software engineer at Glean</tspan></text>
    <text x="40" y="186"><tspan fill="${c.prompt}">$</tspan><tspan fill="${c.text}"> cat ~/focus</tspan></text>
    <text x="40" y="220">${focusLine}</text>
    <text x="40" y="266"><tspan fill="${c.prompt}">$</tspan></text>
    <rect x="62" y="250" width="11" height="21" fill="${c.text}">
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>
`;
}

for (const [name, palette] of Object.entries(palettes)) {
  const file = path.join(root, 'assets', `banner-${name}.svg`);
  await writeFile(file, banner(palette));
  console.log(`Wrote ${path.relative(root, file)}`);
}
