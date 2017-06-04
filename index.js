import { basename, extname } from 'path';
import buble from 'buble';
import doMorph from './morphers.js';
import doGetViewNotFound from './get-view-not-found.js';
import toPascalCase from 'to-pascal-case';
import prettier from 'prettier';

const DEFAULT_IMPORT = name => `import ${name} from './${name}.view.js'`;

export const morph = (
  code,
  { as, compile, getImport = DEFAULT_IMPORT, name, pretty = false }
) => {
  let morphed = doMorph[as]({
    getImport,
    name,
    view: code,
  });

  if (compile) {
    morphed = buble.transform(morphed, {
      objectAssign: 'Object.assign',
      transforms: {
        modules: false,
      },
    }).code;
  }

  return pretty
    ? prettier.format(morphed, {
        singleQuote: true,
        trailingComma: 'es5',
      })
    : morphed;
};

export const getViewNotFound = (as, name, warning) =>
  doGetViewNotFound[as](name, warning);

const sanitize = input =>
  basename(input)
    .replace(extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');

export const pathToName = path =>
  toPascalCase(sanitize(basename(path).replace('.view', '')));
