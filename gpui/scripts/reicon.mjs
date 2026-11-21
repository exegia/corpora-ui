// Regenerates the Reicon icons the GPUI port draws.
//
// GPUI Component asks its asset source for Lucide file names
// (`icons/search.svg`). `corpora_ui::Assets` answers those paths with the
// Reicon drawing of the same idea, so the stock components and the Corpora
// ones share one icon language. This script writes those SVGs and the Rust
// table that embeds them.
//
// Usage, from a scratch directory (never the repo root):
//
//   npm pack reicon reicon-brands && for f in *.tgz; do mkdir "${f%.tgz}" && tar xzf "$f" -C "${f%.tgz}"; done
//   node <repo>/gpui/scripts/reicon.mjs reicon-<version>/package reicon-brands-<version>/package
//
// To add an icon, add a line to ICONS (or BRANDS) and run it again.

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Lucide file name -> Reicon icon. A trailing `:F` picks the filled weight.
const ICONS = {
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'at-sign': 'AtSign',
  'badge-check': 'Verified',
  ban: 'Ban',
  battery: 'BatteryEmpty',
  'battery-charging': 'BatteryCharging',
  'battery-full': 'BatteryFull',
  'battery-low': 'BatteryLow',
  'battery-medium': 'BatteryHalf',
  bell: 'Bell',
  'book-open': 'BookOpen',
  'building-2': 'Building2',
  calendar: 'Calendar',
  'chart-pie': 'ChartPie',
  check: 'Check',
  'chevron-down': 'ChevronDown',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'chevron-up': 'ChevronUp',
  'chevrons-up-down': 'ChevronExpandY',
  'circle-alert': 'AlertCircle',
  'circle-check': 'CheckCircle',
  'circle-user': 'UserCircle',
  'circle-x': 'XCircle',
  close: 'X',
  copy: 'Copy',
  cpu: 'Cpu',
  dash: 'Minus',
  delete: 'Trash',
  download: 'Download',
  ellipsis: 'MoreH',
  'external-link': 'ArrowUpRightSquare',
  eye: 'Eye',
  'eye-off': 'EyeOff',
  file: 'File',
  'file-text': 'FileText',
  film: 'Film',
  folder: 'Folder',
  'folder-closed': 'Folder',
  'folder-open': 'FolderOpen',
  frame: 'Frame',
  'gallery-vertical-end': 'Layers',
  globe: 'Globe',
  'hard-drive': 'HardDrive',
  heart: 'Heart',
  'heart-off': 'HeartOff',
  image: 'Image',
  inbox: 'Inbox',
  info: 'InfoCircle',
  'layout-dashboard': 'Category',
  'link-2': 'Link2',
  lock: 'Lock',
  map: 'Map',
  'map-pin': 'Location',
  maximize: 'Maximize',
  'maximize-2': 'Maximize2',
  'memory-stick': 'Ram',
  menu: 'Menu',
  mic: 'Mic',
  minimize: 'Minimize',
  minus: 'Minus',
  moon: 'Moon',
  network: 'Hierarchy',
  palette: 'Palette',
  paperclip: 'Paperclip',
  'panel-bottom': 'SidebarBottom',
  'panel-bottom-open': 'SidebarBottom',
  'panel-left': 'SidebarLeft',
  'panel-left-close': 'SidebarLeft',
  'panel-left-open': 'SidebarLeft',
  'panel-right': 'SidebarRight',
  'panel-right-close': 'SidebarRight',
  'panel-right-open': 'SidebarRight',
  pause: 'Pause',
  play: 'Play',
  plus: 'Plus',
  redo: 'Redo',
  'redo-2': 'Redo',
  'refresh-cw': 'Refresh',
  replace: 'ArrowSwapHorizontal',
  reply: 'Reply',
  'rotate-cw': 'RotateRight',
  search: 'Search',
  settings: 'Settings',
  'share-2': 'Share',
  'settings-2': 'Settings2',
  'sort-ascending': 'SortAsc',
  'sort-descending': 'SortDesc',
  sparkle: 'Sparkle',
  sparkles: 'Sparkles',
  'square-terminal': 'TerminalSquare',
  star: 'Star',
  'star-fill': 'Star:F',
  'star-off': 'StarOff',
  sun: 'Sun',
  'text-align-start': 'TextalignLeft',
  'text-quote': 'QuoteDown',
  'thumbs-down': 'ThumbsDown',
  'thumbs-up': 'ThumbsUp',
  'triangle-alert': 'AlertTriangle',
  undo: 'Undo',
  'undo-2': 'Undo',
  user: 'User',
  users: 'Users',
};

// Lucide file name -> Reicon brand mark.
const BRANDS = {
  apple: 'Apple',
  github: 'Github',
};

const [iconsPackage, brandsPackage] = process.argv.slice(2);
if (!iconsPackage || !brandsPackage) {
  console.error('usage: reicon.mjs <reicon package dir> <reicon-brands package dir>');
  process.exit(1);
}

const crate = resolve(dirname(fileURLToPath(import.meta.url)), '../crates/corpora-ui');
const out = join(crate, 'assets/icons');

async function load(packageDir, name) {
  const file = resolve(packageDir, 'icons', `${name}.js`);
  return (await import(pathToFileURL(file).href)).default;
}

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${body.trim()}</svg>\n`;
}

await mkdir(out, { recursive: true });
// Only the drawings are regenerated; the licence beside them stays.
for (const file of await readdir(out)) {
  if (file.endsWith('.svg')) await rm(join(out, file));
}

for (const [file, spec] of Object.entries(ICONS)) {
  const [name, weight = 'O'] = spec.split(':');
  const icon = await load(iconsPackage, name);
  const body = icon.iconData[weight];
  if (!body) throw new Error(`${name} has no ${weight} weight`);
  await writeFile(join(out, `${file}.svg`), svg(body));
}

for (const [file, name] of Object.entries(BRANDS)) {
  const mark = await load(brandsPackage, name);
  // A brand mark is one solid shape; it takes the text color like any icon.
  const markup = mark.toSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  await writeFile(
    join(out, `${file}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${markup.trim()}</svg>\n`,
  );
}

const files = (await readdir(out)).filter((file) => file.endsWith('.svg')).sort();
const arms = files
  .map((file) => `        "icons/${file}" => include_bytes!("../assets/icons/${file}"),`)
  .join('\n');
const paths = files.map((file) => `    "icons/${file}",`).join('\n');

await writeFile(
  join(crate, 'src/reicon.rs'),
  `//! The Reicon drawings served in place of Lucide ones.
//!
//! Generated by \`gpui/scripts/reicon.mjs\`. Edit the table there, not here.

/// Every path [\`load\`] answers.
pub(crate) const PATHS: &[&str] = &[
${paths}
];

/// The Reicon drawing for a Lucide asset path, if the port ships one.
pub(crate) fn load(path: &str) -> Option<&'static [u8]> {
    Some(match path {
${arms}
        _ => return None,
    })
}
`,
);

console.log(`wrote ${files.length} icons to ${out}`);
