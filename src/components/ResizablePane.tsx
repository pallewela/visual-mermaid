import { useCallback, useState, useRef, useEffect } from 'react'

interface ResizablePaneProps {
    left: React.ReactNode
    right: React.ReactNode
}

export default function ResizablePane({ left, right }: ResizablePaneProps) {
    const [splitPercent, setSplitPercent] = useState(45)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const [dragging, setDragging] = useState(false)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        isDragging.current = true
        setDragging(true)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const percent = ((e.clientX - rect.left) / rect.width) * 100
            setSplitPercent(Math.min(Math.max(percent, 20), 80))
        }

        const handleMouseUp = () => {
            isDragging.current = false
            setDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full"
            style={{ userSelect: dragging ? 'none' : 'auto' }}
        >
            <div
                className="h-full overflow-hidden"
                style={{ width: `${splitPercent}%` }}
            >
                {left}
            </div>
            <div
                className={`resize-handle ${dragging ? 'active' : ''}`}
                onMouseDown={handleMouseDown}
            />
            <div
                className="h-full overflow-hidden flex-1"
                style={{ width: `${100 - splitPercent}%` }}
            >
                {right}
            </div>
        </div>
    )
}
