import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Link, Type, Palette, PenLine, Ban } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import {
    findNodeDefinition,
    updateNodeShape,
    deleteNode,
    getNodeFillColor,
    setNodeFillColor,
    getNodeStrokeColor,
    setNodeStrokeColor,
    SHAPE_WRAPPERS,
    SHAPE_LABELS,
    type NodeShape,
} from '../utils/flowchartParser'
import {
    type ElementInfo,
    getCapabilities,
    updateElementLabel,
} from '../utils/diagramEditor'

interface NodeEditPanelProps {
    elementInfo: ElementInfo
    code: string
    onCodeChange: (code: string) => void
    onClose: () => void
    onStartConnect: () => void
    position: { x: number; y: number }
}

const SHAPE_ICONS: Record<NodeShape, string> = {
    rect: '▭',
    round: '▢',
    stadium: '⬭',
    subroutine: '⊞',
    cylinder: '⌸',
    circle: '●',
    diamond: '◇',
    hexagon: '⬡',
}

const FILL_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#64748b', '#1e293b',
]

const BORDER_COLORS = [
    '#991b1b', '#9a3412', '#92400e', '#854d0e',
    '#3f6212', '#166534', '#065f46', '#155e75',
    '#1e40af', '#3730a3', '#5b21b6', '#6b21a8',
    '#9d174d', '#9f1239', '#334155', '#0f172a',
]

