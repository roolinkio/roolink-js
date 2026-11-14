# Contributing

This repository is a copy of a package that Roolink develops in a private
repository. Every commit here is exported from there, so nothing is pushed here
directly.

## Issues and pull requests

- Issues: open them here.
- Pull requests: welcome. Open one here as usual, and CI checks it. A
  maintainer imports it into the private repository, where it's reviewed and
  merged, and the next export brings the change back here. The pull request
  here is then closed.
- Dependency updates: these come from the private repository, so please
  don't open pull requests that only bump versions.

## Building and testing

Build and test it with Node.js's own tools:

```sh
npm install && npm run build && npm test
```

## CI and releases

- This repository keeps no lockfile, so [CI](.github/workflows/ci.yml)
  resolves the ranges in `package.json` as a user's install does.
- The [release workflow](.github/workflows/release.yml) runs on Node.js 24,
  because trusted publishing needs npm 11.5.1 or later. It never restores a
  cache, because other runs could have written it.
