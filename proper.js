/*eslint-disable no-use-before-define*/
/*eslint-disable no-new-func*/
const createResponse = (onAccess, at) => {
  const finish = key => {
    onAccess(key)
    return createProxy({}, onAccess, `${key}.`)
  }

  // understand function calls
  const ProxyResponse = () => finish(`${at}()`)
  // understand property calls
  ProxyResponse.toString = ProxyResponse.valueOf = () => finish(`${at}.`)

  return createProxy(ProxyResponse, onAccess, `${at}.`)
}
const createProxy = (t, onAccess, at = '') =>
  new Proxy(t, {
    get(target, property, receiver) {
      const key = `${at}${property}`
      // if (key === 'color')
      //   console.log('key', key, 'target', target, 'r', property)
      onAccess(key)
      return createResponse(onAccess, key)
    },
    has(target, key, context) {
      // TODO the problem is iwth thing.color because it finds color but
      // itfails to understand that it is part of thing, maybe because we're not tracking that
      // console.log('target', target, 'context', context, 'key', key)
      onAccess(key)
    },
  })

const VALID_CONSTS = ['props', 'item', 'i']

export default (rawCode, ...args) => {
  // put together the proxies we'll need to match the args that the function will use
  const accessed = {}
  const proxyFromArg = arg => {
    const a = typeof arg === 'string' ? { base: {}, name: arg } : arg
    accessed[a.name] = false

    return createProxy(a.base, key => {
      if (!Array.isArray(accessed[a.name])) {
        if (a.name === key) {
          accessed[a.name] = true
          return
        }
        accessed[a.name] = []
      }

      // when a key is found, store it as accessed
      if (!accessed[a.name].includes(key)) {
        accessed[a.name].push(key)
      }
    })
  }
  const proxies = args.map(proxyFromArg)
  proxies.push(
    new Proxy(
      {},
      {
        has(target, key, context) {
          // TODO the problem is iwth thing.color because it finds color but
          // itfails to understand that it is part of thing, maybe because we're not tracking that
          // console.log('target', target, 'context', context, 'key', key)
          // console.log('keykey', key)
          accessed[key] = true
        },
      }
    )
  )
  // createProxy({}, key => {
  //     // console.error(new Error(key))
  //   }))

  // the code might be a function instead of code that runs right away,
  // if so, extract the internal function's body and use that instead
  let code = rawCode
  const bodyMatch = rawCode.match(/^\s*\{.+\}\s*$/)
  if (bodyMatch) {
    code = bodyMatch[0]
  }
  code = `with (___views___) {${code}}`

  // every code is valid unless stated otherwise :)
  let isValid = true
  let shouldRun = true
  while (shouldRun) {
    try {
      // build a function with the code taking the arguments it needs
      const fn = new Function(
        ...Object.keys(accessed).concat('___views___', code)
      )
      // call it with the proxies
      fn(...proxies)
      shouldRun = false
    } catch (err) {
      // if something went wrong it probably means that there's a syntax error
      // here it's better to be safe than sorry, so we'll flag that code as invalid
      const standaloneMatch = err.message.match(/^(.+) is not defined$/)
      if (standaloneMatch && VALID_CONSTS.includes(standaloneMatch[1])) {
        proxies.push(proxyFromArg({ base: {}, name: standaloneMatch[1] }))
      } else {
        isValid = false
        shouldRun = false
      }
    }
  }

  const flatAccessed = Object.keys(accessed)
    .map(k => {
      const v = accessed[k]
      if (v === true) {
        return k
      } else if (Array.isArray(v)) {
        return [k].concat(v.map(vv => `${k}.${vv}`))
      }
    })
    .reduce((a, b) => a.concat(b), [])

  return {
    accessed: flatAccessed.filter(Boolean),
    isValid,
  }
}
