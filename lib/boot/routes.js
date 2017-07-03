const config = require('lib/config')

require('lib/system/boot/routes')(config.multiForum)
require('lib/admin/boot/routes')(config.multiForum)
require('lib/settings/boot/routes')(config.multiForum)
require('lib/site/boot/routes')(config.multiForum)
