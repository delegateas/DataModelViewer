## [1.1.5] - 2025-07-11

### Changed
- Manual patch release

# Changelog

## [1.1.4](https://github.com/delegateas/DataModelViewer/compare/website-v1.1.3...website-v1.1.4) (2025-07-10)


### Features

* about page ([f063a7e](https://github.com/delegateas/DataModelViewer/commit/f063a7e0cd20cf1a94adc6a394920368ed6203bd))
* integrate HybridTooltip and add Popover component for improved mobile experience ([9f6ea55](https://github.com/delegateas/DataModelViewer/commit/9f6ea55503ee5cd626a92f03ba8d91420f8a8c31))
* integrate HybridTooltip and add Popover component for improved tooltip functionality ([cc95331](https://github.com/delegateas/DataModelViewer/commit/cc95331d5032bad1d78674f86b7d507cd211301e))
* virtualization on sections - not quite satisfied with "jumpto" lag ([ac8d11e](https://github.com/delegateas/DataModelViewer/commit/ac8d11e2be93c698416cdfa8c2ec29c1f00b2931))


### Bug Fixes

* Default empty Data.ts file to enable build in CI without running generator ([ab259b9](https://github.com/delegateas/DataModelViewer/commit/ab259b985adfd3748917b118fa6d2e12ed96a93c))
* ESLint errors ([d1d51bb](https://github.com/delegateas/DataModelViewer/commit/d1d51bb3585c2bfea483fdab40c7b2c2cd7315e0))
* ESLint errors removed ([d1fb07a](https://github.com/delegateas/DataModelViewer/commit/d1fb07a05c00dc95620ae692a1230408ef7553e5))
* fixed all ESLint errors that was causing pipeline issues ([9d0d034](https://github.com/delegateas/DataModelViewer/commit/9d0d034daa7b986e84347aa982e045db22a8605a))
* icon colors removed by accident in PR merge ([004d3dc](https://github.com/delegateas/DataModelViewer/commit/004d3dcb8a9c4555fb60e1511da104fc27bfad17))
* lookup from link to button ([6fa20ad](https://github.com/delegateas/DataModelViewer/commit/6fa20adaef32c84c0f73e7b898b4e3aa98d76bb7))
* missing sidebar control on mobile ([61f6457](https://github.com/delegateas/DataModelViewer/commit/61f645744b06d9c5db2c08fabad3cc7b284e0254))
* reimplemented mobile sidebar ([fc0f104](https://github.com/delegateas/DataModelViewer/commit/fc0f10421a865f1b4345e1b7cea20a7234079dc7))

## [1.1.3](https://github.com/delegateas/DataModelViewer/compare/v1.1.2...v1.1.3) (2025-07-10)

### Features

* New navigation menu and about page with UI improvements
* Added virtualization on sections for better performance
* Implemented mobile sidebar functionality

### Bug Fixes

* Fixed scrollbar issues by removing overflow-x-auto and truncate classes
* Resolved ESLint errors and code quality issues
* Fixed lookup component from link to button

### Code Refactoring

* Created state context for datamodel view management
* Improved scroll logic and navigation behavior
