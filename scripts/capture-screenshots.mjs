import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import {
  appUrl,
  clickTool,
  clickCanvas,
  runFloodDemo,
  runRiverDemo,
  selectExperiment,
  startVite,
  stopVite,
} from './capture-utils.mjs'

await mkdir('assets/screenshots', { recursive: true })

let server
let browser

try {
  server = await startVite()
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(appUrl)
  await page.waitForSelector('.fluid-canvas')
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'assets/screenshots/home.png', fullPage: false })

  await runRiverDemo(page)
  await page.screenshot({
    path: 'assets/screenshots/experiment-river.png',
    fullPage: false,
  })

  await runFloodDemo(page)
  await page.screenshot({
    path: 'assets/screenshots/experiment-flood.png',
    fullPage: false,
  })

  await selectExperiment(page, 'filter')
  await clickTool(page, 'pollution')
  await clickCanvas(page, 0.28, 0.5)
  await clickTool(page, 'water')
  await clickCanvas(page, 0.18, 0.48)
  await clickTool(page, 'filter')
  await clickCanvas(page, 0.57, 0.5)
  await page.getByRole('button', { name: 'Teacher' }).click()
  await page.waitForTimeout(900)
  await page.screenshot({
    path: 'assets/screenshots/teacher-mode.png',
    fullPage: false,
  })
} finally {
  if (browser) await browser.close()
  stopVite(server)
}
