// Extracts LogicalDoc from database

const mariadb = require('mariadb');
const _ = require('lodash');

// Lists all notes
async function notes(conn) {
    return await conn.query("SELECT * from ld_note");
}

// Lists all metadata
async function extensions(conn) {
    const ext = await conn.query("SELECT * from ld_document_ext");
    const indexed = {};
    _.forEach(ext, e => {
        const meta = _.get(indexed, e.ld_docid, {});
        let val;
        switch (e.ld_type) {
            case 0:
                val = e.ld_stringvalue;
                break;
            case 1:
                val = e.ld_intvalue;
                break;
            case 2:
                val = e.ld_doublevalue;
                break;
            case 3:
                val = e.ld_datevalue;
                break;
            default:
                val = undefined;
        }
        meta[e.ld_name] = val;
        _.set(indexed, e.ld_docid, meta);
    });
    return indexed;
}

// Lists all documents, retain only the "useful" (to me!) attributes.
async function documents(conn, folders, notes, extensions) {
    const result = await conn.query("SELECT * from ld_document");
    const docs = {};
    _.forEach(result, d => {
        docs[d.ld_id] = {
            id: d.ld_id,
            version: d.ld_fileversion,
            title: d.ld_title,
            path: folders[d.ld_folderid].path,
            filename: d.ld_filename
        }
        const n = _.map(_.filter(notes, x => x.ld_docid == d.ld_id), x => x.ld_message);
        const meta = extensions[d.ld_id];
        if (n.length > 0) {
            docs[d.ld_id].notes = n;
        }
        if (meta) {
            docs[d.ld_id].meta = meta;
        }
    });
    return docs;
}

// Lists all folders, indexes them and computes their full path name.
async function folders(conn) {
    const folders = {};
    const result = await conn.query("SELECT * from ld_folder");
    _.forEach(result, f => folders[f['ld_id']] = f);
    const path = id => {
        const f = folders[id];
        const selfname = friendly(f.ld_name);
        // 5 is the special '/' default foler
        if (f.ld_parentid && f.ld_parentid != id && f.ld_parentid != 5) {
            return path(f.ld_parentid) + '/' + selfname;
        } else {
            return selfname;
        }
    }
    const indexed = {};
    _.forEach(folders, f => indexed[f.ld_id] = {
        id: f.ld_id,
        path: path(f.ld_id),
        data: f
    });
    return indexed;
}

// gives a FileSystem-friendly name to a folder.
function friendly(s) {
    // it's note complete, this was good enough for me.
    const dict = {
        '\u00A0': 'remove',
        ' ': '_',
        'à': 'a',
        'á': 'a',
        'ç': 'c',
        'é': 'e',
        'è': 'e',
        '(': 'remove',
        ')': 'remove',
        '?': 'remove',
        ':': 'remove',
        '*': 'remove',
        ',': 'remove'
    };
    return s.toLowerCase().replace(/./g, function (char) {
        const e = dict[char];
        if (e === 'remove') {
            return '';
        } else {
            return e || char;
        }
    });
}

async function extract(pool_config) {
    const pool = mariadb.createPool(pool_config);
    let conn;
    try {
        conn = await pool.getConnection();
        // TODO: queries could be parallelized.
        return await documents(conn, await folders(conn), await notes(conn), await extensions(conn));
    } finally {
        if (conn) conn.end();
    }
}

module.exports = extract;