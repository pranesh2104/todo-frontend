// @ts-check
import { configs } from "@eslint/js";
import { config, configs as typescriptConfigs } from "typescript-eslint";
import { configs as angularConfigs, processInlineTemplates } from "angular-eslint";

export default config(
  {
    files: ["**/*.ts"],
    extends: [
      configs.recommended,
      typescriptConfigs.recommended,
      typescriptConfigs.stylistic,
      angularConfigs.tsRecommended,
    ],
    processor: processInlineTemplates,
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          "enforceBuildableLibDependency": true,
          "allow": [],
          "depConstraints": [
            {
              "sourceTag": "*",
              "onlyDependOnLibsWithTags": ["*"]
            }
          ]
        }
      ],
      // Angular-specific rules
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" }
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" }
      ],
      "@angular-eslint/component-class-suffix": ["error", { suffixes: ["Component", "Page"] }],
      "@angular-eslint/directive-class-suffix": ["error", { suffixes: ["Directive", "Adapter"] }],
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@angular-eslint/no-pipe-impure": "warn",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
      "@typescript-eslint/member-ordering": ["error", {
        default: [
          "public-static-field",
          "private-static-field",
          "public-instance-field",
          "private-instance-field",
          "constructor",
          "public-instance-method",
          "private-instance-method"
        ]
      }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-empty-function": "off", // Angular lifecycle hooks might need empty functions
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],

      // Best practices
      "no-console": ["error", { allow: ["warn", "error"] }],
      "curly": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "@typescript-eslint/no-cycle": "error",
      "import/no-cycle": ["error", {
        maxDepth: 1,
        ignoreExternal: true,
        allowUnsafeDynamicCyclicDependency: false
      }]
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      angularConfigs.templateRecommended,
      angularConfigs.templateAccessibility,
    ],
    rules: {
      // Template accessibility
      "@angular-eslint/template/alt-text": "error",
      "@angular-eslint/template/button-has-type": "error",
      "@angular-eslint/template/label-has-associated-control": "error",

      // Template best practices
      "@angular-eslint/template/no-any": "warn",
      "@angular-eslint/template/cyclomatic-complexity": ["error", { max: 5 }],
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/click-events-have-key-events": "warn",

      // Security
      "@angular-eslint/template/no-inner-html": "warn"
    }
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off"
    }
  }
);