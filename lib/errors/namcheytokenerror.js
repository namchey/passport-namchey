/**
 * `NamcheyTokenError` error.
 *
 * NamcheyTokenError represents an error received from a Namchey's token
 * endpoint.  Note that these responses don't conform to the OAuth 2.0
 * specification.
 * @constructor
 * @param {string} [message]
 * @param {string} [type]
 * @param {number} [code]
 * @param {number} [subcode]
 * @param {string} [traceID]
 * @access public
 */
function NamcheyTokenError(message, type, code, subcode, traceID) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NamcheyTokenError';
  this.message = message;
  this.type = type;
  this.code = code;
  this.subcode = subcode;
  this.traceID = traceID;
  this.status = 500;
}

// Inherit from `Error`.
NamcheyTokenError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = NamcheyTokenError;
