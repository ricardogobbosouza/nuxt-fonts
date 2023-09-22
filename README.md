# @nuxt/fonts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> Fonts module for Nuxt

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add `@nuxt/fonts` dependency to your project

With `pnpm`

```bash
pnpm add @nuxt/fonts
```

Or, with `yarn`

```bash
yarn add @nuxt/fonts
```

Or, with `npm`

```bash
npm install @nuxt/fonts
```

2. Add `@nuxt/fonts` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    // Simple usage
    "@nuxt/fonts",

    // With options
    [
      "@nuxt/fonts",
      {
        /* module options */
      },
    ],
  ],
});
```

### Using top level options

```js
export default defineNuxtConfig({
  modules: ["@nuxt/fonts"],
  fonts: {
    /* module options */
  },
});
```

## Options

### `inline`

- Type: `Boolean`
- Default: `nuxt.options.ssr`

### `provider`

- Type: `google|local|bunny`
- Default: `'google'`

### `families`

- Type: `Array`

```ts
export default {
  fonts: {
    families: [
      name: string
      as?: string
      provider?: Providers
      subsets?: string | string[]
      display?: FontDisplay
      normal?: number | number[] | string | string[]
      italic?: number | number[] | string | string[]
      fallbacks?: string[]
      text?: string
    ]
  }
}
```

### `fallbacks`

- Type: `String[]`
- Default: `['BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans']`

## Contributing

You can contribute to this module online with CodeSandBox:

[![Edit @nuxt/fonts](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/nuxt/fonts/?fontsize=14&hidenavigation=1&theme=dark)

Or locally:

1. Clone this repository
2. Install dependencies using `pnpm install`
3. Prepare development server using `pnpm dev:prepare`
4. Build module using `pnpm build`
5. Launch playground using `pnpm dev`

## License

[MIT License](./LICENSE)

Copyright (c) Nuxt

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@nuxt/fonts/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxt/fonts
[npm-downloads-src]: https://img.shields.io/npm/dt/@nuxtjs/fonts.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxt/fonts
[github-actions-ci-src]: https://github.com/nuxt/fonts/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/nuxt/fonts/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/nuxt/fonts.svg
[codecov-href]: https://codecov.io/gh/nuxt/fonts
[license-src]: https://img.shields.io/npm/l/@nuxt/fonts.svg
[license-href]: https://npmjs.com/package/@nuxt/fonts
