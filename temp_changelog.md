## [2.2.0] - 2025-10-27

### Features

* Merge pull request #68 from delegateas/features/diagram-2.0.0-patches ([837823f](https://github.com/delegateas/DataModelViewer/commit/837823f))
* customizable labels for links. ([b2486cb](https://github.com/delegateas/DataModelViewer/commit/b2486cb))
* complete removal of links and restoration of them. ([fc2c6d3](https://github.com/delegateas/DataModelViewer/commit/fc2c6d3))
* export diagram to png. ([a52a957](https://github.com/delegateas/DataModelViewer/commit/a52a957))
* control the exclude/include of relationships between entities. See new relations to loaded diagrams. ([0a44fb2](https://github.com/delegateas/DataModelViewer/commit/0a44fb2))
* show multiple relationships between entities in relationship link ([55b7713](https://github.com/delegateas/DataModelViewer/commit/55b7713))
* selfreferencing relationship (minor bug where libavoid likes to move the out port down) ([4fcbef6](https://github.com/delegateas/DataModelViewer/commit/4fcbef6))
* 1-M M-1 indications on relationships. Click to see relationshipproperties. Minor UI adjustments. ([28c2ead](https://github.com/delegateas/DataModelViewer/commit/28c2ead))
* initial libavoid router reimplementation with external worker thread. Also custom defined relationshiplink for future logic ([3c8e3ae](https://github.com/delegateas/DataModelViewer/commit/3c8e3ae))
* Selection properties and first simple gridlayout for entity selection ([4ab492a](https://github.com/delegateas/DataModelViewer/commit/4ab492a))
* remove entity in properties pane ([c7a14b7](https://github.com/delegateas/DataModelViewer/commit/c7a14b7))
* Multiple entity selection and entity properties pane ([f289d7a](https://github.com/delegateas/DataModelViewer/commit/f289d7a))
* selection via paper embeddings and custom class for it ([7f99864](https://github.com/delegateas/DataModelViewer/commit/7f99864))
* selection and multi selection of entities ([96b2d55](https://github.com/delegateas/DataModelViewer/commit/96b2d55))
* rightclick entity event to open contextmenu. ([c1e19a4](https://github.com/delegateas/DataModelViewer/commit/c1e19a4))
* insert new entities in the center of the canvas ([cb1c72e](https://github.com/delegateas/DataModelViewer/commit/cb1c72e))
* peak older version of loaded diagram ([8d11897](https://github.com/delegateas/DataModelViewer/commit/8d11897))
* diagramname textfield & graph state loading (zoom, pan etc) ([bfea9e1](https://github.com/delegateas/DataModelViewer/commit/bfea9e1))
* local development using PAT and readme on it ([8db109d](https://github.com/delegateas/DataModelViewer/commit/8db109d))
* update badges and frontpage news ([d08407b](https://github.com/delegateas/DataModelViewer/commit/d08407b))
* implementation of list and rename of some functions ([a1db5c4](https://github.com/delegateas/DataModelViewer/commit/a1db5c4))
* lock cloud buttons if not configured ([ed749ea](https://github.com/delegateas/DataModelViewer/commit/ed749ea))
* load and save functionality, also download locally to device introduced ([9e3e5dc](https://github.com/delegateas/DataModelViewer/commit/9e3e5dc))
* Diagram header toolbar with actions. Initial attempt at creating documents in ADO. Also a waiting modal. ([299e93d](https://github.com/delegateas/DataModelViewer/commit/299e93d))
* inital attempt at managed identity authentication for digram saving in ADO Repo. ESLINT errors ([c742207](https://github.com/delegateas/DataModelViewer/commit/c742207))
* initial attempt at managed identity setup for save/load of diagram directly to ADO Repository. ([eef0c8c](https://github.com/delegateas/DataModelViewer/commit/eef0c8c))
* add entity functionality & darktheme pane ([1616db1](https://github.com/delegateas/DataModelViewer/commit/1616db1))
* simple canvas movement. zoom, pan and scroll ([6f03fb2](https://github.com/delegateas/DataModelViewer/commit/6f03fb2))

### Bug Fixes

* removed text to show file metadata from load modal. (not available without N requests.) ([cd12214](https://github.com/delegateas/DataModelViewer/commit/cd12214))
* close sidepane if object is null. ([1bc5583](https://github.com/delegateas/DataModelViewer/commit/1bc5583))
* load diagram fixes to looks and data states. ([feb4efb](https://github.com/delegateas/DataModelViewer/commit/feb4efb))
* selection transoformation fixed to be relative to the paper transformation matrix ([bcf1f8a](https://github.com/delegateas/DataModelViewer/commit/bcf1f8a))
* disable entities already in the diagram when inserting from panes ([88322ec](https://github.com/delegateas/DataModelViewer/commit/88322ec))
* minor bug where old selections would be interactive in second selection ([b5e5946](https://github.com/delegateas/DataModelViewer/commit/b5e5946))
* inconsistent envvariable naming. ([743964d](https://github.com/delegateas/DataModelViewer/commit/743964d))
* replaced some queryparams for the load ([55f555e](https://github.com/delegateas/DataModelViewer/commit/55f555e))
* build error fix ([cc74108](https://github.com/delegateas/DataModelViewer/commit/cc74108))
* removed SCM_DO_BUILD_DURING_DEPLOYMENT flag from bicep webservice ([03a5ebc](https://github.com/delegateas/DataModelViewer/commit/03a5ebc))
* build error in deploy step caused by node_modules folder zipping twice. ([423bd9f](https://github.com/delegateas/DataModelViewer/commit/423bd9f))

### Code Refactoring

* refactor relationship logic to seperate file ([bee1324](https://github.com/delegateas/DataModelViewer/commit/bee1324))
* refactored the group/entity accordion to seperate element and reused for the entity picker pane ([1ac3881](https://github.com/delegateas/DataModelViewer/commit/1ac3881))

### Other Changes

* removed branch selection in external pipeline ([1347997](https://github.com/delegateas/DataModelViewer/commit/1347997))
* ESLint & README ([40055ff](https://github.com/delegateas/DataModelViewer/commit/40055ff))
* small disclaimer warning ([eb1e6cb](https://github.com/delegateas/DataModelViewer/commit/eb1e6cb))
* es lint error fixes ([5b811a2](https://github.com/delegateas/DataModelViewer/commit/5b811a2))
* about update ([8d98e7a](https://github.com/delegateas/DataModelViewer/commit/8d98e7a))
* adjustments to the load modal (azure call moved to seperated step) ([bcb0c4f](https://github.com/delegateas/DataModelViewer/commit/bcb0c4f))
* diagram information in the sidebar ([9bb197b](https://github.com/delegateas/DataModelViewer/commit/9bb197b))
* eslint... ([fdd689a](https://github.com/delegateas/DataModelViewer/commit/fdd689a))
* lint failures ([70612d3](https://github.com/delegateas/DataModelViewer/commit/70612d3))
* disabled gutter for layout ([efcac09](https://github.com/delegateas/DataModelViewer/commit/efcac09))
* old diagram deprication ([4989cf6](https://github.com/delegateas/DataModelViewer/commit/4989cf6))


