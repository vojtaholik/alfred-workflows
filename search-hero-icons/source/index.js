let Fuse = require('fuse.js')
let yargs = require('yargs')
let query = yargs.argv._[0]
let color = yargs.argv._[1]
let sharp = require('sharp')
let fs = require('fs')
let icons = require('./icons')
let {isEmpty} = require('lodash')

const options = {
  includeScore: true,
  keys: ['name'],
}

let go = async () => {
  const fuse = new Fuse(icons, options)
  const result = fuse.search(query)

  let items = await Promise.all(
    result.map(async ({item}) => {
      let iconPath = './iconCache/' + item.name + '.png'
      try {
        if (!fs.existsSync(iconPath)) {
          await sharp(
            Buffer.from(
              item.content
                .replace('width="24" height="24"', 'width="100" height="100"')
                .replace('width="20" height="20"', 'width="80" height="80" ')
                .replace(/#4A5568/g, '#fff')
                .replace(/#4B5563/g, '#fff')
            )
          )
            .png()
            .toFile(iconPath)
        }
      } catch {
        iconPath = ''
      }

      let title = item.name.includes('md-')
        ? item.name.replace('md-', '')
        : item.name.replace('sm-', '') + ' (small)'
      return {
        title: title,
        arg: item.content,
        icon: {
          path: iconPath ? iconPath : '',
        },
      }
    })
  )

  console.log(JSON.stringify({items}))
}

go()