export default function NodeEditPanel({
    elementInfo,
    code,
    onCodeChange,
    onClose,
    onStartConnect,
    position,
}: NodeEditPanelProps) {
    const { isDark } = useTheme()
    const { id: elementId, chartType } = elementInfo
    const caps = getCapabilities(chartType)

    const nodeDef =
        chartType === 'flowchart'
            ? findNodeDefinition(code, elementId)
            : null

    const [label, setLabel] = useState(elementInfo.label)
    const currentFill =
        chartType === 'flowchart'
            ? getNodeFillColor(code, elementId)
            : null
    const currentStroke =
        chartType === 'flowchart'
            ? getNodeStrokeColor(code, elementId)
            : null

    useEffect(() => {
        setLabel(elementInfo.label)
    }, [elementInfo.id]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newLabel = e.target.value
            const oldLabel = label
            setLabel(newLabel)
            const updated = updateElementLabel(
                code,
                chartType,
                elementId,
                oldLabel,
                newLabel
            )
            onCodeChange(updated)
        },
        [code, chartType, elementId, label, onCodeChange]
    )

    const handleShapeChange = useCallback(
        (shape: NodeShape) => {
            const updated = updateNodeShape(code, elementId, shape)
            onCodeChange(updated)
        },
        [code, elementId, onCodeChange]
    )

    const handleFillChange = useCallback(
        (color: string | null) => {
            const updated = setNodeFillColor(code, elementId, color)
            onCodeChange(updated)
        },
        [code, elementId, onCodeChange]
    )

    const handleStrokeChange = useCallback(
        (color: string | null) => {
            const updated = setNodeStrokeColor(code, elementId, color)
            onCodeChange(updated)
        },
        [code, elementId, onCodeChange]
    )

    const handleDelete = useCallback(() => {
        const updated = deleteNode(code, elementId)
        onCodeChange(updated)
        onClose()
    }, [code, elementId, onCodeChange, onClose])

    // Estimate panel height for boundary positioning
    let panelHeight = 100 // header + label
    if (caps.canEditShape) panelHeight += 90
    if (caps.canEditFill) panelHeight += 170 // fill + border
    if (caps.canConnect || caps.canDelete) panelHeight += 50

    const panelWidth = 264
    let left = position.x + 20
    let top = position.y - panelHeight / 3

    if (left + panelWidth > window.innerWidth - 16) {
        left = position.x - panelWidth - 20
    }
    if (top < 16) top = 16
    if (top + panelHeight > window.innerHeight - 16) {
        top = window.innerHeight - panelHeight - 16
    }

    const borderColor = isDark
        ? 'oklch(0.5 0.02 260 / 0.15)'
        : 'oklch(0.5 0.02 260 / 0.08)'
    const labelColor = isDark
        ? 'oklch(0.6 0.02 260)'
        : 'oklch(0.5 0.02 260)'

    const shapes = Object.keys(SHAPE_WRAPPERS) as NodeShape[]

    return (
        <div
            className="node-edit-panel"
            style={{
                position: 'fixed',
                left: `${left}px`,
                top: `${top}px`,
                zIndex: 1000,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="w-[264px] rounded-xl border overflow-hidden shadow-2xl"
                style={{
                    background: isDark
                        ? 'oklch(0.15 0.02 260 / 0.95)'
                        : 'oklch(0.98 0.01 260 / 0.95)',
                    borderColor: isDark
                        ? 'oklch(0.5 0.02 260 / 0.3)'
                        : 'oklch(0.5 0.02 260 / 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: isDark
                        ? '0 20px 60px oklch(0 0 0 / 0.5)'
                        : '0 20px 60px oklch(0 0 0 / 0.15)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-3 py-2 border-b"
                    style={{ borderColor }}
                >
                    <span
                        className="text-xs font-semibold uppercase tracking-wider truncate mr-2"
                        style={{
                            color: isDark
                                ? 'oklch(0.7 0.02 260)'
                                : 'oklch(0.45 0.02 260)',
                        }}
                    >
                        {chartType === 'flowchart'
                            ? `Node: ${elementId}`
                            : elementId}
                    </span>
                    <button
                        onClick={onClose}
                        className="transition-colors p-0.5 rounded hover:bg-[oklch(0.5_0.02_260/0.15)] flex-shrink-0"
                        style={{
                            color: isDark
                                ? 'oklch(0.6 0.02 260)'
                                : 'oklch(0.5 0.02 260)',
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Label */}
                <div className="px-3 py-2.5">
                    <label
                        className="text-[11px] font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                        style={{ color: labelColor }}
                    >
                        <Type size={11} />
                        Label
                    </label>
                    <input
                        type="text"
                        value={label}
                        onChange={handleLabelChange}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none focus:ring-1"
                        style={{
                            background: isDark
                                ? 'oklch(0.2 0.02 260 / 0.6)'
                                : 'oklch(0.92 0.01 260)',
                            border: isDark
                                ? '1px solid oklch(0.5 0.02 260 / 0.2)'
                                : '1px solid oklch(0.5 0.02 260 / 0.15)',
                            color: isDark
                                ? 'oklch(0.9 0.02 260)'
                                : 'oklch(0.2 0.02 260)',
                            '--tw-ring-color':
                                'oklch(0.65 0.25 270 / 0.5)',
                        } as React.CSSProperties}
                        autoFocus
                    />
                </div>

                {/* Shape (flowchart only) */}
                {caps.canEditShape && nodeDef && (
                    <div
                        className="px-3 py-2.5 border-t"
                        style={{ borderColor }}
                    >
                        <label
                            className="text-[11px] font-medium uppercase tracking-wider mb-2 block"
                            style={{ color: labelColor }}
                        >
                            Shape
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                            {shapes.map((shape) => (
                                <button
                                    key={shape}
                                    onClick={() => handleShapeChange(shape)}
                                    className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                                    style={
                                        nodeDef.shape === shape
                                            ? {
                                                  background:
                                                      'oklch(0.65 0.25 270 / 0.2)',
                                                  color: 'oklch(0.65 0.25 270)',
                                                  border: '1px solid oklch(0.65 0.25 270 / 0.4)',
                                              }
                                            : {
                                                  color: isDark
                                                      ? 'oklch(0.6 0.02 260)'
                                                      : 'oklch(0.45 0.02 260)',
                                                  border: '1px solid transparent',
                                                  background: 'transparent',
                                              }
                                    }
                                    title={SHAPE_LABELS[shape]}
                                >
                                    <span className="text-sm leading-none">
                                        {SHAPE_ICONS[shape]}
                                    </span>
                                    <span className="leading-none">
                                        {SHAPE_LABELS[shape].slice(0, 4)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fill Color (flowchart only) */}
                {caps.canEditFill && (
                    <div
                        className="px-3 py-2.5 border-t"
                        style={{ borderColor }}
                    >
                        <label
                            className="text-[11px] font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: labelColor }}
                        >
                            <Palette size={11} />
                            Fill Color
                        </label>
                        <div className="flex items-center gap-1 flex-wrap">
                            {FILL_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleFillChange(color)}
                                    className="fill-swatch"
                                    style={{
                                        backgroundColor: color,
                                        boxShadow:
                                            currentFill === color
                                                ? `0 0 0 2px ${isDark ? '#0f1219' : '#f8fafc'}, 0 0 0 4px ${color}`
                                                : 'none',
                                        transform:
                                            currentFill === color
                                                ? 'scale(1.3)'
                                                : 'scale(1)',
                                    }}
                                    title={color}
                                />
                            ))}
                            <button
                                onClick={() => handleFillChange(null)}
                                className="fill-swatch flex items-center justify-center"
                                style={{
                                    background: isDark
                                        ? 'oklch(0.25 0.02 260)'
                                        : 'oklch(0.9 0.01 260)',
                                    border: isDark
                                        ? '1px solid oklch(0.4 0.02 260)'
                                        : '1px solid oklch(0.7 0.02 260)',
                                    boxShadow:
                                        currentFill === null
                                            ? `0 0 0 2px ${isDark ? '#0f1219' : '#f8fafc'}, 0 0 0 3px oklch(0.65 0.25 270)`
                                            : 'none',
                                }}
                                title="Remove fill color"
                            >
                                <Ban
                                    size={10}
                                    style={{
                                        color: isDark
                                            ? 'oklch(0.5 0.02 260)'
                                            : 'oklch(0.6 0.02 260)',
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Border Color (flowchart only) */}
                {caps.canEditFill && (
                    <div
                        className="px-3 py-2.5 border-t"
                        style={{ borderColor }}
                    >
                        <label
                            className="text-[11px] font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: labelColor }}
                        >
                            <PenLine size={11} />
                            Border Color
                        </label>
                        <div className="flex items-center gap-1 flex-wrap">
                            {BORDER_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() =>
                                        handleStrokeChange(color)
                                    }
                                    className="fill-swatch"
                                    style={{
                                        backgroundColor: color,
                                        boxShadow:
                                            currentStroke === color
                                                ? `0 0 0 2px ${isDark ? '#0f1219' : '#f8fafc'}, 0 0 0 4px ${color}`
                                                : 'none',
                                        transform:
                                            currentStroke === color
                                                ? 'scale(1.3)'
                                                : 'scale(1)',
                                    }}
                                    title={color}
                                />
                            ))}
                            <button
                                onClick={() =>
                                    handleStrokeChange(null)
                                }
                                className="fill-swatch flex items-center justify-center"
                                style={{
                                    background: isDark
                                        ? 'oklch(0.25 0.02 260)'
                                        : 'oklch(0.9 0.01 260)',
                                    border: isDark
                                        ? '1px solid oklch(0.4 0.02 260)'
                                        : '1px solid oklch(0.7 0.02 260)',
                                    boxShadow:
                                        currentStroke === null
                                            ? `0 0 0 2px ${isDark ? '#0f1219' : '#f8fafc'}, 0 0 0 3px oklch(0.65 0.25 270)`
                                            : 'none',
                                }}
                                title="Remove border color"
                            >
                                <Ban
                                    size={10}
                                    style={{
                                        color: isDark
                                            ? 'oklch(0.5 0.02 260)'
                                            : 'oklch(0.6 0.02 260)',
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions (flowchart only) */}
                {(caps.canConnect || caps.canDelete) && (
                    <div
                        className="px-3 py-2.5 border-t flex gap-2"
                        style={{ borderColor }}
                    >
                        {caps.canConnect && (
                            <button
                                onClick={onStartConnect}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                                style={{
                                    background: isDark
                                        ? 'oklch(0.3 0.02 260 / 0.4)'
                                        : 'oklch(0.92 0.01 260)',
                                    border: isDark
                                        ? '1px solid oklch(0.5 0.02 260 / 0.2)'
                                        : '1px solid oklch(0.5 0.02 260 / 0.15)',
                                    color: isDark
                                        ? 'oklch(0.8 0.02 260)'
                                        : 'oklch(0.3 0.02 260)',
                                }}
                            >
                                <Link size={12} />
                                Connect
                            </button>
                        )}
                        {caps.canDelete && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                                style={{
                                    background: isDark
                                        ? 'oklch(0.3 0.05 25 / 0.4)'
                                        : 'oklch(0.95 0.02 25)',
                                    border: isDark
                                        ? '1px solid oklch(0.5 0.15 25 / 0.3)'
                                        : '1px solid oklch(0.7 0.1 25 / 0.3)',
                                    color: 'oklch(0.65 0.2 25)',
                                }}
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
