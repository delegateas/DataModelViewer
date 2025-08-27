## [1.4.0] - 2025-08-27

### Features

* Merge pull request #55 from delegateas/features/home-page ([d4a3e51](https://github.com/delegateas/DataModelViewer/commit/d4a3e51))
* newlines in markdown not being newlines fixed ([bfe78b0](https://github.com/delegateas/DataModelViewer/commit/bfe78b0))
* added card to the wiki page ([170cb67](https://github.com/delegateas/DataModelViewer/commit/170cb67))
* updated README with new variables ([a3cfd87](https://github.com/delegateas/DataModelViewer/commit/a3cfd87))

### Bug Fixes

* introduced ESLint error ([d49a704](https://github.com/delegateas/DataModelViewer/commit/d49a704))
* fallback to stub ([4c0e9bc](https://github.com/delegateas/DataModelViewer/commit/4c0e9bc))

### Other Changes

* updated copystub script to include all files in stubs ([283d626](https://github.com/delegateas/DataModelViewer/commit/283d626))
* navbar changes ([5039239](https://github.com/delegateas/DataModelViewer/commit/5039239))
* installation of markdown parser ([944987f](https://github.com/delegateas/DataModelViewer/commit/944987f))
* Introduction stumb ([de30aee](https://github.com/delegateas/DataModelViewer/commit/de30aee))
* pipeline changes to copy wiki page into Website project ([dab220a](https://github.com/delegateas/DataModelViewer/commit/dab220a))
* inital homepage setup ([9a52836](https://github.com/delegateas/DataModelViewer/commit/9a52836))
* imports wrong ([f2b46ac](https://github.com/delegateas/DataModelViewer/commit/f2b46ac))
* folder renaming / reorder ([a104379](https://github.com/delegateas/DataModelViewer/commit/a104379))


## [1.3.6] - 2025-08-24

### Features

* added naivgation via url (query params avail are section, group, globalsearch) ([38b76af](https://github.com/delegateas/DataModelViewer/commit/38b76af))

### Bug Fixes

* build error ([3868cdf](https://github.com/delegateas/DataModelViewer/commit/3868cdf))
* moved initialocalvalue up ([c242f9e](https://github.com/delegateas/DataModelViewer/commit/c242f9e))
* ESLint ([24cca18](https://github.com/delegateas/DataModelViewer/commit/24cca18))

### Other Changes

* moved datamodel relevant files into folder for datamodel ([4001e1e](https://github.com/delegateas/DataModelViewer/commit/4001e1e))


## [1.3.5] - 2025-08-24

### Features

* selection changes. Multiple entity selection, adding and removing entities from selection via ctrl click. ([4ed27ae](https://github.com/delegateas/DataModelViewer/commit/4ed27ae))

### Bug Fixes

* ESLint errors ([0b90976](https://github.com/delegateas/DataModelViewer/commit/0b90976))
* allow multi selection of squares and texts as well ([413fb54](https://github.com/delegateas/DataModelViewer/commit/413fb54))
* correct scale delta for quare resize ([aad29d0](https://github.com/delegateas/DataModelViewer/commit/aad29d0))

### Other Changes

* warning regarding limitations ([af930e4](https://github.com/delegateas/DataModelViewer/commit/af930e4))
* removed help banner and action banner ([9b815de](https://github.com/delegateas/DataModelViewer/commit/9b815de))
* removed some console.logs fixed some styling issues with selection vs. hover ([a54e6c4](https://github.com/delegateas/DataModelViewer/commit/a54e6c4))


## [1.3.4] - 2025-08-16

### Features

* Add solution filtering and plugin type names to plugin step indicators ([e6dda88](https://github.com/delegateas/DataModelViewer/commit/e6dda88))
* Implement plugin step indicators for attributes ([22259f3](https://github.com/delegateas/DataModelViewer/commit/22259f3))

### Code Refactoring

* Refactor GetPluginStepAttributes to use entity logical names and streamline metadata mapping ([49ddc39](https://github.com/delegateas/DataModelViewer/commit/49ddc39))

### Other Changes

* Use object type codes from entity metadata instead of hardcoded list ([cc0d929](https://github.com/delegateas/DataModelViewer/commit/cc0d929))
* Initial plan ([f208144](https://github.com/delegateas/DataModelViewer/commit/f208144))


## [1.3.3] - 2025-08-16

### Bug Fixes

* handle state as choice instead of generic ([34d45b2](https://github.com/delegateas/DataModelViewer/commit/34d45b2))

### Other Changes

* hide keys when none exists ([9367b4e](https://github.com/delegateas/DataModelViewer/commit/9367b4e))
* show sync time in CEST/CET ([987133c](https://github.com/delegateas/DataModelViewer/commit/987133c))


## [1.3.2] - 2025-08-14

### Bug Fixes

* stop scrollposition change when changing tab ([9321fd7](https://github.com/delegateas/DataModelViewer/commit/9321fd7))
* search now includes all chunks, not just last ([7e6f8af](https://github.com/delegateas/DataModelViewer/commit/7e6f8af))

### Other Changes

* ESLINT ([802eb73](https://github.com/delegateas/DataModelViewer/commit/802eb73))


## [1.3.1] - 2025-08-12

### Features

* rewrote the searchworker to by typesafe. Added global search for more columns. ([ec699d7](https://github.com/delegateas/DataModelViewer/commit/ec699d7))
* local search for attributes, relationships and keys. With clear option and small indication for active globalsearch. Also small warning if both search options are being used. ([c5bb874](https://github.com/delegateas/DataModelViewer/commit/c5bb874))

### Bug Fixes

* ESLint lint errors ([4f92f9b](https://github.com/delegateas/DataModelViewer/commit/4f92f9b))
* dont search before 3 characters ([39b7b09](https://github.com/delegateas/DataModelViewer/commit/39b7b09))

### Other Changes

* PR change requests applied ([f117508](https://github.com/delegateas/DataModelViewer/commit/f117508))
* instead of skeletons, show "no attributes found..." ([c76483a](https://github.com/delegateas/DataModelViewer/commit/c76483a))
* scroll top when searching instead of jumping around randomly ([44867a3](https://github.com/delegateas/DataModelViewer/commit/44867a3))
* ESC clears searchfields ([f231d8e](https://github.com/delegateas/DataModelViewer/commit/f231d8e))


## [1.3.0] - 2025-08-10

### Features

* Merge pull request #49 from delegateas/feature/ER-Diagram ([57bf47a](https://github.com/delegateas/DataModelViewer/commit/57bf47a))
* fixed newly introduced ESLint errors and logs ([40d0ceb](https://github.com/delegateas/DataModelViewer/commit/40d0ceb))
* removed reset of layout when new entities or existing are edited ([84c29c5](https://github.com/delegateas/DataModelViewer/commit/84c29c5))
* added /diagram to middleware. And made loading indication on diagram loading. Fixed text alignment and added open beta disclaimer. ([10f9588](https://github.com/delegateas/DataModelViewer/commit/10f9588))
* added new icon to the diagram nav ([9189e9b](https://github.com/delegateas/DataModelViewer/commit/9189e9b))
* added reset functionality to reset to a single group and clear entire diagram. ([43b9635](https://github.com/delegateas/DataModelViewer/commit/43b9635))
* load/save of diagrams using JSON format ([0e8a082](https://github.com/delegateas/DataModelViewer/commit/0e8a082))
* text element and property pane ([c78482c](https://github.com/delegateas/DataModelViewer/commit/c78482c))
* link/path/relationship options for chaning style and color and label ([4b12030](https://github.com/delegateas/DataModelViewer/commit/4b12030))
* attribute selection mode added to "add group" ([dc4a621](https://github.com/delegateas/DataModelViewer/commit/dc4a621))
* square element for colorfull grouping ([68624b0](https://github.com/delegateas/DataModelViewer/commit/68624b0))
* add entire group to diagram option ([ba84e1c](https://github.com/delegateas/DataModelViewer/commit/ba84e1c))
* new sidebar and add/remove entity functionality. Also moved "add attribute" logic to entitypane ([e2a0c51](https://github.com/delegateas/DataModelViewer/commit/e2a0c51))
* Merge remote-tracking branch 'origin/main' into feature/ER-Diagram ([d03ecb4](https://github.com/delegateas/DataModelViewer/commit/d03ecb4))
* refactor avoid router code into TS and applying to newer JointJS ([88f60be](https://github.com/delegateas/DataModelViewer/commit/88f60be))
* moved diagram sidebar to new navigation ([e837122](https://github.com/delegateas/DataModelViewer/commit/e837122))
* add attribute working ([9326613](https://github.com/delegateas/DataModelViewer/commit/9326613))
* more diagram work. Better grid layout, working on add attribute ([cdb76d9](https://github.com/delegateas/DataModelViewer/commit/cdb76d9))
* addition work on digram page ([192e141](https://github.com/delegateas/DataModelViewer/commit/192e141))

### Bug Fixes

* do recalculation on diagramtype swap ([9430078](https://github.com/delegateas/DataModelViewer/commit/9430078))
* dont use full sized entities for grid layout when using simple diagram type. ([e766180](https://github.com/delegateas/DataModelViewer/commit/e766180))
* fixing linting errors and removeing old console.logs from earlier debugging ([1504f4e](https://github.com/delegateas/DataModelViewer/commit/1504f4e))
* fixed bug when navigating from diagram to datamodel ([1b82413](https://github.com/delegateas/DataModelViewer/commit/1b82413))
* minor issue with attribute hightlight ([1320478](https://github.com/delegateas/DataModelViewer/commit/1320478))
* detailed attribute highlight working again ([79ac552](https://github.com/delegateas/DataModelViewer/commit/79ac552))
* simple entity attrbiute management not working bugfix ([8760bd9](https://github.com/delegateas/DataModelViewer/commit/8760bd9))

### Code Refactoring

* more housecleaning ([ccf61dd](https://github.com/delegateas/DataModelViewer/commit/ccf61dd))
* refactor diagramview into abstraction renderes ([0746342](https://github.com/delegateas/DataModelViewer/commit/0746342))
* AI rules and diagram refactor using them ([6da3414](https://github.com/delegateas/DataModelViewer/commit/6da3414))

### Other Changes

* copilot suggestions ([cc4d309](https://github.com/delegateas/DataModelViewer/commit/cc4d309))
* chroe: lint error... ([3f255b5](https://github.com/delegateas/DataModelViewer/commit/3f255b5))
* minor change to default diagratype and fix to loading diagram spinner ([d11a904](https://github.com/delegateas/DataModelViewer/commit/d11a904))
* removed old cursor file, altered copilot instructions ([4c12e27](https://github.com/delegateas/DataModelViewer/commit/4c12e27))
* package lock changes & minor change to relationship label element ([3d560b5](https://github.com/delegateas/DataModelViewer/commit/3d560b5))
* mobile disclaimer ([ddaf306](https://github.com/delegateas/DataModelViewer/commit/ddaf306))
* more attribute control. Choose initial attributes. And remove attributes option ([887b771](https://github.com/delegateas/DataModelViewer/commit/887b771))
* hover indication on entities ([26f52dc](https://github.com/delegateas/DataModelViewer/commit/26f52dc))
* jumpover and work on simple self referencing ([e534974](https://github.com/delegateas/DataModelViewer/commit/e534974))
* hotfix ([6616482](https://github.com/delegateas/DataModelViewer/commit/6616482))
* Minor tweaks for README. ([8476deb](https://github.com/delegateas/DataModelViewer/commit/8476deb))
* gridlayout changes more dynamic spacing ([df9344f](https://github.com/delegateas/DataModelViewer/commit/df9344f))
* chore. selected attribute color stylings ([ed81c27](https://github.com/delegateas/DataModelViewer/commit/ed81c27))
* redid creation of background dots ([daea0e2](https://github.com/delegateas/DataModelViewer/commit/daea0e2))
* click highlight keys ([456d1e7](https://github.com/delegateas/DataModelViewer/commit/456d1e7))
* canvas now able to render again ([5ddd936](https://github.com/delegateas/DataModelViewer/commit/5ddd936))
* update from main ([6c80231](https://github.com/delegateas/DataModelViewer/commit/6c80231))
* merga main into branch ([00d8588](https://github.com/delegateas/DataModelViewer/commit/00d8588))
* playing around with attribute filtering ([ee1185c](https://github.com/delegateas/DataModelViewer/commit/ee1185c))
* merge with other branch ([feb17cc](https://github.com/delegateas/DataModelViewer/commit/feb17cc))
* first draft of links (cant seem to make the router work though) ([490d060](https://github.com/delegateas/DataModelViewer/commit/490d060))
* nexjs routing instead of client side react router. Initial work to Datamodelview page ([2adc6bb](https://github.com/delegateas/DataModelViewer/commit/2adc6bb))
* react-router installation, jointjs installation, nextjs upgrade to remove  DDoS vulnerability ([9118406](https://github.com/delegateas/DataModelViewer/commit/9118406))


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
