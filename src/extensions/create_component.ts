import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  const {
    print: { success, error },
    parameters,
    template,
    filesystem
  } = toolbox
  const { resolve } = require('path')
  async function isReactNative () {
    const isReactNative = await !!filesystem.read(
      resolve('package.json'),
      'json'
    ).dependencies['react-native']
    return isReactNative
  }
  async function usingStyledComponents () {
    const usingStyledComponents = await !!filesystem.read(
      'package.json',
      'json'
    ).dependencies['styled-components']
    return usingStyledComponents
  }
  async function createComponent (folder, name) {
    if (parameters.array.length < 1) {
      error('The Name must to be specified')
    } else if (parameters.array.length > 1) {
      error('Only the Name must to be specified')
    } else {
      success(`Creating ${folder}/${name}`)
      if (await isReactNative()) {
        if (await usingStyledComponents()) {
          await template.generate({
            template: 'componentRNSC.ts.ejs',
            target: `src/${folder}/${name}/index.tsx`,
            props: { name: name }
          })
          await template.generate({
            template: 'stylesRNSC.ts.ejs',
            target: `src/${folder}/${name}/styles.ts`
          })
        } else {
          await template.generate({
            template: 'componentRN.ts.ejs',
            target: `src/${folder}/${name}/index.tsx`,
            props: { name }
          })
        }
      } else {
        await template.generate({
          template: 'component.ts.ejs',
          target: `src/${folder}/${name}/index.tsx`,
          props: { name }
        })
        await template.generate({
          template: 'styles.ts.ejs',
          target: `src/${folder}/${name}/styles.ts`
        })
      }
    }
  }
  toolbox.createComponent = createComponent
}
