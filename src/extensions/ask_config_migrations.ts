import { GluegunToolbox } from 'gluegun'

export type MigrationsConfig = {
  tableName: string;
  collumns: { name: string; type: string; attributes: string[] }[];
}[];

module.exports = (toolbox: GluegunToolbox) => {
  const { prompt: { ask } } = toolbox

  async function askConfigMigrations () {
    const migrationConfig: MigrationsConfig = []
    const numberOfMigration = Number(
      (await ask({
        type: 'numeral',
        name: 'numberOfMigrations',
        message: 'How Many Migrations you want configure ?'
      })).numberOfMigrations
    )
    for (let i = 0; i < numberOfMigration; i++) {
      const tableName = (await ask({
        type: 'input',
        name: 'tableName',
        message: 'What are the name of table ?'
      })).tableName
      const numberOfCollumns = Number(
        (await ask(
          {
            type: 'numeral',
            name: 'numberOfCollumns',
            message: 'How many Collumns you want Configure ?'
          }
        )).numberOfCollumns
      )
      const collumns: { name: string; type: string; attributes: string[] }[] = []
      for (let i = 0; i < numberOfCollumns; i++) {
        const nameOfCollumn = (await ask({
          type: 'input',
          name: 'nameOfCollumn',
          message: 'What name of this Collumn ?'
        })).nameOfCollumn
        const typeOfCollumn = (await ask(
          {
            type: 'input',
            name: 'typeOfCollumn',
            message: 'What are type of this collumn'
          }
        )).typeOfCollumn
        const attributesOfCollumn = (await ask(
          {
            type: 'input',
            name: 'attributesOfCollumn',
            message:
              'What are the attributes of this collumn ? ( separated by commas )'
          }
        )).attributesOfCollumn.split(',').map((attribut) => attribut.trim())
        collumns.push(
          {
            name: nameOfCollumn,
            type: typeOfCollumn,
            attributes: attributesOfCollumn
          }
        )
      }
      migrationConfig.push({ tableName, collumns })
    }
    return migrationConfig
  }

  toolbox.askConfigMigrations = askConfigMigrations
}
