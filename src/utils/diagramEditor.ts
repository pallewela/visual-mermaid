import {
    extractNodeIdFromElement,
    findNodeDefinition,
    updateNodeLabel,
} from './flowchartParser'

export type ChartType =
    | 'flowchart'
    | 'sequence'
    | 'classDiagram'
    | 'stateDiagram'
    | 'erDiagram'
    | 'mindmap'
    | 'pie'
    | 'gantt'

export interface ChartCapabilities {
    canEditLabel: boolean
    canEditShape: boolean
    canEditFill: boolean
    canConnect: boolean
    canDelete: boolean
    canAdd: boolean
}

export interface ElementInfo {
    id: string
    label: string
    chartType: ChartType
}

const INTERACTIVE_TYPES = new Set<ChartType>([
    'flowchart',
    'sequence',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'mindmap',
])

export function detectChartType(code: string): ChartType {
    const first = code.trim().split('\n')[0].toLowerCase().trim()
    if (first.startsWith('flowchart') || first.startsWith('graph'))
        return 'flowchart'
    if (first.startsWith('sequencediagram')) return 'sequence'
    if (first.startsWith('gantt')) return 'gantt'
    if (first.startsWith('classdiagram')) return 'classDiagram'
    if (first.startsWith('erdiagram')) return 'erDiagram'
    if (first.startsWith('statediagram')) return 'stateDiagram'
    if (first.startsWith('pie')) return 'pie'
    if (first.startsWith('mindmap')) return 'mindmap'
    return 'flowchart'
}

export function isInteractiveType(chartType: ChartType): boolean {
    return INTERACTIVE_TYPES.has(chartType)
}

export function getCapabilities(chartType: ChartType): ChartCapabilities {
    if (chartType === 'flowchart') {
        return {
            canEditLabel: true,
            canEditShape: true,
            canEditFill: true,
            canConnect: true,
            canDelete: true,
            canAdd: true,
        }
    }
    return {
        canEditLabel: true,
        canEditShape: false,
        canEditFill: false,
        canConnect: false,
        canDelete: false,
        canAdd: false,
    }
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const CLICKABLE_SELECTORS: Record<ChartType, string[]> = {
    flowchart: ['.node', '.rough-node'],
    sequence: ['.actor'],
    classDiagram: ['.classGroup'],
    stateDiagram: ['.statediagram-state', '.stateGroup'],
    erDiagram: ['[id^="entity-"]'],
    mindmap: ['.mindmap-node'],
    pie: [],
    gantt: [],
}

export function findClickedElement(
    target: Element,
    chartType: ChartType
): Element | null {
    const selectors = CLICKABLE_SELECTORS[chartType] || []
    for (const selector of selectors) {
        const match = target.closest(selector)
        if (match) return match
    }

    // Fallback: nearest <g> containing both a shape and text
    let current: Element | null = target
    while (current && current.tagName !== 'svg') {
        if (
            current.tagName === 'g' &&
            current.querySelector('text') &&
            current.querySelector('rect, polygon, circle, path, ellipse')
        ) {
            return current
        }
        current = current.parentElement
    }

    return null
}

export function extractElementInfo(
    element: Element,
    chartType: ChartType,
    code: string
): ElementInfo | null {
    switch (chartType) {
        case 'flowchart': {
            const nodeId = extractNodeIdFromElement(element)
            if (!nodeId) return null
            const def = findNodeDefinition(code, nodeId)
            return {
                id: nodeId,
                label: def?.label ?? nodeId,
                chartType,
            }
        }

        case 'classDiagram': {
            const idMatch = element.id?.match(/^classId-(.+?)-\d+$/)
            if (idMatch) {
                return {
                    id: idMatch[1],
                    label: idMatch[1],
                    chartType,
                }
            }
            return extractFromText(element, chartType)
        }

        case 'stateDiagram': {
            const stateMatch = element.id?.match(/^state-(.+?)[-_]/)
            if (stateMatch) {
                return {
                    id: stateMatch[1],
                    label: stateMatch[1],
                    chartType,
                }
            }
            return extractFromText(element, chartType)
        }

        default:
            return extractFromText(element, chartType)
    }
}

function extractFromText(
    element: Element,
    chartType: ChartType
): ElementInfo | null {
    const textEl = element.querySelector('text')
    const label = textEl?.textContent?.trim()
    if (!label) return null
    return { id: label, label, chartType }
}

export function getSelectableSelector(chartType: ChartType): string {
    return (CLICKABLE_SELECTORS[chartType] || []).join(', ')
}

export function updateElementLabel(
    code: string,
    chartType: ChartType,
    elementId: string,
    oldLabel: string,
    newLabel: string
): string {
    if (oldLabel === newLabel) return code

    switch (chartType) {
        case 'flowchart':
            return updateNodeLabel(code, elementId, newLabel)

        case 'sequence': {
            const escaped = escapeRegex(oldLabel)
            const aliasRegex = new RegExp(
                `(participant\\s+\\S+\\s+as\\s+)${escaped}`
            )
            if (aliasRegex.test(code)) {
                return code.replace(aliasRegex, `$1${newLabel}`)
            }
            return code.replaceAll(oldLabel, newLabel)
        }

        default:
            return code.replaceAll(oldLabel, newLabel)
    }
}
