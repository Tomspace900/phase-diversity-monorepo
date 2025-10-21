/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Legacy science colors (kept for compatibility)
  			'science-blue': '#0066cc',
  			'science-dark': '#1a1a2e',
  			'science-light': '#f8f9fa',
  			'science-accent': '#00d4ff',

  			// Base shadcn colors
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				// Néon accents
  				cyan: 'hsl(var(--accent-cyan))',
  				green: 'hsl(var(--accent-green))',
  				pink: 'hsl(var(--accent-pink))',
  				purple: 'hsl(var(--accent-purple))',
  				orange: 'hsl(var(--accent-orange))',
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},

  			// Semantic colors
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			error: 'hsl(var(--error))',
  			info: 'hsl(var(--info))',

  			// UI elements
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',

  			// Data visualization
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Néon glow animations
  		animation: {
  			'glow': 'glow 2s ease-in-out infinite alternate',
  			'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
  		},
  		keyframes: {
  			glow: {
  				'from': {
  					boxShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))'
  				},
  				'to': {
  					boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary)), 0 0 40px hsl(var(--primary))'
  				},
  			},
  			'glow-pulse': {
  				'0%, 100%': {
  					boxShadow: '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary))'
  				},
  				'50%': {
  					boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary)), 0 0 40px hsl(var(--primary))'
  				},
  			},
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
