import { useState, useCallback, useMemo } from 'react'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { useTheme } from './context/ThemeContext'
import { useMermaid } from './hooks/useMermaid'
import Editor from './components/Editor'
import Preview from './components/Preview'
import ResizablePane from './components/ResizablePane'
import QuickActions from './components/QuickActions'
import ExportBar from './components/ExportBar'
import ErrorToast from './components/ErrorToast'
import { DEFAULT_CODE } from './templates'
import {
    CLASSIC_FONTS,
    SKETCH_FONTS,
    COLOR_PRESETS,
} from './stylePresets'

export default function App() {
    const { isDark, toggleTheme } = useTheme()
    const [code, setCode] = useState(DEFAULT_CODE)
    const [handDrawn, setHandDrawn] = useState(false)
    const [classicFont, setClassicFont] = useState(CLASSIC_FONTS[0].name)
    const [sketchFont, setSketchFont] = useState(SKETCH_FONTS[0].name)
    const colorPresetIdx = 0

    const currentFontList = handDrawn ? SKETCH_FONTS : CLASSIC_FONTS
    const currentFontName = handDrawn ? sketchFont : classicFont
    const currentFontOption =
        currentFontList.find((f) => f.name === currentFontName) ??
        currentFontList[0]

    const accentColor = useMemo(() => {
        const preset = COLOR_PRESETS[colorPresetIdx]
        return isDark ? preset.dark : preset.light
    }, [colorPresetIdx, isDark])

    const { svgOutput, error, isRendering } = useMermaid({
        code,
        isDark,
        handDrawn,
        fontFamily: currentFontOption.value,
        accentColor,
    })

    const handleCodeChange = useCallback((value: string) => {
        setCode(value)
    }, [])

    const handleFontChange = useCallback(
        (name: string) => {
            if (handDrawn) {
                setSketchFont(name)
            } else {
                setClassicFont(name)
            }
        },
        [handDrawn]
    )

    return (
        <div
            className={`h-screen w-screen flex flex-col overflow-hidden ${
                isDark
                    ? 'bg-surface-dark text-white'
                    : 'bg-surface-light text-gray-900'
            }`}
        >
            {/* Header */}
            <header className="glass-panel flex items-center justify-between px-4 py-2.5 border-b border-glass-border z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Sparkles
                            size={20}
                            className="text-accent"
                            style={{
                                filter: 'drop-shadow(0 0 8px oklch(0.65 0.25 270 / 0.4))',
                            }}
                        />
                        <h1 className="text-sm font-bold tracking-tight">
                            Mermaid Editor
                        </h1>
                    </div>
                    <div
                        className="w-px h-5"
                        style={{ background: 'oklch(0.5 0.02 260 / 0.2)' }}
                    />
                    <QuickActions
                        code={code}
                        onCodeChange={handleCodeChange}
                        handDrawn={handDrawn}
                        onHandDrawnChange={setHandDrawn}
                        fontName={currentFontName}
                        onFontChange={handleFontChange}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <ExportBar svgOutput={svgOutput} code={code} />
                    <div
                        className="w-px h-5"
                        style={{ background: 'oklch(0.5 0.02 260 / 0.2)' }}
                    />
                    <button
                        onClick={toggleTheme}
                        className="glass-button !p-2"
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 min-h-0">
                <ResizablePane
                    left={
                        <div
                            className={`h-full ${
                                isDark ? 'bg-[#1e1e1e]' : 'bg-white'
                            }`}
                        >
                            <Editor code={code} onChange={handleCodeChange} />
                        </div>
                    }
                    right={
                        <div className="h-full relative">
                            <Preview
                                svgOutput={svgOutput}
                                isRendering={isRendering}
                                code={code}
                                onCodeChange={handleCodeChange}
                            />
                            {error && <ErrorToast message={error} />}
                        </div>
                    }
                />
            </main>
        </div>
    )
}
