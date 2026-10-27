import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist", "node_modules", "data", "coverage"] },
	js.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			globals: globals.node,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
			]
		}
	},
	{
		// Vitest asymmetric matchers (expect.any, expect.objectContaining) are typed as `any`.
		files: ["tests/**/*.ts"],
		rules: { "@typescript-eslint/no-unsafe-assignment": "off" }
	},
	{
		files: ["**/*.js"],
		extends: [tseslint.configs.disableTypeChecked]
	}
);
