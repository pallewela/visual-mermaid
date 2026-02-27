import { useCallback, useState, useRef } from 'react'
import { Copy, Download, Code2, Check } from 'lucide-react'
import { toPng } from 'html-to-image'

interface ExportBarProps {
    svgOutput: string
    code: string
}

export default function ExportBar({ svgOutput, code }: ExportBarProps) {
    const [copiedSvg, setCopiedSvg] = useState(false)
    const [copiedMd, setCopiedMd] = useState(false)
    const hiddenRef = useRef<HTMLDivElement>(null)

    const copySvg = useCallback(async () => {
        if (!svgOutput) return
        await navigator.clipboard.writeText(svgOutput)
        setCopiedSvg(true)
        setTimeout(() => setCopiedSvg(false), 2000)
    }, [svgOutput])

    const downloadPng = useCallback(async () => {
        if (!svgOutput || !hiddenRef.current) return
        hiddenRef.current.innerHTML = svgOutput

        // Ensure the SVG inside has explicit dimensions
        const svgEl = hiddenRef.current.querySelector('svg')
        if (svgEl) {
            if (!svgEl.getAttribute('width')) {
                const bbox = svgEl.getBBox()
                svgEl.setAttribute('width', String(bbox.width + 40))
                svgEl.setAttribute('height', String(bbox.height + 40))
            }
        }

        try {
            const dataUrl = await toPng(hiddenRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
            })
            const link = document.createElement('a')
            link.download = 'mermaid-diagram.png'
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('PNG export failed:', err)
        } finally {
            hiddenRef.current.innerHTML = ''
        }
    }, [svgOutput])

    const copyMarkdown = useCallback(async () => {
        const md = '```mermaid\n' + code + '\n```'
        await navigator.clipboard.writeText(md)
        setCopiedMd(true)
        setTimeout(() => setCopiedMd(false), 2000)
    }, [code])

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={copySvg}
                    className="glass-button"
                    disabled={!svgOutput}
                    title="Copy SVG to clipboard"
                >
                    {copiedSvg ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    {copiedSvg ? 'Copied!' : 'SVG'}
                </button>

                <button
                    onClick={downloadPng}
                    className="glass-button"
                    disabled={!svgOutput}
                    title="Download as PNG"
                >
                    <Download size={14} />
                    PNG
                </button>

                <button
                    onClick={copyMarkdown}
                    className="glass-button"
                    title="Copy Markdown code block"
                >
                    {copiedMd ? <Check size={14} className="text-success" /> : <Code2 size={14} />}
                    {copiedMd ? 'Copied!' : 'Markdown'}
                </button>
            </div>

            {/* Hidden container for PNG export */}
            <div
                ref={hiddenRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    background: '#ffffff',
                    padding: '20px',
                }}
            />
        </>
    )
}
