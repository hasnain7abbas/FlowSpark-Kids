import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'
import ffmpegPath from 'ffmpeg-static'
import {
  appUrl,
  clickCanvas,
  clickTool,
  runRiverDemo,
  selectExperiment,
  startVite,
  stopVite,
} from './capture-utils.mjs'

await mkdir('assets/demo', { recursive: true })
await rm('assets/demo/tmp', { recursive: true, force: true })
await mkdir('assets/demo/tmp', { recursive: true })

let server
let browser

try {
  server = await startVite()
  browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: 'assets/demo/tmp',
      size: { width: 1280, height: 720 },
    },
  })
  const page = await context.newPage()

  await page.goto(appUrl)
  await page.waitForSelector('.fluid-canvas')
  await page.waitForTimeout(900)

  await runRiverDemo(page)
  await selectExperiment(page, 'wind')
  await clickTool(page, 'smoke')
  await clickCanvas(page, 0.25, 0.48)
  await clickTool(page, 'fan')
  await clickCanvas(page, 0.34, 0.48)
  await page.waitForTimeout(1000)

  await selectExperiment(page, 'filter')
  await clickTool(page, 'pollution')
  await clickCanvas(page, 0.25, 0.52)
  await clickTool(page, 'water')
  await clickCanvas(page, 0.18, 0.48)
  await clickTool(page, 'filter')
  await clickCanvas(page, 0.55, 0.5)
  await page.getByRole('button', { name: 'Teacher' }).click()
  await page.waitForTimeout(1200)

  await context.close()
  await browser.close()
  browser = undefined

  const files = await readdir('assets/demo/tmp')
  const webm = files.find((file) => file.endsWith('.webm'))
  if (!webm) throw new Error('Playwright did not create a demo video')

  const webmPath = `assets/demo/tmp/${webm}`
  await rename(webmPath, 'assets/demo/flowspark-demo.webm')

  const mp4 = spawnSync(ffmpegPath, [
    '-y',
    '-i',
    'assets/demo/flowspark-demo.webm',
    '-vf',
    'fps=30,scale=1280:-2',
    '-movflags',
    'faststart',
    'assets/demo/flowspark-demo.mp4',
  ])
  if (mp4.status !== 0) {
    throw new Error(`Could not convert demo to MP4: ${mp4.stderr.toString()}`)
  }

  const gif = spawnSync(ffmpegPath, [
    '-y',
    '-i',
    'assets/demo/flowspark-demo.webm',
    '-vf',
    'fps=12,scale=960:-2:flags=lanczos',
    'assets/demo/flowspark-demo.gif',
  ])
  if (gif.status !== 0) {
    throw new Error(`Could not convert demo to GIF: ${gif.stderr.toString()}`)
  }
} finally {
  if (browser) await browser.close()
  stopVite(server)
  await rm('assets/demo/tmp', { recursive: true, force: true })
}
