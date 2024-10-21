const sql = require('mssql');
const { rConfig } = require('./rConfig');

const rDbConfig = JSON.parse(rConfig);

// Configuration for the connection pool
const poolConfig = {
  user: rDbConfig.db_uid,
  password: rDbConfig.db_pwd,
  database: rDbConfig.db_db,
  server: rDbConfig.db_server,
  options: {
    encrypt: false,
    trustServerCertificate: false,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
    },
  },
};

// Create a pool and export it for use in other modules
const poolPromise = sql.connect(poolConfig);

/**
 * Executes a stored procedure with the specified parameters.
 *
 * @param {string} storedProcedure - The name of the stored procedure to execute.
 * @param {object} parameters - An object containing the parameters for the stored procedure.
 * @returns {Promise<object>} - The result of the stored procedure execution, including recordset and output parameters.
 */
const executeStoredProcedure = async (storedProcedure, parameters) => {
  const pool = await poolPromise;
  const request = pool.request();

  if (parameters) {
    Object.keys(parameters).forEach((key) => {
      if (parameters[key] && parameters[key].output) {
        request.output(key, parameters[key].type);
      } else {
        request.input(key, parameters[key]);
      }
    });
  }

  const result = await request.execute(storedProcedure);
  const outputParameters = {};

  Object.keys(parameters).forEach((key) => {
    if (parameters[key] && parameters[key].output) {
      outputParameters[key] = result.output[key];
    }
  });

  return { recordset: result.recordset, output: outputParameters };
};

/**
 * Executes a select statement and returns the first value from the result.
 *
 * @param {string} selectQuery - The SQL query to execute.
 * @returns {Promise<any>} - The first value of the result set from the query execution.
 */
const executeSelectStatement = async (selectQuery) => {
  const pool = await poolPromise;
  const request = pool.request();

  const result = await request.query(selectQuery);
  const row = result.recordset[0];
  const value = Object.values(row);

  return value[0];
};

module.exports = {
  execSP: executeStoredProcedure,
  execSel: executeSelectStatement,
};
