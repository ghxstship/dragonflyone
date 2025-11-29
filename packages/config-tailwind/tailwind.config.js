/**
 * ESLint Tailwind Plugin Config
 * 
 * This file exports the base Tailwind config for ESLint validation.
 * It allows the eslint-plugin-tailwindcss to recognize custom design system classes.
 */
const { baseTailwindConfig } = require('./index.js');

module.exports = baseTailwindConfig;
