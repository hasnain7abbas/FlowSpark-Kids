import { mkdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

await mkdir('public', { recursive: true })

const iconSvg = await readFile('public/icon.svg')

await sharp(iconSvg).resize(180, 180).png().toFile('public/apple-touch-icon.png')

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#EAF8FC"/>
      <stop offset="0.58" stop-color="#F8FBF0"/>
      <stop offset="1" stop-color="#EDE8FB"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#17324D" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="1200" height="630" rx="48" fill="url(#bg)"/>
  <circle cx="170" cy="130" r="72" fill="#FFFFFF" opacity="0.62"/>
  <circle cx="1035" cy="126" r="92" fill="#FFFFFF" opacity="0.55"/>
  <path d="M0 492 C190 424 320 548 492 482 C676 412 822 464 1200 392 V630 H0Z" fill="#9ADBE7" opacity="0.66"/>
  <path d="M0 530 C230 476 380 586 556 522 C752 452 920 512 1200 452 V630 H0Z" fill="#1AA8D9" opacity="0.24"/>
  <g transform="translate(112 142) scale(2.65)" filter="url(#shadow)">
    ${iconSvg.toString().replace(/<\?xml[^>]*>/g, '').replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
  <text x="440" y="228" fill="#17324D" font-family="Arial Rounded MT Bold, Nunito Sans, Arial, sans-serif" font-size="76" font-weight="800">FlowSpark Kids</text>
  <text x="445" y="300" fill="#087CA7" font-family="Nunito Sans, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="1">Tiny experiments. Big science moments.</text>
  <text x="446" y="383" fill="#506A78" font-family="Nunito Sans, Arial, sans-serif" font-size="30">A colorful fluid and nature simulation playground</text>
  <text x="446" y="426" fill="#506A78" font-family="Nunito Sans, Arial, sans-serif" font-size="30">for curious young scientists.</text>
  <g transform="translate(448 492)">
    <rect width="194" height="50" rx="25" fill="#FFFFFF" opacity="0.86"/>
    <circle cx="34" cy="25" r="11" fill="#1AA8D9"/>
    <text x="58" y="33" fill="#17324D" font-family="Nunito Sans, Arial, sans-serif" font-size="19" font-weight="800">Water</text>
  </g>
  <g transform="translate(666 492)">
    <rect width="192" height="50" rx="25" fill="#FFFFFF" opacity="0.86"/>
    <circle cx="34" cy="25" r="11" fill="#49A66F"/>
    <text x="58" y="33" fill="#17324D" font-family="Nunito Sans, Arial, sans-serif" font-size="19" font-weight="800">Nature</text>
  </g>
  <g transform="translate(882 492)">
    <rect width="172" height="50" rx="25" fill="#FFFFFF" opacity="0.86"/>
    <circle cx="34" cy="25" r="11" fill="#7B61C9"/>
    <text x="58" y="33" fill="#17324D" font-family="Nunito Sans, Arial, sans-serif" font-size="19" font-weight="800">Air</text>
  </g>
</svg>`

await writeFile('public/og-image.svg', ogSvg)
await sharp(Buffer.from(ogSvg)).png().toFile('public/og-image.png')
