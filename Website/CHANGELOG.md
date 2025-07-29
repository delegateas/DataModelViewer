## [1.2.4] - 2025-07-29

### Features

* PBI 119607 - Optional organisation logo ([3a4d5f7](https://github.com/delegateas/DataModelViewer/commit/3a4d5f7))

### Bug Fixes

* searchbar z-index lowered, so sidebar is not overlapped ([3aa15be](https://github.com/delegateas/DataModelViewer/commit/3aa15be))
* BUG 119281 - allow to generate with no security roles in solution ([04bff3d](https://github.com/delegateas/DataModelViewer/commit/04bff3d))

### Other Changes

* clear search input button ([1efbc9e](https://github.com/delegateas/DataModelViewer/commit/1efbc9e))
* removed unnes package jsons in root folder ([27c4431](https://github.com/delegateas/DataModelViewer/commit/27c4431))
* Update README.md ([08b19c7](https://github.com/delegateas/DataModelViewer/commit/08b19c7))
* patched empty searching glitch ([403be6e](https://github.com/delegateas/DataModelViewer/commit/403be6e))


## [1.2.3] - 2025-07-28

### Features

* tiny padding added to scroll, to ensure correct section is found in the list ([9fd4e94](https://github.com/delegateas/DataModelViewer/commit/9fd4e94))

### UI/UX Improvements

* ui adjustments to section and group selection ([759966e](https://github.com/delegateas/DataModelViewer/commit/759966e))


## [1.2.2] - 2025-07-28

### Features

* PBI 119268 - password field marked password, and UI reimplementation ([f8c8259](https://github.com/delegateas/DataModelViewer/commit/f8c8259))

### Code Refactoring

* restructureing release pipeline ([63f5b60](https://github.com/delegateas/DataModelViewer/commit/63f5b60))

### Other Changes

* changed gradient ([25fa000](https://github.com/delegateas/DataModelViewer/commit/25fa000))


## [1.2.1] - 2025-07-26

### Changed
- Changes since 1.2.0:
- Merge pull request #43 from delegateas/patch/latest-update-date
- fix: added lastsync to stub
- chore: moved show element to sidebar state and auto collapse on info.
- chore: PBI 119274 - Last Synched on about page
- chore: manually altered changelog

## [1.2.0] - 2025-07-26

### Changed
- Manual minor release

### Features

* High-performance search system with Web Worker-based processing ([5b5837b](https://github.com/delegateas/DataModelViewer/commit/5b5837b))
* Portal-isolated search component for 60fps input responsiveness ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Next/previous navigation with keyboard shortcuts (Enter, Shift+Enter, Ctrl+↑↓) ([5b5837b](https://github.com/delegateas/DataModelViewer/commit/5b5837b))
* Auto-jump to first search result functionality ([5b5837b](https://github.com/delegateas/DataModelViewer/commit/5b5837b))
* Real-time search progress indication with loading bar ([3800fda](https://github.com/delegateas/DataModelViewer/commit/3800fda))
* Global search on attributes and entities ([3800fda](https://github.com/delegateas/DataModelViewer/commit/3800fda))
* Collapsible sidebar with minimize functionality - PBI 119531 ([0d0f57f](https://github.com/delegateas/DataModelViewer/commit/0d0f57f))
* Auto-collapse sidebar on off-content click for mobile - PBI 119536 ([39726df](https://github.com/delegateas/DataModelViewer/commit/39726df))
* Direct group navigation links to first section in group - PBI 119537 ([ac13fcb](https://github.com/delegateas/DataModelViewer/commit/ac13fcb))

### Performance Improvements

* Time-sliced input processing maintains 60fps during heavy operations ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Web Worker isolation prevents main thread blocking ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Context-based performance scheduling for priority updates ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Progressive result loading for large datasets ([3800fda](https://github.com/delegateas/DataModelViewer/commit/3800fda))
* Enhanced virtualization for better handling of large data sets ([5a2e8a5](https://github.com/delegateas/DataModelViewer/commit/5a2e8a5))

### Bug Fixes

* Prevented screen jumping during tab changes - PBI 119533 ([5a2e8a5](https://github.com/delegateas/DataModelViewer/commit/5a2e8a5))
* Fixed sidebar selection to follow scroll position more accurately - PBI 119535 ([6e4f3ba](https://github.com/delegateas/DataModelViewer/commit/6e4f3ba))
* Fixed item counts to show only visible items - PBI 119588 ([fa450b5](https://github.com/delegateas/DataModelViewer/commit/fa450b5))

### UI/UX Improvements

* Replaced "entity" terminology with "table" throughout UI - PBI 119532 ([f5c8719](https://github.com/delegateas/DataModelViewer/commit/f5c8719))
* Enhanced status attribute styling for better visual hierarchy ([543d453](https://github.com/delegateas/DataModelViewer/commit/543d453))
* Added search icon and modernized search interface ([59aaaa7](https://github.com/delegateas/DataModelViewer/commit/59aaaa7))
* Improved mobile responsiveness and touch interactions

### Code Refactoring

* Moved search functionality into dedicated data context ([6dfde36](https://github.com/delegateas/DataModelViewer/commit/6dfde36))
* Separated search bar and progress bar into independent DOM trees ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Added SearchPerformanceContext for coordinated update scheduling ([4385826](https://github.com/delegateas/DataModelViewer/commit/4385826))
* Enhanced data loading with dedicated worker processing

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
