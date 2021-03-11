#!/bin/bash
set -e

VERSION=`npm version $1`
echo $VERSION

git commit -am "chore: $VERSION"
git tag $VERSION
git push
git push --tags

echo "Now run: npm publish"
