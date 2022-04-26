/* eslint-disable */
const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
    darkMode: 'media',
    theme: {
        extend: {
            colors: {
                primary: colors.blue,
                secondary: colors.zinc,
                success: colors.green,
                info: colors.cyan,
                danger: colors.red,
                warning: colors.amber,
            },
            animation: {
                'slide-down': 'slide-down .15s ease 1',
            },
            keyframes: {
                'slide-down': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(-1.6rem)'
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                    },
                }
            }
        },
        minWidth: {
            '2': '0.25rem',
            '3': '0.75rem',
            '4': '1rem',
            '6': '1.5rem',
            '12': '3rem',
            '24': '6rem',
            '32': '8rem',
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        // require('@tailwindcss/typography'),
        require('tailwind-scrollbar'),
    ],
    variants: {
        scrollbar: ['dark']
    }
};