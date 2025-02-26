import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [...compat.extends('eslint:recommended'), {
	linterOptions: {
		reportUnusedDisableDirectives: true
	},

	languageOptions: {
		globals: {
			...globals.browser,
			...globals.jquery,
			mw: 'readonly',
			OO: 'readonly'
		}
	},

	rules: {
		'no-console': 'warn',

		'no-extra-parens': ['warn', 'all', {
			nestedBinaryExpressions: false
		}],

		'no-unreachable-loop': 'warn',
		'block-scoped-var': 'warn',
		'curly': 'warn',
		'default-case': 'warn',
		'dot-notation': 'warn',
		'eqeqeq': 'warn',
		'guard-for-in': 'warn',
		'no-caller': 'warn',
		'no-else-return': 'warn',

		'no-implicit-coercion': ['warn', {
			boolean: false
		}],

		'no-lone-blocks': 'warn',

		'no-multi-spaces': ['warn', {
			ignoreEOLComments: true
		}],

		'no-useless-return': 'warn',
		'yoda': 'warn',
		'block-spacing': 'warn',
		'brace-style': ['warn', '1tbs'],
		'comma-dangle': 'warn',

		'comma-spacing': ['warn', {
			before: false,
			after: true
		}],

		'computed-property-spacing': ['warn', 'never'],
		'func-call-spacing': ['warn', 'never'],

		'indent': ['warn', 'tab', {
			outerIIFEBody: 0,
			SwitchCase: 1
		}],

		'key-spacing': ['warn', {
			singleLine: {
				beforeColon: false,
				afterColon: true
			}
		}],

		'keyword-spacing': ['warn', {
			after: true,
			before: true
		}],

		'linebreak-style': ['warn', 'unix'],
		'no-array-constructor': 'warn',
		'no-bitwise': 'warn',
		'no-mixed-operators': 'warn',
		'no-new-object': 'warn',

		'no-tabs': ['warn', {
			allowIndentationTabs: true
		}],

		'no-trailing-spaces': 'warn',
		'no-unneeded-ternary': 'warn',
		'no-whitespace-before-property': 'warn',
		'quote-props': ['warn', 'consistent-as-needed'],

		'quotes': ['warn', 'single', {
			avoidEscape: true
		}],

		'semi': ['warn', 'always'],
		'space-before-blocks': 'warn',
		'space-in-parens': ['warn', 'never'],
		'space-infix-ops': 'warn',
		'space-unary-ops': 'warn',

		'spaced-comment': ['warn', 'always', {
			line: {
				exceptions: ['-']
			},

			block: {
				balanced: true
			}
		}],

		'switch-colon-spacing': 'warn'
	}
}];