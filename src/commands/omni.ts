module.exports = {
  name: 'omni',
  description: 'Success Message',
  run: (toolbox) => {
    const {
      print: { success }
    } = toolbox
    success('Welcome to OmniStack CLI')
  }
}
