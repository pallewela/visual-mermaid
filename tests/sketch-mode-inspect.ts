/**
 * Inspect SVG structure in sketch mode - run with:
 * npx ts-node --esm tests/sketch-mode-inspect.ts
 * Or: npx playwright test tests/sketch-mode-inspect.spec.ts --config=playwright-manual.config.ts
 */
import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = 'http://localhost:5173/visual-mermaid/'
const OUTPUT_DIR = 'test-results'

// User's exact script - NOTE: .preview-container svg matches first SVG (may be Lucide icon).
// For flowchart, use svg.flowchart or svg[id^="mermaid-render"]
const inspectScript = `(() => {
  const svg = document.querySelector('.preview-container svg');
  if (!svg) return 'No SVG found';
  
  // Get all elements with class "node"
  const nodes = svg.querySelectorAll('.node');
  const nodeInfo = Array.from(nodes).map(n => ({
    id: n.id,
    classes: n.className?.baseVal || n.className,
    tagName: n.tagName,
    childTags: Array.from(n.children).map(c => c.tagName + (c.className?.baseVal ? '.' + c.className.baseVal : '')),
  }));
  
  // Also check for any g elements with text content that might be clickable
  const gElements = svg.querySelectorAll('g[id]');
  const gInfo = Array.from(gElements).slice(0, 10).map(g => ({
    id: g.id,
    classes: g.className?.baseVal || g.className,
    hasText: !!g.querySelector('text, foreignObject'),
  }));
  
  return JSON.stringify({ nodeCount: nodes.length, nodes: nodeInfo, gElements: gInfo }, null, 2);
})()`

async function main() {
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    try {
        // 1. Navigate
        await page.goto(BASE_URL, { waitUntil: 'networkidle' })

        // 2. Take initial snapshot
        fs.mkdirSync(OUTPUT_DIR, { recursive: true })
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'sketch-01-initial.png'),
            fullPage: true,
        })
        console.log('Snapshot 1: Initial state saved')

        // 3. Click Sketch button
        const sketchButton = page.getByRole('button', { name: 'Sketch' })
        await sketchButton.click()
        console.log('Clicked Sketch button')

        // 4. Wait 2 seconds for re-render
        await page.waitForTimeout(2000)

        // 5. Take snapshot after sketch mode
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'sketch-02-after-sketch.png'),
            fullPage: true,
        })
        console.log('Snapshot 2: After sketch mode saved')

        // 6. Run user's exact script (first .preview-container svg)
        const resultUser = await page.evaluate(inspectScript)
        console.log('\n--- User script output (querySelector .preview-container svg) ---\n')
        console.log(resultUser)

        // 7. Run on flowchart SVG specifically (for debugging)
        const resultFlowchart = await page.evaluate(`(() => {
          const svg = document.querySelector('.preview-container svg.flowchart, .preview-container svg[id^="mermaid-render"]');
          if (!svg) return 'No flowchart SVG found';
          const nodes = svg.querySelectorAll('.node');
          const roughNodes = svg.querySelectorAll('.rough-node');
          const gElements = svg.querySelectorAll('g[id]');
          return JSON.stringify({
            svgId: svg.id,
            nodeCount: nodes.length,
            roughNodeCount: roughNodes.length,
            gElements: Array.from(gElements).slice(0, 15).map(g => ({
              id: g.id,
              classes: g.className?.baseVal || g.className,
              hasText: !!g.querySelector('text, foreignObject'),
            })),
          }, null, 2);
        })()`)
        console.log('\n--- Flowchart SVG (sketch mode structure) ---\n')
        console.log(resultFlowchart)

        // Save to file
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'sketch-svg-inspect.json'),
            'User script:\n' + resultUser + '\n\nFlowchart SVG:\n' + resultFlowchart
        )
        console.log('\nResult saved to test-results/sketch-svg-inspect.json')
    } finally {
        await browser.close()
    }
}

main().catch(console.error)
