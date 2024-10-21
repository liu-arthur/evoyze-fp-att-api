const joi = require("joi");

/**
 * Joi schema for validating device log data.
 * @typedef {Object} DeviceLogSchema
 * @property {string} dev_group - The device group identifier.
 * @property {string} dev_passcode - The passcode for the device group.
 * @property {string} dev_id - The identifier for the device.
 * @property {string} ip_addr - The IPv4 address associated with the device.
 * @property {Array.<Object>} dev_log - An array of device log entries.
 * @property {string} dev_log[].dev_user_id - The user ID associated with the log entry.
 * @property {string} dev_log[].clock_on - The timestamp of the log entry in `YYYYMMDD HH:MM:SS` format.
 * @property {string} dev_log[].state - The state of the log entry, either "CI" (Clock In) or "CO" (Clock Out).
 */

/**
 * Joi schema for validating a device log request.
 * @type {Joi.ObjectSchema<DeviceLogSchema>}
 */
const vDeviceLog = joi.object({
  dev_group: joi.string().required(),
  dev_passcode: joi.string().required(),
  dev_id: joi.string().required(),
  ip_addr: joi.string().ip({ version: "ipv4" }).required(),
  dev_log: joi
    .array()
    .items(
      joi.object({
        dev_user_id: joi.string().required(),
        clock_on: joi
          .string()
          .pattern(/^\d{8} \d{2}:\d{2}:\d{2}$/)
          .required(),
        state: joi.string().valid("CI", "CO").required(),
      })
    )
    .required(),
});

/**
 * Joi schema for validating device-related data.
 * @typedef {Object} DeviceSchema
 * @property {string} dev_group - The device group identifier.
 * @property {string} dev_passcode - The passcode for the device group.
 * @property {string} dev_id - The identifier for the device.
 * @property {string} ip_addr - The IPv4 address associated with the device.
 */

/**
 * Joi schema for validating a device request.
 * @type {Joi.ObjectSchema<DeviceSchema>}
 */
const vDevice = joi.object({
  dev_group: joi.string().required(),
  dev_passcode: joi.string().required(),
  dev_id: joi.string().required(),
  ip_addr: joi.string().ip({ version: "ipv4" }).required(),
  dev_log: joi.array().optional(),
});

module.exports = {
  vDevice,
  vDeviceLog,
};
