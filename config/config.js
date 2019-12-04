const path = require('path')
module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.join('database.sqlite')
  }
}
