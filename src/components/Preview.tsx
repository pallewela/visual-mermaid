import { useRef, useState, useCallback, useEffect } from 'react'
import { Maximize2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface PreviewProps {
    svgOutput: string
    isRendering: boolean
}

export default function Preview({ svgOutput, isRendering }: PreviewProps) {
    const { isDark } = useTheme()
    const containerRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const isPanning = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })

    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 })
    }, [])

    // Reset view when SVG changes
    useEffect(() => {
        resetView()
    }, [svgOutput, resetView])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setTransform((prev) => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale * delta, 0.1), 5),
        }))
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        isPanning.current = true
        lastPos.current = { x: e.clientX, y: e.clientY }
        e.currentTarget.style.cursor = 'grabbing'
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }
        setTransform((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
        }))
    }, [])

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isPanning.current = false
        e.currentTarget.style.cursor = 'grab'
    }, [])

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isPanning.current = false
        e.currentTarget.style.cursor = 'grab'
    }, [])

    return (
        <div
            className="preview-container h-full w-full flex flex-col"
            style={{
                backgroundColor: isDark ? '#0f1219' : '#f8fafc',
            }}
        >
            {/* Preview header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(0.5_0.02_260/0.15)]">
                <span className="text-xs font-medium opacity-50 tracking-wide uppercase">
                    Preview
                </span>
                <div className="flex items-center gap-2">
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
                ref={containerRef}
                className="flex-1 min-h-0 overflow-hidden"
                style={{ cursor: 'grab' }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: 'center center',
                        transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
                    }}
                >
                    {svgOutput ? (
                        <div
                            className="svg-fade-in [&_svg]:max-w-full [&_svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: svgOutput }}
                        />
                    ) : (
                        <div className="text-center opacity-30">
                            <p className="text-lg font-medium">No diagram yet</p>
                            <p className="text-sm mt-1">Start typing Mermaid syntax in the editor</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
