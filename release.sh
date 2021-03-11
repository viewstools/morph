#!/bin/bash

VERSION=`npm version ${1:-patch}`
git commit -am 'chore: $VERSION'
git tag $VERSION
git push
git push --tags
npm publish
