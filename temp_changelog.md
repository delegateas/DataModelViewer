## [2.2.6] - 2025-11-27

### Features

* additional activity standard attribute metadata filters ([48e0d48](https://github.com/delegateas/DataModelViewer/commit/48e0d48))
* homepage update and navigation "new" markers ([42a1c5f](https://github.com/delegateas/DataModelViewer/commit/42a1c5f))
* added workflows and business rules to the process view. And fixed the circle size in the card component. ([e3d231a](https://github.com/delegateas/DataModelViewer/commit/e3d231a))
* more relationship logic showing N:1, 1:N correctly. And also using chips that are disabled for targets not in solution ([76b35f0](https://github.com/delegateas/DataModelViewer/commit/76b35f0))
* refactored the MUI matrix into Nivo heatmap ([45d2e83](https://github.com/delegateas/DataModelViewer/commit/45d2e83))
* Added solution information to components and swapped chord chart for an interactive matrix. ([d87a276](https://github.com/delegateas/DataModelViewer/commit/d87a276))
* info texts on graphs in insights ([4f5c326](https://github.com/delegateas/DataModelViewer/commit/4f5c326))
* workflow dependencies from microsoft retrieved in generator. Flag for implicit/explicit components. ([f8d6b8a](https://github.com/delegateas/DataModelViewer/commit/f8d6b8a))
* new generator logic to show inclusion type and visually the same as the make portal ([9492036](https://github.com/delegateas/DataModelViewer/commit/9492036))

### Bug Fixes

* heatmap missing from lock ([02bc756](https://github.com/delegateas/DataModelViewer/commit/02bc756))
* global search disabled pointer events on the table search ([a1d7de2](https://github.com/delegateas/DataModelViewer/commit/a1d7de2))
* build errors ([b969d09](https://github.com/delegateas/DataModelViewer/commit/b969d09))
* unnessecary attribute filters, extension method to fet userlocalized label and exceptions checks for relationships. ([c7a38e9](https://github.com/delegateas/DataModelViewer/commit/c7a38e9))
* Argument exception when no plural name exists for entity ([4142117](https://github.com/delegateas/DataModelViewer/commit/4142117))
* solutiontype in generated data is not the same data in grouptype. Removed the SolutionType and keeping data inside groups. This will break chord chart. ([b951ea4](https://github.com/delegateas/DataModelViewer/commit/b951ea4))
* workflow dependencies incorrectly found ([ae61b86](https://github.com/delegateas/DataModelViewer/commit/ae61b86))

### Code Refactoring

* cleanup in tool scripts and fixed WR description script issue (needed PublishAot=false to construct serviceclient) ([a81323e](https://github.com/delegateas/DataModelViewer/commit/a81323e))
* refactored dataverseservice into smaller services ([698f250](https://github.com/delegateas/DataModelViewer/commit/698f250))

### Other Changes

* Update README.md ([d1aafd9](https://github.com/delegateas/DataModelViewer/commit/d1aafd9))
* missing nivo/heatmap from dependencies ([0d957ff](https://github.com/delegateas/DataModelViewer/commit/0d957ff))
* minor graph adjustments ([77ea09f](https://github.com/delegateas/DataModelViewer/commit/77ea09f))
* TS type changes ([8207554](https://github.com/delegateas/DataModelViewer/commit/8207554))
* adjustments to search box on metadata ([7772903](https://github.com/delegateas/DataModelViewer/commit/7772903))
* tooltips on header buttons ([1d5bfd0](https://github.com/delegateas/DataModelViewer/commit/1d5bfd0))
* hotfix: missing enum value in Types.ts ([522c0e8](https://github.com/delegateas/DataModelViewer/commit/522c0e8))


