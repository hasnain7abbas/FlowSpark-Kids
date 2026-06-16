import { spawn, spawnSync } from 'node:child_process'

export const appUrl = 'http://127.0.0.1:5174'

export const waitForServer = async (url, timeoutMs = 30000) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  throw new Error(`Timed out waiting for ${url}`)
}

export const startVite = async () => {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm run dev -- --host 127.0.0.1 --port 5174']
      : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5174']
  const server = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout.on('data', (chunk) => process.stdout.write(chunk))
  server.stderr.on('data', (chunk) => process.stderr.write(chunk))

  await waitForServer(appUrl)
  return server
}

export const stopVite = (server) => {
  if (!server || server.killed) return

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
    })
    return
  }

  server.kill()
}

export const clickTool = async (page, toolId) => {
  await page.locator(`[data-tool-id="${toolId}"]`).click()
}

export const selectExperiment = async (page, experimentId) => {
  await page.locator(`[data-experiment-id="${experimentId}"]`).click()
}

export const canvasBox = async (page) => {
  const box = await page.locator('.fluid-canvas').boundingBox()
  if (!box) throw new Error('Could not find simulation canvas')
  return box
}

export const clickCanvas = async (page, xRatio, yRatio) => {
  const box = await canvasBox(page)
  await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio)
}

export const dragCanvas = async (page, points) => {
  const box = await canvasBox(page)
  const [first, ...rest] = points
  await page.mouse.move(box.x + box.width * first[0], box.y + box.height * first[1])
  await page.mouse.down()
  for (const point of rest) {
    await page.mouse.move(box.x + box.width * point[0], box.y + box.height * point[1], {
      steps: 9,
    })
  }
  await page.mouse.up()
}

export const runRiverDemo = async (page) => {
  await selectExperiment(page, 'river')
  await clickTool(page, 'water')
  await clickCanvas(page, 0.13, 0.33)
  await dragCanvas(page, [
    [0.16, 0.38],
    [0.34, 0.52],
    [0.55, 0.49],
    [0.78, 0.43],
  ])
  await clickTool(page, 'rock')
  await clickCanvas(page, 0.45, 0.5)
  await clickTool(page, 'wall')
  await clickCanvas(page, 0.58, 0.65)
  await clickTool(page, 'drain')
  await clickCanvas(page, 0.9, 0.45)
  await page.waitForTimeout(1300)
}

export const runFloodDemo = async (page) => {
  await selectExperiment(page, 'flood')
  await clickTool(page, 'rain')
  await clickCanvas(page, 0.48, 0.18)
  await clickTool(page, 'tree')
  await clickCanvas(page, 0.37, 0.61)
  await clickCanvas(page, 0.49, 0.67)
  await clickTool(page, 'wall')
  await clickCanvas(page, 0.58, 0.73)
  await clickTool(page, 'drain')
  await clickCanvas(page, 0.77, 0.74)
  await page.waitForTimeout(1300)
}
