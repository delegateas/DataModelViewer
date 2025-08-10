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


