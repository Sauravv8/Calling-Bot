/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a', // Slate 900
                glass: 'rgba(255, 255, 255, 0.1)',
                'glass-hover': 'rgba(255, 255, 255, 0.15)',
                'glass-border': 'rgba(255, 255, 255, 0.2)',
                primary: '#3b82f6', // Blue 500
                'primary-glow': '#60a5fa',
                text: '#f8fafc', // Slate 50
                'text-muted': '#94a3b8', // Slate 400
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
