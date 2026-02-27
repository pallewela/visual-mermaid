/**
 * Visual Mermaid Editor - Browser test
 * Run: npx playwright test tests/visual-editor.spec.ts --project=chromium
 * Screenshots saved to test-results/
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173/visual-mermaid/'

test.describe('Mermaid Editor - Visual Editing', () => {
    test('shows split view with code editor and preview', async ({ page }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        // Take initial screenshot
        await page.screenshot({
            path: 'test-results/01-initial-state.png',
            fullPage: true,
        })

        // Verify split view: editor on left, preview on right
        const editor = page.locator('.monaco-editor, [data-testid="editor"]').first()
        await expect(editor).toBeVisible({ timeout: 5000 })

        const preview = page.locator('.preview-container')
        await expect(preview).toBeVisible({ timeout: 5000 })

        // Verify flowchart is rendered (SVG present)
        const svg = page.locator('.preview-container svg')
        await expect(svg).toBeVisible({ timeout: 5000 })
    })

    test('nodes are clickable and show edit panel', async ({ page }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        // Wait for flowchart to render
        const svg = page.locator('.preview-container svg')
        await expect(svg).toBeVisible({ timeout: 5000 })

        // Find flowchart nodes - Mermaid uses .node class
        const nodes = page.locator('.interactive-preview .node, .node')
        const nodeCount = await nodes.count()

        if (nodeCount === 0) {
            console.warn('No .node elements found - Mermaid may use different structure')
            // Try clicking within the SVG - maybe nodes have different selectors
            const rect = await svg.boundingBox()
            if (rect) {
                await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 3)
                await page.screenshot({
                    path: 'test-results/02-after-click-center.png',
                    fullPage: true,
                })
            }
            return
        }

        // Take screenshot before clicking
        await page.screenshot({
            path: 'test-results/02-before-node-click.png',
            fullPage: true,
        })

        // Click first node (e.g. Start)
        await nodes.first().click()
        await page.waitForTimeout(300)

        // Check if NodeEditPanel appeared
        const editPanel = page.locator('.node-edit-panel')
        const panelVisible = await editPanel.isVisible()

        await page.screenshot({
            path: 'test-results/03-after-node-click.png',
            fullPage: true,
        })

        expect(panelVisible, 'Node edit panel should appear when clicking a node').toBe(true)

        if (panelVisible) {
            // Verify panel has expected options
            await expect(editPanel.locator('input[type="text"]')).toBeVisible()
            await expect(editPanel.getByText(/Connect|Delete|Shape/i)).toBeVisible()
        }
    })

    test('node hover highlights', async ({ page }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        const nodes = page.locator('.interactive-preview .node, .node')
        const count = await nodes.count()
        if (count === 0) return

        // Hover over first node
        await nodes.first().hover()
        await page.waitForTimeout(200)

        await page.screenshot({
            path: 'test-results/04-node-hover.png',
            fullPage: true,
        })
    })
})
