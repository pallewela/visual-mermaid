import { useRef, useState, useCallback, useEffect } from 'react'
import { Maximize2, Plus, Link } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import NodeEditPanel from './NodeEditPanel'
import {
    isFlowchart,
    extractNodeIdFromElement,
    addNode as addNodeToCode,
    addEdge as addEdgeToCode,
} from '../utils/flowchartParser'

interface PreviewProps {
    svgOutput: string
    isRendering: boolean
    code: string
    onCodeChange: (code: string) => void
}

export default function Preview({
    svgOutput,
    isRendering,
    code,
    onCodeChange,
}: PreviewProps) {
    const { isDark } = useTheme()
    const interactionRef = useRef<HTMLDivElement>(null)
    const svgContainerRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const isPanning = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })
    const dragStartPos = useRef({ x: 0, y: 0 })
    const didDrag = useRef(false)
    const clickedNodeRef = useRef<string | null>(null)

    // Visual editing state
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 })
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null)

    const visualEditing = isFlowchart(code)

    // Prevent view reset during visual edits
    const skipResetRef = useRef(false)

    const onVisualCodeChange = useCallback(
        (newCode: string) => {
            skipResetRef.current = true
            onCodeChange(newCode)
        },
        [onCodeChange]
    )

    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 })
    }, [])

    useEffect(() => {
        if (skipResetRef.current) {
            skipResetRef.current = false
        } else {
            resetView()
        }
    }, [svgOutput, resetView])

    // Apply selection highlight to SVG nodes after each render
    useEffect(() => {
        const container = svgContainerRef.current
        if (!container || !visualEditing) return

        container
            .querySelectorAll('.node.node-selected')
            .forEach((el) => el.classList.remove('node-selected'))

        if (selectedNodeId) {
            container.querySelectorAll('.node').forEach((node) => {
                const id = extractNodeIdFromElement(node)
                if (id === selectedNodeId) {
                    node.classList.add('node-selected')
                }
            })
        }
    }, [svgOutput, selectedNodeId, visualEditing])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedNodeId(null)
                setConnectingFrom(null)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Deselect when diagram type changes to non-flowchart
    useEffect(() => {
        if (!visualEditing) {
            setSelectedNodeId(null)
            setConnectingFrom(null)
        }
    }, [visualEditing])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setTransform((prev) => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale * delta, 0.1), 5),
        }))
    }, [])

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0) return

            dragStartPos.current = { x: e.clientX, y: e.clientY }
            didDrag.current = false
            clickedNodeRef.current = null

            if (visualEditing) {
                const target = e.target as Element
                const nodeElement = target.closest('.node')
                if (nodeElement) {
                    const nodeId = extractNodeIdFromElement(nodeElement)
                    if (nodeId) {
                        clickedNodeRef.current = nodeId
                    }
                }
            }

            isPanning.current = true
            lastPos.current = { x: e.clientX, y: e.clientY }
        },
        [visualEditing]
    )

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isPanning.current) return

            if (
                Math.abs(e.clientX - dragStartPos.current.x) > 3 ||
                Math.abs(e.clientY - dragStartPos.current.y) > 3
            ) {
                didDrag.current = true
            }

            const dx = e.clientX - lastPos.current.x
            const dy = e.clientY - lastPos.current.y
            lastPos.current = { x: e.clientX, y: e.clientY }
            setTransform((prev) => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy,
            }))
        },
        []
    )

    const handleMouseUp = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            isPanning.current = false

            if (!didDrag.current && visualEditing) {
                if (clickedNodeRef.current) {
                    if (connectingFrom) {
                        if (connectingFrom !== clickedNodeRef.current) {
                            const updated = addEdgeToCode(
                                code,
                                connectingFrom,
                                clickedNodeRef.current
                            )
                            onVisualCodeChange(updated)
                        }
                        setConnectingFrom(null)
                    } else {
                        setSelectedNodeId(clickedNodeRef.current)
                        setPopoverPos({ x: e.clientX, y: e.clientY })
                    }
                } else {
                    setSelectedNodeId(null)
                    setConnectingFrom(null)
                }
            }
        },
        [visualEditing, connectingFrom, code, onVisualCodeChange]
    )

    const handleMouseLeave = useCallback(() => {
        isPanning.current = false
    }, [])

    const handleAddNode = useCallback(() => {
        const result = addNodeToCode(code)
        onVisualCodeChange(result.code)
    }, [code, onVisualCodeChange])

    const handleStartConnect = useCallback(() => {
        if (selectedNodeId) {
            setConnectingFrom(selectedNodeId)
            setSelectedNodeId(null)
        }
    }, [selectedNodeId])

    const getCursor = () => {
        if (connectingFrom) return 'crosshair'
        if (!visualEditing) return 'grab'
        return 'default'
    }

    return (
        <div
            className={`preview-container h-full w-full flex flex-col ${
                visualEditing ? 'interactive-preview' : ''
            }`}
            style={{
                backgroundColor: isDark ? '#0f1219' : '#f8fafc',
            }}
        >
            {/* Preview header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(0.5_0.02_260/0.15)]">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium opacity-50 tracking-wide uppercase">
                        Preview
                    </span>
                    {visualEditing && (
                        <>
                            <div
                                className="w-px h-4"
                                style={{
                                    background: 'oklch(0.5 0.02 260 / 0.2)',
                                }}
                            />
                            <button
                                onClick={handleAddNode}
                                className="glass-button !px-2 !py-1 text-xs"
                                title="Add new node"
                            >
                                <Plus size={12} />
                                Node
                            </button>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {connectingFrom && (
                        <div
                            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md animate-pulse"
                            style={{
                                background: 'oklch(0.65 0.25 270 / 0.15)',
                                color: 'oklch(0.75 0.2 270)',
                                border: '1px solid oklch(0.65 0.25 270 / 0.3)',
                            }}
                        >
                            <Link size={12} />
                            Click a node to connect from{' '}
                            <strong>{connectingFrom}</strong>
                            <button
                                onClick={() => setConnectingFrom(null)}
                                className="ml-1 hover:opacity-70 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {isRendering && (
                        <div className="flex items-center gap-1.5 text-xs opacity-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            Rendering...
                        </div>
                    )}
                    <button
                        onClick={resetView}
                        className="glass-button !px-2 !py-1 text-xs"
                        title="Reset zoom"
                    >
                        <Maximize2 size={12} />
                        Fit
                    </button>
                </div>
            </div>

            {/* SVG container with pan/zoom */}
            <div
                ref={interactionRef}
                className="flex-1 min-h-0 overflow-hidden"
                style={{ cursor: getCursor() }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    ref={svgContainerRef}
                    className="w-full h-full flex items-center justify-center"
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: 'center center',
                        transition: isPanning.current
                            ? 'none'
                            : 'transform 0.1s ease-out',
                    }}
                >
                    {svgOutput ? (
                        <div
                            className="svg-fade-in [&_svg]:max-w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: svgOutput }}
                        />
                    ) : (
                        <div className="text-center opacity-30">
                            <p className="text-lg font-medium">
                                No diagram yet
                            </p>
                            <p className="text-sm mt-1">
                                Start typing Mermaid syntax in the editor
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Node edit panel (outside interaction area to avoid event conflicts) */}
            {selectedNodeId && visualEditing && (
                <NodeEditPanel
                    nodeId={selectedNodeId}
                    code={code}
                    onCodeChange={onVisualCodeChange}
                    onClose={() => setSelectedNodeId(null)}
                    onStartConnect={handleStartConnect}
                    position={popoverPos}
                />
            )}
        </div>
    )
}
