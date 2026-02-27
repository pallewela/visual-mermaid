/**
 * Manual visual test - run with: npx playwright test tests/manual-visual-test.ts --project=chromium
 * Captures screenshots at each step for visual verification
 */
import { test } from '@playwright/test'

const BASE_URL = 'http://localhost:5173/visual-mermaid/'

test('visual editing flow with screenshots', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 1. Initial state
    await page.screenshot({
        path: 'test-results/01-initial-state.png',
        fullPage: true,
    })

    // Use flowchart SVG specifically (not Lucide icons)
    const flowchartSvg = page.locator('.preview-container svg.flowchart, .preview-container svg[id^="mermaid-render"]')
    await flowchartSvg.waitFor({ state: 'visible', timeout: 5000 })

    // 2. Find nodes - Mermaid flowchart nodes have .node class
    const nodes = page.locator('.interactive-preview .node')
    const nodeCount = await nodes.count()
    console.log('Found', nodeCount, 'nodes')

    if (nodeCount > 0) {
        // Hover over first node (Start)
        await nodes.first().hover()
        await page.waitForTimeout(300)
        await page.screenshot({
            path: 'test-results/02-hover-on-node.png',
            fullPage: true,
        })

        // 3. Click first node
        await nodes.first().click()
        await page.waitForTimeout(400)

        // Check for edit panel
        const editPanel = page.locator('.node-edit-panel')
        const panelVisible = await editPanel.isVisible()
        console.log('Edit panel visible:', panelVisible)

        await page.screenshot({
            path: 'test-results/03-after-node-click.png',
            fullPage: true,
        })

        if (panelVisible) {
            await page.screenshot({
                path: 'test-results/04-edit-panel-visible.png',
                fullPage: true,
            })
        }
    }
})
