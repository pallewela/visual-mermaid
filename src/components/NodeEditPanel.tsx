import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Link, Type } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import {
    findNodeDefinition,
    updateNodeLabel,
    updateNodeShape,
    deleteNode,
    SHAPE_WRAPPERS,
    SHAPE_LABELS,
    type NodeShape,
} from '../utils/flowchartParser'

interface NodeEditPanelProps {
    nodeId: string
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

export default function NodeEditPanel({
    nodeId,
    code,
    onCodeChange,
    onClose,
    onStartConnect,
    position,
}: NodeEditPanelProps) {
    const { isDark } = useTheme()
    const nodeDef = findNodeDefinition(code, nodeId)
    const [label, setLabel] = useState(nodeDef?.label ?? nodeId)

    useEffect(() => {
        const def = findNodeDefinition(code, nodeId)
        if (def) setLabel(def.label)
    }, [nodeId]) // Only sync when switching nodes, not on every code change

    const handleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newLabel = e.target.value
            setLabel(newLabel)
            const updated = updateNodeLabel(code, nodeId, newLabel)
            onCodeChange(updated)
        },
        [code, nodeId, onCodeChange]
    )

    const handleShapeChange = useCallback(
        (shape: NodeShape) => {
            const updated = updateNodeShape(code, nodeId, shape)
            onCodeChange(updated)
        },
        [code, nodeId, onCodeChange]
    )

    const handleDelete = useCallback(() => {
        const updated = deleteNode(code, nodeId)
        onCodeChange(updated)
        onClose()
    }, [code, nodeId, onCodeChange, onClose])

    // Viewport-based positioning with boundary checks
    const panelWidth = 264
    const panelHeight = 290
    let left = position.x + 20
    let top = position.y - panelHeight / 3

    if (left + panelWidth > window.innerWidth - 16) {
        left = position.x - panelWidth - 20
    }
    if (top < 16) top = 16
    if (top + panelHeight > window.innerHeight - 16) {
        top = window.innerHeight - panelHeight - 16
    }

    if (!nodeDef) return null

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
                    style={{
                        borderColor: isDark
                            ? 'oklch(0.5 0.02 260 / 0.2)'
                            : 'oklch(0.5 0.02 260 / 0.1)',
                    }}
                >
                    <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{
                            color: isDark
                                ? 'oklch(0.7 0.02 260)'
                                : 'oklch(0.45 0.02 260)',
                        }}
                    >
                        Node: {nodeId}
                    </span>
                    <button
                        onClick={onClose}
                        className="transition-colors p-0.5 rounded hover:bg-[oklch(0.5_0.02_260/0.15)]"
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
                        style={{
                            color: isDark
                                ? 'oklch(0.6 0.02 260)'
                                : 'oklch(0.5 0.02 260)',
                        }}
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

                {/* Shape */}
                <div
                    className="px-3 py-2.5 border-t"
                    style={{
                        borderColor: isDark
                            ? 'oklch(0.5 0.02 260 / 0.1)'
                            : 'oklch(0.5 0.02 260 / 0.08)',
                    }}
                >
                    <label
                        className="text-[11px] font-medium uppercase tracking-wider mb-2 block"
                        style={{
                            color: isDark
                                ? 'oklch(0.6 0.02 260)'
                                : 'oklch(0.5 0.02 260)',
                        }}
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

                {/* Actions */}
                <div
                    className="px-3 py-2.5 border-t flex gap-2"
                    style={{
                        borderColor: isDark
                            ? 'oklch(0.5 0.02 260 / 0.1)'
                            : 'oklch(0.5 0.02 260 / 0.08)',
                    }}
                >
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
                </div>
            </div>
        </div>
    )
}
