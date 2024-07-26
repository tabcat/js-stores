/* eslint-disable no-console */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runScript () {
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--enable-features=OriginPrivateFileSystem',
      '--enable-blink-features=FileSystemAccessAPI'
    ]
  })
  const page = await browser.newPage()
  await page.goto('https://newtab.eth.limo') // any secure context site, too lazy to setup local

  // Read the script file
  const scriptPath = path.join(__dirname, 'dist', 'index.min.js')
  const scriptContent = await fs.readFile(scriptPath, 'utf8')

  // Set up console log listener
  // eslint-disable-next-line no-console
  page.on('console', message => {
    console.log(message.type())
    if (message.type() === 'info') {
      console.table(JSON.parse(message.text()))
      browser.close()
    } else if (message.type() === 'error') {
      console.error(message.text())
      browser.close()
    } else {
      console.log(message.text())
    }
  })

  // Execute the script in the browser context
  await page.evaluate(scriptContent)
}

runScript().catch(error => {
  // eslint-disable-next-line no-console
  console.error('An error occurred:', error)
  process.exit(1)
})
