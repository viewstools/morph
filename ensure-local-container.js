import fs from 'mz/fs.js'

let GET_INITIAL_LANGUAGE = {
  'react-dom': `export default supported => closest(navigator.language || navigator.browserLanguage, supported)

let base = item => item.substr(0, 2);
let closest = (value, list) =>
  value
    ? list.find(item => item === value) ||
list.find(item => base(item) === value) ||
      closest(value.length > 2 ? base(value) : null, list)
    : list[0];

// example to take a querystring param named "lang" into account
//
// import qs from 'querystringify'
// export default supported => closest(qs.parse(window.location.search).lang || navigator.language || navigator.browserLanguage, supported)`,
  'react-native': `import { Util } from 'expo'

export default async supported => closest(await Util.getCurrentLocaleAsync(), supported)

let base = item => item.substr(0, 2);
let closest = (value, list) =>
  value
    ? list.find(item => item === value) ||
list.find(item => base(item) === value) ||
      closest(value.length > 2 ? base(value) : null, list)
    : list[0];`,
}

let LOCAL_CONTAINER = {
  'react-dom': supported => `import { Container } from 'unstated';
import getInitialLanguage from './get-initial-language.js';

export default class LocalContainer extends Container {
  constructor() {
    super()

    let supported = ${JSON.stringify(supported).replace(/"/g, "'")}

    this.state = {
      lang: getInitialLanguage(supported),
      supported,
    };
  }

  set(lang) {
    if (!this.state.supported.includes(lang)) return;

    this.setState({ lang });
  }
}`,
  'react-native': supported => `import { Container } from 'unstated';
import getInitialLanguage from './get-initial-language.js';

export default class LocalContainer extends Container {
  constructor() {
    super()

    let supported = ${JSON.stringify(supported).replace(/"/g, "'")}

    this.state = {
      lang: supported[0],
      supported,
    };

    getInitialLanguage(supported).then(this.set)
  }

  set(lang) {
    if (!this.state.supported.includes(lang)) return;

    this.setState({ lang });
  }
}`,
}

export default async function ensureLocalContainer({
  as,
  file,
  fileGetInitialLanguage,
  supported,
}) {
  if (!(await fs.exists(fileGetInitialLanguage))) {
    await fs.writeFile(fileGetInitialLanguage, GET_INITIAL_LANGUAGE[as], {
      encoding: 'utf8',
    })
  }
  await fs.writeFile(file, LOCAL_CONTAINER[as](supported), { encoding: 'utf8' })
}
