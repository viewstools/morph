export default ({ name, state }) => {
  const render = state.render.sort().join('')

  return ` const get = (id, ...scopes) => () => {
    const el = browser.element(\`[data-test-id*="\$\{id}|"]\`);

    scopes.forEach(scope => {
      el[scope] = () => browser.element(\`[data-test-id="\$\{id}|\$\{scope}"]\`);
    });

    return el;
  };

  const ${state.name} = {
    ${render}
  };

  export default ${state.name};

  `
}
