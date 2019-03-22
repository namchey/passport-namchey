/**
 * `NamcheyAPIError` error.
 *
 * @constructor
 * @param {string} [message]
 * @param {string} [type]
 * @param {number} [code]
 * @param {number} [subcode]
 * @param {string} [traceID]
 * @access public
 */
function NamcheyAPIError(message, type, code, subcode, traceID) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NamcheyAPIError';
  this.message = message;
  this.type = type;
  this.code = code;
  this.subcode = subcode;
  this.traceID = traceID;
  this.status = 500;
}

// Inherit from `Error`.
NamcheyAPIError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = NamcheyAPIError;
