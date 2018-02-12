# Contributing

## How do I debug the morpher locally?

1. You need to symlink your local morpher to your Views project.

    * In your local instance of the morpher run `yarn link` in the root directory.
    * In your project where you are using Views run `yarn link @viewstools/morph` in the root directory.

2. Put in your `debugger` statements where necessary.

3. Run `yarn prepare` in the morpher directory to bundle your code.

4. In your views project run `node --inspect ./node_modules/views-morph/cli.js . --watch`. This will watch your current directory. If you just want to watch a subdirectory within that you can replace the `.` in that command with the path to the subdirectory.

5. In chrome open your dev tools on any tab. Click on the green icon at the top to open the node dev tools. Bingo! :tada:

6. Everytime you make changes to the code in the morpher you'll need to run `yarn prepare` for those changes to be picked up by your Views project.

## How do I update tests?

The tests are in `__tests__/views`. We are using [Jest snapshot testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

You can run all the tests with `yarn test`, or you can run a specific test with `jest -t '<nameOfTest>'`.

You can debug a specific test with `node --inspect node_modules/.bin/jest --runInBand -t='<nameOfTest>'`.

When you're happy with snapshot diffs you can run `yarn test -u` to update them all at once or you can run `jest --updateSnapshot -t='<nameOfTest>'` to update them individually.

All tests should be passing before you open a PR.<br/><br/>

Having problems? Let us know in the [Views slack channel](https://slack.views.tools/).

Thanks! :clap:
