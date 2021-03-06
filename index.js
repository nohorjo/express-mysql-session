'use strict';

var _ = require('underscore');
var mysql = require('mysql');
var path = require('path');
var util = require('util');
var fs = require('fs');

var debug = {
    log: require('debug')('express-mysql-session:log'),
    error: require('debug')('express-mysql-session:error')
};

var deprecate = require('depd')('express-mysql-session');

module.exports = function(session) {

    var constructorArgs;

    if (_.isUndefined(session.Store)) {
        session = require('express-session');
        constructorArgs = Array.prototype.slice.call(arguments);
    }

    var Store = session.Store;

    var MySQLStore = function(options, connection, cb) {

        debug.log('Creating session store');

        if (_.isFunction(connection)) {
            cb = connection;
            connection = null;
        }

        var defaultOptions = {
            // How frequently expired sessions will be cleared; milliseconds:
            checkExpirationInterval: 900000,
            // The maximum age of a valid session; milliseconds:
            expiration: 86400000,
            // Whether or not to create the sessions database table, if one does not already exist:
            createDatabaseTable: true,
            // Number of connections when creating a connection pool:
            connectionLimit: 1,
            // Whether or not to end the database connection when the store is closed:
            endConnectionOnClose: !connection,
            charset: 'utf8mb4_bin',
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            },
            cacheLocation: "sessions"
        };

        this.options = _.defaults(options || {}, defaultOptions);
        this.options.schema = _.defaults(this.options.schema, defaultOptions.schema);
        this.options.schema.columnNames = _.defaults(this.options.schema.columnNames, defaultOptions.schema.columnNames);

        this.options.cacheLocation = path.join(__dirname, '..', '..', this.options.cacheLocation);
        if (!fs.existsSync(this.options.cacheLocation)){
            fs.mkdirSync(this.options.cacheLocation);
        }

        if (this.options.debug) {
            deprecate('The \'debug\' option has been removed. This module now uses the debug module to output logs and error messages. Run your app with `DEBUG=express-mysql-session* node your-app.js` to have all logs and errors outputted to the console.');
        }

        this.connection = connection || mysql.createPool(this.options);

        var done = function() {

            this.setExpirationInterval();

            if (cb) {
                cb.apply(undefined, arguments);
            }

        }.bind(this);

        if (this.options.createDatabaseTable) {
            this.createDatabaseTable(done);
        } else {
            _.defer(done);
        }
        this.timers = path.join(this.options.cacheLocation, 'timers');
        fs.writeFileSync(this.timers, '{}');
};

    util.inherits(MySQLStore, Store);

    MySQLStore.prototype.createDatabaseTable = function(cb) {

        debug.log('Creating sessions database table');

        var schemaFilePath = path.join(__dirname, 'schema.sql');

        fs.readFile(schemaFilePath, 'utf-8', function(error, sql) {

            if (error) {
                debug.error('Failed to read schema file.');
                return cb && cb(error);
            }

            sql = sql.replace(/`[^`]+`/g, '??');

            var params = [
                this.options.schema.tableName,
                this.options.schema.columnNames.session_id,
                this.options.schema.columnNames.expires,
                this.options.schema.columnNames.data,
                this.options.schema.columnNames.session_id
            ];

            this.query(sql, params, function(error) {

                if (error) {
                    debug.error('Failed to create sessions database table.');
                    debug.error(error);
                    return cb && cb(error);
                }

                if(cb) cb();
            });

        }.bind(this));
    };

    MySQLStore.prototype.get = function(session_id, cb) {

        debug.log('Getting session:', session_id);
        
        const sessFile = path.join(this.options.cacheLocation, session_id);

        fs.access(sessFile, fs.constants.F_OK, err => {
            if (err) {
                debug.log('Reading session from db');
                var sql = 'SELECT ?? AS data FROM ?? WHERE ?? = ? LIMIT 1';

                var params = [
                    this.options.schema.columnNames.data,
                    this.options.schema.tableName,
                    this.options.schema.columnNames.session_id,
                    session_id
                ];

                this.query(sql, params, function(error, rows) {

                    if (error) {
                        debug.error('Failed to get session:', session_id);
                        debug.error(error);
                        return cb(error, null);
                    }

                    var session;
                    try {
                         session = rows[0] ? JSON.parse(rows[0].data) : null;
                    } catch (error) {
                        debug.error(error);
                        return cb(new Error('Failed to parse data for session:', session_id));
                    }
                    fs.writeFileSync(sessFile, JSON.stringify(session));

                    cb(null, session);
                });
            } else {
                debug.log('Reading session from file');
                fs.readFile(sessFile, 'utf8', (error, data) => {
                    if (error) { 
                        debug.error(error);
                        return cb(new Error('Failed to parse data for session:', session_id));
                    }
                        try {
                            cb(null, JSON.parse(data));
                        } catch (e) {
                            debug.error(e);
                            fs.unlink(sessFile, err => {
                                if (err) debug.error(err);
                                this.get(session_id, cb); // retry 
                            });
                        }
                });
            }
        });
    };

    MySQLStore.prototype.set = function(session_id, data, cb) {

        debug.log('Setting session:', session_id);

        var expires;

        if (data.cookie) {
            if (data.cookie.expires) {
                expires = data.cookie.expires;
            } else if (data.cookie._expires) {
                expires = data.cookie._expires;
            }
        }

        if (!expires) {
            expires = Date.now() + this.options.expiration;
        }

        if (!(expires instanceof Date)) {
            expires = new Date(expires);
        }

        // Use whole seconds here; not milliseconds.
        expires = Math.round(expires.getTime() / 1000);

        data = JSON.stringify(data);

        this.debounce(`set:${session_id}`, () => {
            var sql = 'INSERT INTO ?? (??, ??, ??) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ?? = VALUES(??), ?? = VALUES(??)';

            var params = [
                this.options.schema.tableName,
                this.options.schema.columnNames.session_id,
                this.options.schema.columnNames.expires,
                this.options.schema.columnNames.data,
                session_id,
                expires,
                data,
                this.options.schema.columnNames.expires,
                this.options.schema.columnNames.expires,
                this.options.schema.columnNames.data,
                this.options.schema.columnNames.data
            ];

            this.query(sql, params, function(error) {
                debug.log('Writing session to db');
                if (error) {
                    debug.error('Failed to insert session data.');
                    debug.error(error);
                    //return cb && cb(error);
                }

                //if(cb) cb();
            });
        });

        const sessFile = path.join(this.options.cacheLocation, session_id);
        
        fs.writeFile(sessFile, data, error => {
            if (error) {
                debug.error('Failed to insert session data.');
                debug.error(error);
                return cb && cb(error);
            }

            if(cb) cb();
        });

    };

    MySQLStore.prototype.touch = function(session_id, data, cb) {

        debug.log('Touching session:', session_id);

        var expires;

        if (data.cookie) {
            if (data.cookie.expires) {
                expires = data.cookie.expires;
            } else if (data.cookie._expires) {
                expires = data.cookie._expires;
            }
        }

        if (!expires) {
            expires = Date.now() + this.options.expiration;
        }

        if (!(expires instanceof Date)) {
            expires = new Date(expires);
        }

        data.cookie.expires = expires;

        const sessFile = path.join(this.options.cacheLocation, session_id);
        fs.writeFile(sessFile, JSON.stringify(data), error => {
            if (error) {
                debug.error('Failed to touch session data.');
                debug.error(error);
                return cb && cb(error);
            }

            if(cb) cb();
        });
        
        this.debounce(`touch:${session_id}`, () => {
            debug.log('Touching db session');
            // Use whole seconds here; not milliseconds.
            expires = Math.round(expires.getTime() / 1000);

            var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ? LIMIT 1';

            var params = [
                this.options.schema.tableName,
                this.options.schema.columnNames.expires,
                expires,
                this.options.schema.columnNames.session_id,
                session_id
            ];

            this.query(sql, params, function(error) {

                if (error) {
                    debug.error('Failed to touch session:', session_id);
                    debug.error(error);
                    //return cb && cb(error);
                }

                //return cb && cb();
            });
        });
    };

    MySQLStore.prototype.destroy = function(session_id, cb) {

        debug.log('Destroying session:', session_id);

        const sessFile = path.join(this.options.cacheLocation, session_id);
        fs.unlink(sessFile, error => {
            if (error) {
                debug.error('Failed to destroy session:', session_id);
                debug.error(error);
                return cb && cb(error);
            }

            if(cb) cb();
        });

        this.debounce(`destoy:${session_id}`, () => {
            debug.log('Deleting db session');
            var sql = 'DELETE FROM ?? WHERE ?? = ? LIMIT 1';

            var params = [
                this.options.schema.tableName,
                this.options.schema.columnNames.session_id,
                session_id
            ];

            this.query(sql, params, function(error) {

                if (error) {
                    debug.error('Failed to destroy session:', session_id);
                    debug.error(error);
                    //return cb && cb(error);
                }

                //if(cb) cb();
            });
        }, true);
    };

    MySQLStore.prototype.length = function(cb) {

        debug.log('Getting number of sessions');

        var sql = 'SELECT COUNT(*) FROM ??';

        var params = [
            this.options.schema.tableName
        ];

        this.query(sql, params, function(error, rows) {

            if (error) {
                debug.error('Failed to get number of sessions.');
                debug.error(error);
                return cb && cb(error);
            }

            var count = rows[0] ? rows[0]['COUNT(*)'] : 0;

            cb(null, count);
        });
    };

    MySQLStore.prototype.all = function(cb) {

        debug.log('Getting all sessions');

        var sql = 'SELECT * FROM ??';

        var params = [
            this.options.schema.tableName
        ];

        this.query(sql, params, function(error, rows) {

            if (error) {
                debug.error('Failed to get all sessions.');
                debug.error(error);
                return cb && cb(error);
            }

            var sessions = _.chain(rows).map(function(row) {
                var data;
                try {
                    data = JSON.parse(row.data);
                } catch (error) {
                    debug.error('Failed to parse data for session: ' + row.session_id);
                    debug.error(error);
                    return null;
                }
                return [row.session_id, data];
            }).compact().object().value();

            if(cb) cb(null, sessions);
        });
    };

    MySQLStore.prototype.clear = function(cb) {

        debug.log('Clearing all sessions');
        
        fs.readdir(this.options.cacheLocation, (error, files) => {
            if (error) {
                debug.error('Failed to clear all sessions.');
                debug.error(error);
                return cb && cb(error);
            }
            
            for (let sess of files) {
                fs.unlink(path.join(this.options.cacheLocation, sess));
            }
            if(cb) cb();
        });
        
        this.debounce(`clear`, () => {
            debug.log('Clearing db sessions');
            var sql = 'DELETE FROM ??';

            var params = [
                this.options.schema.tableName
            ];

            this.query(sql, params, function(error) {

                if (error) {
                    debug.error('Failed to clear all sessions.');
                    debug.error(error);
                    return cb && cb(error);
                }

                if(cb) cb();
            });
        }, true);
    };

    MySQLStore.prototype.clearExpiredSessions = function(cb) {

        debug.log('Clearing expired sessions');

        fs.readdir(this.options.cacheLocation, (error, files) => {
            debug.log('Clearing session files');
            if (error) {
                debug.error('Failed to clear all sessions.');
                debug.error(error);
            }
            
            for (let sess of files) {
                fs.unlink(path.join(this.options.cacheLocation, sess));
            }
        });

        var sql = 'DELETE FROM ?? WHERE ?? < ?';

        var params = [
            this.options.schema.tableName,
            this.options.schema.columnNames.expires,
            Math.round(Date.now() / 1000)
        ];

        this.query(sql, params, function(error) {

            if (error) {
                debug.error('Failed to clear expired sessions.');
                debug.error(error);
                return cb && cb(error);
            }

            if(cb) cb();
        });
    };

    MySQLStore.prototype.query = function(sql, params, cb) {

        var done = _.once(cb);
        var promise = this.connection.query(sql, params, done);

        if (promise && _.isFunction(promise.then) && _.isFunction(promise.catch)) {
            // Probably a promise.
            promise.then(function(result) {
                var rows = result[0];
                var fields = result[1];
                done(null, rows, fields);
            }).catch(function(error) {
                done(error);
            });
        }
    };

    MySQLStore.prototype.setExpirationInterval = function(interval) {

        if(!interval) interval = this.options.checkExpirationInterval;

        debug.log('Setting expiration interval to', interval + 'ms');

        this.clearExpirationInterval();
        this._expirationInterval = setInterval(this.clearExpiredSessions.bind(this), interval);
    };

    MySQLStore.prototype.clearExpirationInterval = function() {

        debug.log('Clearing expiration interval');

        clearInterval(this._expirationInterval);
        this._expirationInterval = null;
    };

    MySQLStore.prototype.close = function(cb) {

        debug.log('Closing session store');

        this.clearExpirationInterval();

        if (this.connection && this.options.endConnectionOnClose) {
            this.connection.end(cb);
        } else {
            if(cb) cb(null);
        }
    };

    MySQLStore.prototype.debounce = function(key, func, ignoreIfInQueue) {
        fs.access(this.timers, fs.constants.F_OK, err => {
            let timers;
            try {
                if (err) {
                    fs.writeFileSync(this.timers, '{}');
                    throw err;
                } else {
                    timers = JSON.parse(fs.readFileSync(this.timers, 'utf8'));
                }
            } catch (e) {
                timers = {};
            }
            if (ignoreIfInQueue && timers[key]) {
                debug.log('Skipping debounce', key);
                return;
            }
            debug.log('Debouncing', key);
            const ourKey = timers[key] = _.random(0, 1e10) + new Date();
            const doDebounce = () => setTimeout(() => {
                try {
                    timers = JSON.parse(fs.readFileSync(this.timers, 'utf8'));
                    if (timers[key] == ourKey) {
                        debug.log('Debounce call', key);
                        func.bind(this)();
                        delete timers[key];
                        fs.writeFileSync(this.timers, JSON.stringify(timers));
                    }
                } catch (e) {
                    doDebounce();
                }
            }, 20000);
            doDebounce();
            fs.writeFileSync(this.timers, JSON.stringify(timers));
        });
    };

    MySQLStore.prototype.closeStore = deprecate.function(
        MySQLStore.prototype.close,
        'The closeStore() method has been deprecated. Use close() instead.'
    );

    MySQLStore.prototype.sync = deprecate.function(
        MySQLStore.prototype.createDatabaseTable,
        'The sync() method has been deprecated. Use createDatabaseTable() instead.'
    );

    MySQLStore.prototype.defaults = deprecate.function(
        function defaults(object, defaultValues, options) {

            object = _.clone(object);

            if (!_.isObject(object)) {
                return object;
            }

            options = options || {};

            _.each(defaultValues, function(value, key) {

                if (_.isUndefined(object[key])) {
                    object[key] = value;
                }

                if (options.recursive) {
                    object[key] = defaults(object[key], value, options);
                }
            });

            return object;
        },
        'The defaults() method has been deprecated and will be removed in a future version.'
    );

    MySQLStore.prototype.clone = deprecate.function(
        _.clone,
        'The clone() method has been deprecated and will be removed in a future version.'
    );

    MySQLStore.prototype.isObject = deprecate.function(
        _.isObject,
        'The isObject() method has been deprecated and will be removed in a future version.'
    );

    MySQLStore.prototype.setDefaultOptions = deprecate.function(
        _.noop,
        'The setDefaultOptions() method has been deprecated and will be removed in a future version.'
    );

    if (constructorArgs) {
        // For backwards compatibility.
        // Immediately call as a constructor.
        return new (MySQLStore.bind.apply(MySQLStore, [undefined/* context */].concat(constructorArgs)))();
    }

    return MySQLStore;
};
