const path = require('path');

const isonline = (process.env.ISONLINE == 'true' ? true : false);

// Update with your config settings.
if(isonline) { // we are in the online system, so connect to that!
    module.exports = {
        development: {
            client: 'mssql',
            connection: {
                server : 'skatecanadacss.database.windows.net',
                user : 'cssadmin',
                password : 'Ganymede@skatecanadacss',
                database : 'css',
                options: {
                    port: 1433,
                    encrypt: true,
                    enableArithAbort: true,
                    requestTimeout: 350000
                }
            },
            pool: {
                min: 0,
                max: 50,
            },
        }
    };
}
else { // we are in the offline desktop system, so connect to that!
    
    const userlocation = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    const CSSAppDir = userlocation+'/CSS Application/db';

    const localdbpath = path.join(CSSAppDir, '../db/css21.sqlite3'); // for local checks
    
    module.exports = {
        development: {
            client: 'sqlite3',
            connection: {
                filename: localdbpath
            },
            useNullAsDefault: true,
            pool: {
                min: 0,
                max: 1
            },
            migrations: {
                directory: './data/migrations'
            }
        }
    };
}
