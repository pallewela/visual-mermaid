import { useState, useEffect, useRef, useCallback } from 'react'
import mermaid from 'mermaid'
import { useDebounce } from './useDebounce'

interface UseMermaidOptions {
    code: string
    isDark: boolean
    handDrawn: boolean
}

interface UseMermaidReturn {
    svgOutput: string
    error: string | null
    isRendering: boolean
}

let renderCounter = 0

export function useMermaid({ code, isDark, handDrawn }: UseMermaidOptions): UseMermaidReturn {
    const [svgOutput, setSvgOutput] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [isRendering, setIsRendering] = useState(false)
    const debouncedCode = useDebounce(code, 300)
    const lastValidSvg = useRef<string>('')
    const renderIdRef = useRef(0)

    const initializeMermaid = useCallback(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            look: handDrawn ? 'handDrawn' : 'classic',
            themeVariables: isDark
                ? {
                    background: '#0f1219',
                    primaryColor: '#6366f1',
                    primaryTextColor: '#e2e8f0',
                    primaryBorderColor: '#4f46e5',
                    secondaryColor: '#1e293b',
                    secondaryTextColor: '#cbd5e1',
                    secondaryBorderColor: '#334155',
                    tertiaryColor: '#1e1b4b',
                    lineColor: '#64748b',
                    textColor: '#e2e8f0',
                    mainBkg: '#1e293b',
                    nodeBorder: '#4f46e5',
                    clusterBkg: '#1e293b',
                    clusterBorder: '#334155',
                    titleColor: '#e2e8f0',
                    edgeLabelBackground: '#1e293b',
                    nodeTextColor: '#e2e8f0',
                }
                : {
                    background: '#f8fafc',
                    primaryColor: '#818cf8',
                    primaryTextColor: '#1e293b',
                    primaryBorderColor: '#6366f1',
                    secondaryColor: '#f1f5f9',
                    secondaryTextColor: '#475569',
                    secondaryBorderColor: '#cbd5e1',
                    tertiaryColor: '#eef2ff',
                    lineColor: '#94a3b8',
                    textColor: '#1e293b',
                    mainBkg: '#f1f5f9',
                    nodeBorder: '#6366f1',
                    clusterBkg: '#f1f5f9',
                    clusterBorder: '#cbd5e1',
                    titleColor: '#1e293b',
                    edgeLabelBackground: '#f1f5f9',
                    nodeTextColor: '#1e293b',
                },
            fontFamily: handDrawn
                ? '"Patrick Hand", "Waiting for the Sunrise", "Caveat", "Segoe Print", "Comic Sans MS", cursive'
                : '"Inter", ui-sans-serif, system-ui, sans-serif',
            flowchart: { htmlLabels: true, curve: 'basis' },
            sequence: { mirrorActors: false },
        })
    }, [isDark, handDrawn])

    useEffect(() => {
        if (!debouncedCode.trim()) return

        const currentRender = ++renderCounter
        renderIdRef.current = currentRender
        setIsRendering(true)

        initializeMermaid()

        const renderDiagram = async () => {
            try {
                const id = `mermaid-render-${currentRender}`
                const { svg } = await mermaid.render(id, debouncedCode)
                if (renderIdRef.current === currentRender) {
                    setSvgOutput(svg)
                    lastValidSvg.current = svg
                    setError(null)
                }
            } catch (err) {
                if (renderIdRef.current === currentRender) {
                    setError(err instanceof Error ? err.message : 'Invalid syntax')
                    if (lastValidSvg.current) {
                        setSvgOutput(lastValidSvg.current)
                    }
                }
                // Cleanup any leftover error containers mermaid creates
                const errorContainer = document.getElementById(`dmermaid-render-${currentRender}`)
                if (errorContainer) errorContainer.remove()
            } finally {
                if (renderIdRef.current === currentRender) {
                    setIsRendering(false)
                }
            }
        }

        renderDiagram()
    }, [debouncedCode, initializeMermaid])

    return { svgOutput, error, isRendering }
}
