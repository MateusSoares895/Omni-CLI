module.exports = {
  name: 'page',
  alias: 'p',
  description: 'Create new Functional Page',
  run: async toolbox => {
    const { createComponent } = toolbox
    const name = toolbox.parameters.first
    await createComponent('pages', name)
  }
}
