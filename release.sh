#!/bin/bash
set -e

VERSION=`npm version $1`
git commit -am "chore: $VERSION"
git tag $VERSION
git push
git push --tags
npm publish
