/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#0B0E11',
        'secondary': '#151A21',
        'mandatory': '#D43838',
        'normal': '#252C37',
        'hover': '#c0392b',
      },
      textColor: {
        'primary': 'white',
        'secondary': '#FFCE4A',
        'hover': '#D43838',
      },
      borderColor: {
        'primary': 'rgba(244, 244, 247, 0.08)',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}