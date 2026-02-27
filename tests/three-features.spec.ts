/**
 * Test 1: Sketch mode clicking
 * Test 2: Border color picker in dialog
 * Test 3: Classic mode dialog
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173/visual-mermaid/'

test.describe('Three features test', () => {
    test('Test 1: Sketch mode - click node and verify edit panel', async ({
        page,
    }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        // 1. Initial snapshot
        await page.screenshot({
            path: 'test-results/t1-01-initial.png',
            fullPage: true,
        })

        // 2. Click Sketch button
        await page.getByRole('button', { name: 'Sketch' }).click()

        // 3. Wait 2 seconds for re-render
        await page.waitForTimeout(2000)

        // 4. Snapshot showing sketch mode
        await page.screenshot({
            path: 'test-results/t1-02-sketch-mode.png',
            fullPage: true,
        })

        // 5. Click on a node - use rough-node in sketch mode
        const node = page.locator('.preview-container .rough-node').first()
        await node.click()

        // 6. Wait 1 second
        await page.waitForTimeout(1000)

        // 7. Snapshot - edit panel should appear
        await page.screenshot({
            path: 'test-results/t1-03-after-node-click.png',
            fullPage: true,
        })

        // 8. Report: check if dialog appeared
        const editPanel = page.locator('.node-edit-panel')
        const panelVisible = await editPanel.isVisible()
        expect(panelVisible, 'Edit panel should appear when clicking node in sketch mode').toBe(true)
    })

    test('Test 2: Border color picker in dialog', async ({ page }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        // Enable sketch mode
        await page.getByRole('button', { name: 'Sketch' }).click()
        await page.waitForTimeout(2000)

        // Click on a node to open dialog
        const node = page.locator('.preview-container .rough-node').first()
        await node.click()
        await page.waitForTimeout(500)

        const editPanel = page.locator('.node-edit-panel')
        await expect(editPanel).toBeVisible()

        // 9. Check for Fill Color AND Border Color sections
        const fillSection = editPanel.getByText('Fill Color')
        const borderLabel = editPanel.getByText('Border Color')
        const hasFill = await fillSection.isVisible()
        const hasBorder = await borderLabel.isVisible()

        expect(hasFill, 'Dialog should have Fill Color section').toBe(true)
        expect(hasBorder, 'Dialog should have Border Color section').toBe(true)

        // 10. Click a border color swatch - find the Border Color section's swatches
        const borderSectionDiv = editPanel.locator('div').filter({
            has: page.locator('text=Border Color'),
        })
        const strokeButtons = borderSectionDiv.locator('button.fill-swatch')
        const count = await strokeButtons.count()
        if (count > 0) {
            await strokeButtons.nth(1).click() // Click second color (orange)
        }

        // 11. Wait 1 second
        await page.waitForTimeout(1000)

        // 12. Snapshot
        await page.screenshot({
            path: 'test-results/t2-01-after-border-click.png',
            fullPage: true,
        })

        // 13. Check if style line with stroke: exists - Monaco stores content, try to get it
        const codeContent = await page.evaluate(() => {
            const monaco = document.querySelector('.monaco-editor')
            if (!monaco) return ''
            const lines = monaco.querySelectorAll('.view-line')
            return Array.from(lines)
                .map((l) => l.textContent || '')
                .join('\n')
        })
        const hasStrokeInCode = /stroke:\s*#?[\w]+/.test(codeContent)
        expect(
            hasStrokeInCode,
            'Mermaid code should have stroke: in style after clicking border color'
        ).toBe(true)
    })

    test('Test 3: Classic mode - dialog has Fill and Border Color', async ({
        page,
    }) => {
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        // 14. Click Sketch again to go back to classic mode (if it was on)
        const sketchBtn = page.getByRole('button', { name: 'Sketch' })
        const isActive = await sketchBtn.evaluate(
            (el) => el.classList.contains('toggle-active') || el.getAttribute('aria-pressed') === 'true'
        )
        if (isActive) {
            await sketchBtn.click()
            await page.waitForTimeout(2000)
        }

        // 15. Wait 2 seconds (already waited above)
        // 16. Click on a node
        const node = page.locator('.preview-container .node').first()
        await node.click()

        // 17. Wait 1 second
        await page.waitForTimeout(1000)

        // 18. Snapshot
        await page.screenshot({
            path: 'test-results/t3-01-classic-dialog.png',
            fullPage: true,
        })

        // Confirm dialog appears with both sections
        const editPanel = page.locator('.node-edit-panel')
        await expect(editPanel).toBeVisible()

        const fillSection = editPanel.getByText('Fill Color')
        const borderSection = editPanel.getByText('Border Color')
        await expect(fillSection).toBeVisible()
        await expect(borderSection).toBeVisible()
    })
})
