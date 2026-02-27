import { useRef, useCallback } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { useTheme } from '../context/ThemeContext'

interface EditorProps {
    code: string
    onChange: (value: string) => void
}

export default function Editor({ code, onChange }: EditorProps) {
    const { isDark } = useTheme()
    const editorRef = useRef<unknown>(null)

    const handleMount = useCallback((editor: unknown) => {
        editorRef.current = editor
    }, [])

    const handleChange = useCallback(
        (value: string | undefined) => {
            if (value !== undefined) onChange(value)
        },
        [onChange]
    )

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center px-4 py-2 border-b border-[oklch(0.5_0.02_260/0.15)]">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28ca42]" />
                </div>
                <span className="ml-3 text-xs font-medium opacity-50 tracking-wide uppercase">
                    Mermaid Editor
                </span>
            </div>
            <div className="flex-1 min-h-0">
                <MonacoEditor
                    height="100%"
                    language="markdown"
                    theme={isDark ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={handleChange}
                    onMount={handleMount}
                    options={{
                        fontSize: 14,
                        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                        fontLigatures: true,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        renderLineHighlight: 'line',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        tabSize: 4,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        bracketPairColorization: { enabled: true },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                    }}
                />
            </div>
        </div>
    )
}
