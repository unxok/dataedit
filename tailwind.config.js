/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		accentColor: "var(--text-highlight-bg)",
		extend: {
			borderWidth: {
				DEFAULT: "var(--border-width)",
			},
			borderRadius: {
				button: "var(--button-radius)",
				sm: "var(--radius-s)",
				md: "var(--radius-m)",
				lg: "var(--radius-l)",
				xl: "var(--radius-xl)",
			},
			backgroundColor: {
				primary: "var(--background-primary)",
				"primary-alt": "var(--background-primary-alt)",
				secondary: "var(--background-secondary)",
				"secondary-alt": "var(--background-secondary-alt)",
				"modifier-hover": "var(--background-modifier-hover)",
				"modifier-active-hover":
					"var(--background-modifier-active-hover)",
				"modifier-border": "var(--background-modifier-border)",
				"modifier-border-hover":
					"var(--background-modifier-border-hover)",
				"modifier-border-focus":
					"var(--background-modifier-border-focus)",
				"modifier-error-rgb": "var(--background-modifier-error-rgb)",
				"modifier-error": "var(--background-modifier-error)",
				"modifier-error-hover":
					"var(--background-modifier-error-hover)",
				"modifier-success-rgb":
					"var(--background-modifier-success-rgb)",
				"modifier-success": "var(--background-modifier-success)",
				"modifier-message": "var(--background-modifier-message)",
				"modifier-form-field": "var(--background-modifier-form-field)",
			},
			textColor: {
				normal: "var(--text-normal)",
				muted: "var(--text-muted)",
				faint: "var(--text-faint)",
				"on-accent": "var(--text-on-accent)",
				"on-accent-inverted": "var(--text-on-accent-inverted)",
				success: "var(--text-success)",
				warning: "var(--text-warning)",
				error: "var(--text-error)",
				accent: "var(--text-accent)",
				"accent-hover": "var(--text-accent-hover)",
			},
		},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
};
