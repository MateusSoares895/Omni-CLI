module.exports = {
  name: 'component',
  alias: 'c',
  description: 'Create new Functional Component',
  run: async (toolbox) => {
    const { createComponent } = toolbox
    const name = toolbox.parameters.first
    await createComponent('components', name)
  }
}
