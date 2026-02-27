export type NodeShape =
    | 'rect'
    | 'round'
    | 'stadium'
    | 'subroutine'
    | 'cylinder'
    | 'circle'
    | 'diamond'
    | 'hexagon'

export interface NodeDefinition {
    id: string
    label: string
    shape: NodeShape
}

export const SHAPE_WRAPPERS: Record<NodeShape, [string, string]> = {
    rect: ['[', ']'],
    round: ['(', ')'],
    stadium: ['([', '])'],
    subroutine: ['[[', ']]'],
    cylinder: ['[(', ')]'],
    circle: ['((', '))'],
    diamond: ['{', '}'],
    hexagon: ['{{', '}}'],
}

export const SHAPE_LABELS: Record<NodeShape, string> = {
    rect: 'Rectangle',
    round: 'Rounded',
    stadium: 'Stadium',
    subroutine: 'Subroutine',
    cylinder: 'Cylinder',
    circle: 'Circle',
    diamond: 'Diamond',
    hexagon: 'Hexagon',
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function isFlowchart(code: string): boolean {
    const firstLine = code.trim().split('\n')[0].toLowerCase().trim()
    return firstLine.startsWith('flowchart') || firstLine.startsWith('graph')
}

export function extractNodeIdFromElement(element: Element): string | null {
    const id = element.id || ''

    const flowchartMatch = id.match(/^flowchart-(.+?)-\d+$/)
    if (flowchartMatch) return flowchartMatch[1]

    const dataId = element.getAttribute('data-id')
    if (dataId) return dataId

    return null
}

export function findNodeDefinition(
    code: string,
    nodeId: string
): NodeDefinition | null {
    const eid = escapeRegex(nodeId)

    // Most-specific (multi-char bracket) patterns first
    const patterns: { shape: NodeShape; regex: RegExp }[] = [
        {
            shape: 'circle',
            regex: new RegExp(`\\b${eid}\\s*\\(\\((.+?)\\)\\)`),
        },
        {
            shape: 'hexagon',
            regex: new RegExp(`\\b${eid}\\s*\\{\\{(.+?)\\}\\}`),
        },
        {
            shape: 'stadium',
            regex: new RegExp(`\\b${eid}\\s*\\(\\[(.+?)\\]\\)`),
        },
        {
            shape: 'subroutine',
            regex: new RegExp(`\\b${eid}\\s*\\[\\[(.+?)\\]\\]`),
        },
        {
            shape: 'cylinder',
            regex: new RegExp(`\\b${eid}\\s*\\[\\((.+?)\\)\\]`),
        },
        {
            shape: 'rect',
            regex: new RegExp(`\\b${eid}\\s*\\[([^\\[\\]]*?)\\]`),
        },
        {
            shape: 'round',
            regex: new RegExp(`\\b${eid}\\s*\\(([^()]*?)\\)`),
        },
        {
            shape: 'diamond',
            regex: new RegExp(`\\b${eid}\\s*\\{([^{}]*?)\\}`),
        },
    ]

    for (const { shape, regex } of patterns) {
        const match = code.match(regex)
        if (match) {
            return { id: nodeId, label: match[1], shape }
        }
    }

    return null
}

export function updateNodeLabel(
    code: string,
    nodeId: string,
    newLabel: string
): string {
    const node = findNodeDefinition(code, nodeId)
    if (!node) return code

    const [open, close] = SHAPE_WRAPPERS[node.shape]
    const oldStr = `${nodeId}${open}${node.label}${close}`
    const newStr = `${nodeId}${open}${newLabel}${close}`

    if (code.includes(oldStr)) {
        return code.replace(oldStr, newStr)
    }

    // Handle possible whitespace between ID and brackets
    const eid = escapeRegex(nodeId)
    const eOpen = escapeRegex(open)
    const eLabel = escapeRegex(node.label)
    const eClose = escapeRegex(close)
    const regex = new RegExp(
        `(\\b${eid})(\\s*)(${eOpen})(${eLabel})(${eClose})`
    )
    return code.replace(regex, `$1$2${open}${newLabel}${close}`)
}

export function updateNodeShape(
    code: string,
    nodeId: string,
    newShape: NodeShape
): string {
    const node = findNodeDefinition(code, nodeId)
    if (!node || node.shape === newShape) return code

    const [oldOpen, oldClose] = SHAPE_WRAPPERS[node.shape]
    const [newOpen, newClose] = SHAPE_WRAPPERS[newShape]

    const oldStr = `${nodeId}${oldOpen}${node.label}${oldClose}`
    const newStr = `${nodeId}${newOpen}${node.label}${newClose}`

    if (code.includes(oldStr)) {
        return code.replace(oldStr, newStr)
    }

    return code
}

export function addNode(code: string): { code: string; nodeId: string } {
    const existingIds = getAllNodeIds(code)
    let counter = 1
    let nodeId = `N${counter}`
    while (existingIds.includes(nodeId)) {
        counter++
        nodeId = `N${counter}`
    }

    const newLine = `    ${nodeId}[New Node]`
    return { code: code.trimEnd() + '\n' + newLine, nodeId }
}

export function deleteNode(code: string, nodeId: string): string {
    const eid = escapeRegex(nodeId)
    const nodeRegex = new RegExp(`\\b${eid}\\b`)

    const lines = code.split('\n')
    const filtered = lines.filter((line, index) => {
        if (index === 0) return true
        return !nodeRegex.test(line)
    })

    return filtered.join('\n')
}

export function addEdge(
    code: string,
    sourceId: string,
    targetId: string
): string {
    const newLine = `    ${sourceId} --> ${targetId}`
    return code.trimEnd() + '\n' + newLine
}

export function getAllNodeIds(code: string): string[] {
    const ids = new Set<string>()
    const keywords = new Set([
        'flowchart',
        'graph',
        'subgraph',
        'end',
        'style',
        'classdef',
        'click',
        'class',
        'direction',
        'linkstyle',
    ])

    const nodeRegex = /\b([A-Za-z_]\w*)\s*(?:\[|\(|\{|>)/g
    let match
    while ((match = nodeRegex.exec(code)) !== null) {
        const id = match[1]
        if (!keywords.has(id.toLowerCase())) {
            ids.add(id)
        }
    }

    return Array.from(ids)
}
