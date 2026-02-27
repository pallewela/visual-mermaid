import { useCallback } from 'react'
import { ArrowDownUp, ArrowLeftRight, Pencil } from 'lucide-react'
import { CHART_TEMPLATES } from '../templates'
import { CLASSIC_FONTS, SKETCH_FONTS } from '../stylePresets'

interface QuickActionsProps {
    code: string
    onCodeChange: (code: string) => void
    handDrawn: boolean
    onHandDrawnChange: (value: boolean) => void
    fontName: string
    onFontChange: (name: string) => void
}

export default function QuickActions({
    code,
    onCodeChange,
    handDrawn,
    onHandDrawnChange,
    fontName,
    onFontChange,
}: QuickActionsProps) {
    const toggleDirection = useCallback(() => {
        const lines = code.split('\n')
        const firstLine = lines[0]

        if (/\bTD\b/.test(firstLine)) {
            lines[0] = firstLine.replace(/\bTD\b/, 'LR')
        } else if (/\bLR\b/.test(firstLine)) {
            lines[0] = firstLine.replace(/\bLR\b/, 'TD')
        } else if (/\bTB\b/.test(firstLine)) {
            lines[0] = firstLine.replace(/\bTB\b/, 'LR')
        } else if (/\bRL\b/.test(firstLine)) {
            lines[0] = firstLine.replace(/\bRL\b/, 'TD')
        } else if (/\bBT\b/.test(firstLine)) {
            lines[0] = firstLine.replace(/\bBT\b/, 'LR')
        }

        onCodeChange(lines.join('\n'))
    }, [code, onCodeChange])

    const isVertical = /\b(TD|TB)\b/.test(code.split('\n')[0])

    const handleTemplateChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const template = CHART_TEMPLATES[e.target.value]
            if (template) onCodeChange(template)
        },
        [onCodeChange]
    )

    const detectCurrentType = (): string => {
        const first = code.trim().split('\n')[0].toLowerCase()
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

    const fontList = handDrawn ? SKETCH_FONTS : CLASSIC_FONTS
    const currentFontOption = fontList.find((f) => f.name === fontName)

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Direction toggle */}
            <button
                onClick={toggleDirection}
                className="glass-button"
                title={`Switch to ${isVertical ? 'Left-Right' : 'Top-Down'}`}
            >
                {isVertical ? (
                    <ArrowLeftRight size={14} />
                ) : (
                    <ArrowDownUp size={14} />
                )}
                {isVertical ? 'LR' : 'TD'}
            </button>

            {/* Chart type selector */}
            <select
                value={detectCurrentType()}
                onChange={handleTemplateChange}
                className="glass-select"
            >
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence</option>
                <option value="gantt">Gantt</option>
                <option value="classDiagram">Class</option>
                <option value="erDiagram">ER Diagram</option>
                <option value="stateDiagram">State</option>
                <option value="pie">Pie Chart</option>
                <option value="mindmap">Mind Map</option>
            </select>

            {/* Hand-drawn toggle */}
            <button
                onClick={() => onHandDrawnChange(!handDrawn)}
                className={`glass-button ${handDrawn ? 'toggle-active' : ''}`}
                title="Toggle hand-drawn style"
            >
                <Pencil size={14} />
                Sketch
            </button>

            <div
                className="w-px h-5 hidden sm:block"
                style={{ background: 'oklch(0.5 0.02 260 / 0.2)' }}
            />

            {/* Font selector */}
            <select
                value={fontName}
                onChange={(e) => onFontChange(e.target.value)}
                className="glass-select"
                style={{
                    fontFamily: currentFontOption?.value,
                    minWidth: 100,
                }}
                title="Diagram font"
            >
                {fontList.map((font) => (
                    <option key={font.name} value={font.name}>
                        {font.name}
                    </option>
                ))}
            </select>

        </div>
    )
}
