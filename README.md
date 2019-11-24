[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![License: APACHE](https://img.shields.io/badge/license-APACHE-blue.svg)](LICENSE)

# About

This application extracts files from a LogicalDoc Content Management System
and stores them to the FileSystem, according in respect with the folder hierarchy.

It only extracts data and metadata from FileSystem and MariaDB/MySQL Database.
It retrieves the document (its last version only), its user fields, its notes;
other information is discarded.
At not time it will require the original software to be up and running.

DISCLAIMER: this software is a hobby tool which I made to revive an old
personal backup that was burried in my computer.
It is not meant for a professional use.
I am not affiliate by any mean to the logicaldoc.com company.

## Software

It was tested with the following software:

* node v12.12.0
* Debian 10.2 running MariaDB 10.3.18
* a LogicalDoc (circa 2012) backup - I really don't know how it evolved since.

# Usage
 
## Installation

Just clone it and run:

```
npm install
```

## Setup

### Case 1: you have a "live" system.

This is straightforward, you'll have to set where `INSTALL_DIR` is the root of your installation:

* `input` is `INSTALL_DIR/repository/docs`
* `output` is anywhere you like
* `pool_config` settings can be found in `INSTALL_DIR/conf/context.properties`
  * `host`, `port` and `database` can be extracted from `jdbc.url`
  * `user` is same as `jdbc.username`
  * `password` is same as `jdbc.password`

### Case 2: you have a backup

In my case I just had a backup, so three things are necessary:

* Extract the backup (by default located in `INSTALL_DIR/backup`) to somewhere 
* Extract the `store.1.tar.gz` file to some path, that will be the `input` path.
* Extract the `database.tar.gz` file and create a new database with it.

Example (on Debian, as root)

```
apt-get install mariadb-server
mariadb
create database logicaldoc ;
use logicaldoc;
source database ;
GRANT USAGE ON logical.* TO 'logical'@'%' identified by 'logical' ;
flush privileges;
```

## Running

Edit `index.js` to provide your own settings (you will also find hints in the source code), then:

```
node .
```

## License

This tool is licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
   http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or
   http://opensource.org/licenses/MIT)

at your option.
