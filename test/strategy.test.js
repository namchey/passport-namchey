/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , NamcheyStrategy = require('../lib/strategy');


describe('Strategy', function() {

  describe('constructed', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

    it('should be named namchey', function() {
      expect(strategy.name).to.equal('namchey');
    });
  })

  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new NamcheyStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  })

  describe('authorization request with display parameter', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ display: 'mobile' });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.namchey.com/v1/oauth2/dialog?display=mobile&response_type=code&client_id=ABC123');
    });
  });

  describe('authorization request with reauthorization parameters', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ authType: 'reauthenticate', authNonce: 'foo123' });
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://www.namchey.com/v1/oauth2/dialog?auth_type=reauthenticate&auth_nonce=foo123&response_type=code&client_id=ABC123');
    });
  });

  describe('failure caused by user denying request', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var info;

    before(function(done) {
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.error = 'access_denied';
          req.query.error_code = '200';
          req.query.error_description  = 'Permissions error';
          req.query.error_reason = 'user_denied';
        })
        .authenticate();
    });

    it('should fail with info', function() {
      expect(info).to.not.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });

  describe('error caused by app being in sandbox mode', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});


    var err;

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.error_code = '901';
          req.query.error_message = 'This app is in sandbox mode.  Edit the app configuration at http://namchey.com/developers/clients to make the app publicly visible.';
        })
        .authenticate();
    });

    it('should error', function() {
      expect(err.constructor.name).to.equal('NamcheyAuthorizationError');
      expect(err.message).to.equal('This app is in sandbox mode.  Edit the app configuration at http://namchey.com/developers/clients to make the app publicly visible.');
      expect(err.code).to.equal(901);
      expect(err.status).to.equal(500);
    });
  });

  describe('error caused by invalid code sent to token endpoint (note: error format does not conform to OAuth 2.0 specification)', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
      return callback({ statusCode: 400, data: '{"error":{"message":"Invalid verification code format.","type":"OAuthException","code":100}' });
    };


    var err;

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should error', function() {
      expect(err.constructor.name).to.equal('InternalOAuthError');
      /* TODO fix this
      expect(err.message).to.equal('Invalid verification code format.');
      expect(err.type).to.equal('OAuthException');
      expect(err.code).to.equal(100);
      expect(err.subcode).to.be.undefined;
      expect(err.traceID).to.equal('XXxx0XXXxx0');
      */
    });
  }); // error caused by invalid code sent to token endpoint

  describe('error caused by invalid code sent to token endpoint (note: error format conforms to OAuth 2.0 specification, though this is not the current behavior of the Namchey implementation)', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    // inject a "mock" oauth2 instance
    strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
      return callback({ statusCode: 400, data: '{"error":"invalid_grant","error_description":"The provided value for the input parameter \'code\' is not valid."} '});
    };


    var err;

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should error', function() {
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal('The provided value for the input parameter \'code\' is not valid.');
      expect(err.code).to.equal('invalid_grant');
    });
  }); // error caused by invalid code sent to token endpoint

});
