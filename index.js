const extract = require('./extract');
const load = require('./load');
const fs = require('fs');

// Configuration section
// ---------------------

// This is where I have extracted my LogicalDoc archive.
// This file is usually LogicalDoc's "INSTALL_DIR/repository/docs"
const input = '/home/arnaud/doc-resto/data';
// This is where I want to rebuild a FileSystem tree from the files
const output = '/home/arnaud/doc-resto/restored';
// optional : save metadata to some file
const metadata = 'logicaldoc.json';
// You have to access the Database.
// If you don't have a "live" system, hopefully you have a backup to restore.
// If you ask LogicalDoc a backup, it generates a `database` file and stores it in `database.tar.gz`
// Restoring on a new system is as "simple" as creating a new mysql/mariadb database
// granting a user access to it, then just use the database
// and `source` the `database` file.
const pool_config = {
  database: 'logicaldoc',
  host: 'localhost',
  user: 'logical',
  password: 'logical',
  charset: 'latin1', // I was on a French Windows System at times.
  connectionLimit: 5
};

// ---------------------

// Calls extract then load into FileSystem.
extract(pool_config).then(docs => {
  if (metadata){
    fs.writeFileSync(metadata,JSON.stringify(docs, null, 4));
  }
  load(docs).from(input).to(output);
}).then(() => {
  process.exit(0);
}
).catch(whatever => {
  console.error(whatever);
  console.error('Finished with error.');
  process.exit(1);
});
