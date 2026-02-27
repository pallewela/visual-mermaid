export interface FontOption {
    name: string
    value: string
}

export const CLASSIC_FONTS: FontOption[] = [
    { name: 'Inter', value: '"Inter", ui-sans-serif, system-ui, sans-serif' },
    { name: 'Roboto', value: '"Roboto", sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' },
    { name: 'Nunito', value: '"Nunito", sans-serif' },
    { name: 'Poppins', value: '"Poppins", sans-serif' },
    { name: 'Fira Sans', value: '"Fira Sans", sans-serif' },
]

export const SKETCH_FONTS: FontOption[] = [
    { name: 'Caveat', value: '"Caveat", cursive' },
    {
        name: 'Architects Daughter',
        value: '"Architects Daughter", cursive',
    },
    { name: 'Comic Neue', value: '"Comic Neue", cursive' },
    { name: 'Patrick Hand', value: '"Patrick Hand", cursive' },
    { name: 'Indie Flower', value: '"Indie Flower", cursive' },
    { name: 'Kalam', value: '"Kalam", cursive' },
]

export interface AccentColors {
    primary: string
    border: string
    tertiary: string
}

export interface ColorPreset {
    name: string
    swatch: string
    dark: AccentColors
    light: AccentColors
}

export const COLOR_PRESETS: ColorPreset[] = [
    {
        name: 'Indigo',
        swatch: '#6366f1',
        dark: { primary: '#6366f1', border: '#4f46e5', tertiary: '#1e1b4b' },
        light: { primary: '#818cf8', border: '#6366f1', tertiary: '#eef2ff' },
    },
    {
        name: 'Violet',
        swatch: '#8b5cf6',
        dark: { primary: '#8b5cf6', border: '#7c3aed', tertiary: '#2e1065' },
        light: { primary: '#a78bfa', border: '#8b5cf6', tertiary: '#f5f3ff' },
    },
    {
        name: 'Rose',
        swatch: '#f43f5e',
        dark: { primary: '#f43f5e', border: '#e11d48', tertiary: '#4c0519' },
        light: { primary: '#fb7185', border: '#f43f5e', tertiary: '#fff1f2' },
    },
    {
        name: 'Amber',
        swatch: '#f59e0b',
        dark: { primary: '#f59e0b', border: '#d97706', tertiary: '#451a03' },
        light: { primary: '#fbbf24', border: '#f59e0b', tertiary: '#fffbeb' },
    },
    {
        name: 'Emerald',
        swatch: '#10b981',
        dark: { primary: '#10b981', border: '#059669', tertiary: '#022c22' },
        light: { primary: '#34d399', border: '#10b981', tertiary: '#ecfdf5' },
    },
    {
        name: 'Cyan',
        swatch: '#06b6d4',
        dark: { primary: '#06b6d4', border: '#0891b2', tertiary: '#083344' },
        light: { primary: '#22d3ee', border: '#06b6d4', tertiary: '#ecfeff' },
    },
    {
        name: 'Slate',
        swatch: '#64748b',
        dark: { primary: '#64748b', border: '#475569', tertiary: '#0f172a' },
        light: { primary: '#94a3b8', border: '#64748b', tertiary: '#f8fafc' },
    },
    {
        name: 'Orange',
        swatch: '#f97316',
        dark: { primary: '#f97316', border: '#ea580c', tertiary: '#431407' },
        light: { primary: '#fb923c', border: '#f97316', tertiary: '#fff7ed' },
    },
]
