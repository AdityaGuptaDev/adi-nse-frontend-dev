/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        colors: {
            primary: '#F59E0B',
            secondary: '#B45309',
            accent: 'var(--color-accent)',
            accentcontent: 'var(--color-accent-content)',
        },
        fontFamily: {
            sans: ["var(--font-lato)"],
        },
        fontWeight: {
            normal: "400",
            medium: "500",
            semibold: "500",
            bold: "400",
        },
        extend: {
            colors: {
                primary: '#F59E0B',
                secondary: '#B45309',
                accent: 'var(--color-accent)',
                accentcontent: 'var(--color-accent-content)',
                placeholder: 'var(--color-placeholder)',
                disable: 'var(--color-disable)',
                "field-border": 'var(-color-field-border)',
                mainbackground: 'var(--color-mainbackground)',
                border: 'var(--color-border)',
                other: 'var(--color-other)',
                progressBg: 'var(--color-progressBg)'
            },
            fontFamily: {
                sans: ["var(--font-lato)"],
            },
            fontWeight: {
                normal: "400",
                medium: "500",
                semibold: "500",
                bold: "400",
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        // themes: ["light"],// or create your own
        // darkTheme: false, // This disables dark mode
        daisyui: {
            themes: [
                {
                    light: {
                        // ...require("daisyui/src/colors/themes")["[data-theme=light]"],
                        // "primary": "#2c3e50",
                        primary: "var(--color-primary)",
                        secondary: "var(--color-secondary)",
                        "base-content": "var(--color-base-content)",
                        accent: "var(--color-accent)", // Custom token
                        accentcontent: 'var(--color-accent-content)',
                    },
                },
                {
                    dark: {
                        // ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
                        // "primary": "#2c3e50",
                        primary: "var(--color-primary)",
                        secondary: "var(--color-secondary)",
                        "base-content": "var(--color-base-content)",
                        accent: "var(--color-accent)", // Custom token
                        accentcontent: 'var(--color-accent-content)',
                    },
                },
            ],
        },
        // themes: ["light", "dark", "cupcake"],
    },
    // tailwind.config.js
    module, exports: {
        experimental: {
            useLightDarkSelectors: true, // if you need dark mode
            useColorOpacityVars: true, // if you use opacity utilities
        },
        future: {
            disableColorOpacityUtilitiesByDefault: true, // optional
        },
        // Force RGB output instead of OKLCH
        corePlugins: {
            backgroundOpacity: false,
            textOpacity: false,
            borderOpacity: false,
        },
    }

}