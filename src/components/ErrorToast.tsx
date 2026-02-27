import { AlertTriangle } from 'lucide-react'

interface ErrorToastProps {
    message: string
}

export default function ErrorToast({ message }: ErrorToastProps) {
    // Truncate long error messages
    const displayMessage =
        message.length > 120 ? message.slice(0, 120) + '…' : message

    return (
        <div className="toast-enter absolute bottom-4 left-4 right-4 z-50">
            <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl border"
                style={{
                    background: 'oklch(0.2 0.05 25 / 0.85)',
                    borderColor: 'oklch(0.5 0.2 25 / 0.3)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                <AlertTriangle
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: 'oklch(0.7 0.2 25)' }}
                />
                <div>
                    <p
                        className="text-xs font-semibold mb-0.5"
                        style={{ color: 'oklch(0.8 0.15 25)' }}
                    >
                        Syntax Error
                    </p>
                    <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'oklch(0.7 0.05 25)' }}
                    >
                        {displayMessage}
                    </p>
                </div>
            </div>
        </div>
    )
}
