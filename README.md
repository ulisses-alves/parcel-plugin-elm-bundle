# parcel-plugin-elm-bundle
Parcel plugin for bundling multiple Elm applications.

## Use-case
Let's say you have two Elm application modules, `A` and `B`; and both will be imported and initialized in a parent application:

`./index.js`
```javascript
import { Elm as ElmA } from './elm/A.elm'
import { Elm as ElmB } from './elm/B.elm'

ElmA.A.init(...)
ElmB.B.init(...)
```

Using Parcel's native Elm bundler, results into `A` and `B` being compiled indepently, so all modules shared between them will get bundled twice, thus producing a much larger output in comparison to:
```
elm make ./elm/A.elm ./elm/B.elm --output=bundle.js
```
This plugin provides a way combine the outputs of `A` and `B` by defining a module bundle file (.elmb):
`./apps.elmb`
```json
{
  "modules": [
    "./elm/A.elm",
    "./elm/B.elm"
  ]
}
```
Now instead of importing the modules directly, the bundle definition file can be imported instead:
```javascript
import { A, B } from './apps.elmb'

A.init(...)
B.init(...)
```
## Future
The expectation is that Parcel will eventually provide a built-in way to achieve the same results as this plugin, thus making it obsolete. In the mean time, pull requests, bug reports and suggestions are very much welcomed.