import { GluegunToolbox } from 'gluegun'
import { MigrationsConfig } from '../extensions/ask_config_migrations'

module.exports = {
  name: 'create-node-app',
  alias: 'cna',
  description: 'Create a New Node App',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: { success, info },
      template,
      system,
      parameters,
      prompt: { ask },
      askConfigMigrations
    } = toolbox
    await system.run(`mkdir ${parameters.first}`)
    const yarn = (await ask({
      type: 'select',
      name: 'yarn',
      message: 'You Want use Yarn ?',
      choices: ['Yes', 'No']
    })).yarn === 'Yes'
    const db = (await ask({
      type: 'select',
      name: 'db',
      message: 'You Want configure a DB ?',
      choices: ['Yes', 'No']
    })).db === 'Yes'
    let postgresUrl: string
    let migrationsConfiguration: MigrationsConfig
    let configMigrations: boolean
    if (db) {
      postgresUrl = (await ask({
        type: 'input',
        name: 'postgres_url',
        message: 'What is Your Postgres Url ?',
        choices: ['Yes', 'No']
      })).postgres_url
      configMigrations = (await ask({
        type: 'select',
        name: 'migrations',
        message: 'You Want configure Migrations ?',
        choices: ['Yes', 'No']
      })).migrations === 'Yes'
      if (configMigrations) {
        migrationsConfiguration = await askConfigMigrations()
      }
    }
    if (yarn) {
      info('Initing Project...')
      await system.run(`cd ${parameters.first} && yarn init -y`)
      info('Configuring Typescript...')
      await system.run(
        `cd ${parameters.first} && yarn add typescript ts-node-dev @types/node -D`
      )
      info('Configuring Express and Cors...')
      await system.run(`cd ${parameters.first} && yarn add express cors`)
      info('Configuring TypeDefinitions...')
      await system.run(
        `cd ${parameters.first} && yarn add @types/express -D`
      )
      await system.run(`cd ${parameters.first} && yarn add @types/cors -D`)
    } else {
      info('Initing Project...')
      await system.run(`cd ${parameters.first} && npm init -y`)
      info('Configuring Typescript...')
      await system.run(
        `cd ${parameters.first} && npm i typescript ts-node-dev @types/node -D`
      )
      info('Configuring Express and Cors...')
      await system.run(`cd ${parameters.first} && npm i express cors`)
      info('Configuring TypeDefinitions...')
      await system.run(`cd ${parameters.first} && npm i @types/express -D`)
      await system.run(`cd ${parameters.first} && npm i @types/cors -D`)
    }
    info('Generating Files')
    template.generate({
      template: `index${db ? 'DB' : ''}.ts.ejs`,
      target: `${parameters.first}/src/index.ts`
    })
    template.generate({
      template: 'app.ts.ejs',
      target: `${parameters.first}/src/app/app.ts`
    })
    template.generate({
      template: 'routes.ts.ejs',
      target: `${parameters.first}/src/app/routes.ts`
    })
    template.generate({
      template: 'tsconfig.json.ejs',
      target: `${parameters.first}/tsconfig.json`
    })
    if (db) {
      info('Configuring DB...')
      await system.run(
        `cd ${parameters.first} && ${
        yarn ? 'yarn add' : 'npm i'
        } knex pg dotenv`
      )
      await template.generate({
        template: '.env.ejs',
        target: `${parameters.first}/.env`,
        props: { db_url: postgresUrl }
      })
      await template.generate({
        template: 'connection.ts.ejs',
        target: `${parameters.first}/src/database/connection.ts`
      })
      await template.generate({
        template: `knexfile${configMigrations ? 'Migrations' : ''}.ts.ejs`,
        target: `${parameters.first}/src/database/knexfile.ts`
      })
      if (configMigrations) {
        for (let i = 0; i < migrationsConfiguration.length; i++) {
          await template.generate({
            template: 'migration.ts.ejs',
            target: `${parameters.first}/src/database/migrations/${
              `00${i + 1}`.slice(-3)
              }-${migrationsConfiguration[i].tableName}.ts`,
            props: {
              tableName: migrationsConfiguration[i].tableName,
              collumns: migrationsConfiguration[i].collumns.map((collumn) =>
                `\ttable.${collumn.type}('${collumn.name}')${
                collumn.attributes.map((attribut) =>
                  `.${attribut}()` === '.()' ? '' : `.${attribut}()`
                ).join('')
                }`
              ).join('\n\t')
            }
          })
          const file = `${parameters.first}/src/database/migrations/${
            `00${i + 1}`.slice(-3)
            }-${migrationsConfiguration[i].tableName}.ts`
          await toolbox.filesystem.writeAsync(
            file,
            (await toolbox.filesystem.readAsync(file)).replace(/&#39;/g, "'")
          )
        }
      }
    }
    success('Project Created')
    success('To run:')
    success(`cd ${parameters.first}`)
    success(`${yarn ? 'yarn' : 'npx'} ts-node-dev src/index.ts`)
    if (configMigrations) {
      success('To run migrations:')
      success(`${yarn ? 'yarn' : 'npx'} knex --knexfile src/database/knexfile.ts migrate:lastest`)
    }
  }
}
