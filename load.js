// Loads extracted information to the file system.

const _ = require('lodash');
const fs = require('fs');

// ensures a directory exists. Screw it, it's not in the "SDK".
function make_path(path) {
    // TODO: will only work on *n*x machine
    const absolute = path.substring(0, 1) === '/' ? '/' : '';
    _.reduce(path.split('/'), (a, v) => {
        const next = a ? `${a}/${v}` : `${absolute}${v}`;
        if (fs.existsSync(next) === false) {
            fs.mkdirSync(next);
        }
        return next;
    });
}

function load(docs) {
    return {
        /// input is path of the LogicalDoc `data` folder.
        from: input => {
            return {
                to: output => {
                    _.forEach(docs, d => {
                        const infile = `${input}/${d.id}/doc/${d.version}`;
                        const outpath = `${output}/${d.path}`;
                        const outfile = `${outpath}/${d.filename}`;
                        console.log(`${infile} to ${outfile}`);
                        make_path(outpath);
                        try {
                            fs.copyFileSync(infile, outfile);
                        } catch (err) {
                            console.log(err);
                        }
                        // TODO: maybe you'd want to save some metadata.
                        // An ext4 FileSystem is not the best place for this...
                    });
                }
            }
        }
    };
}

module.exports = load;  