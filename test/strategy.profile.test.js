/* global describe, it, before, expect */
/* jshint expr: true */

var NamcheyStrategy = require('../lib/strategy');


describe('Strategy#userProfile', function() {

  describe('fetched from default endpoint', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://namchey.com/api/v1/users/me') { return callback(new Error('incorrect url argument')); }
      if (accessToken != 'token') { return callback(new Error('incorrect token argument')); }

      var body = `
      {
          "user": {
              "_id": "58da23f479e0de480b7a0d76",
              "email": "bring2dip@gmail.com",
              "username": "bring2dip",
              "displayName": "Deepak Bhattarai",
              "description": "",
              "phone": "90192309123123",
              "bio": "Yes we can.",
              "isPhoneVerified": false,
              "receiveWeeklyEmailNewsLetter": true,
              "receiveEmailNotification": true,
              "isEmailVerified": false,
              "receiveNotification": true,
              "imgPath": {
                  "thumbnail": "https://storage.googleapis.com/namchey-test-img-store/user/5b73bb823e80bc33cde31a4a/user-5b73bb823e80bc33cde31a4a-1550729960003-thm.jpeg"
              },
              "name": "Deepak Bhattarai",
              "id": "58da23f479e0de480b7a0d76"
          }
      }
      `;
      callback(null, body, undefined);
    };


    var profile;

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.provider).to.equal('namchey');

      expect(profile.id).to.equal('58da23f479e0de480b7a0d76');
      expect(profile.username).to.equal('bring2dip');
      expect(profile.displayName).to.equal('Deepak Bhattarai');
      //expect(profile.gender).to.equal('male');
      //expect(profile.profileUrl).to.equal('http://www.namchey.com/users/bring2dip');
      expect(profile.emails).to.have.length(1);
      expect(profile.emails[0].value).to.equal('bring2dip@gmail.com');
      expect(profile.photos).to.have.length(1);
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint



  describe('error caused by invalid token', function() {
    var strategy =  new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"error":{"message":"Invalid OAuth access token.","type":"OAuthException","code":190}}';

      callback({ statusCode: 400, data: body });
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('NamcheyAPIError');
      expect(err.message).to.equal('Invalid OAuth access token.');
      expect(err.type).to.equal('OAuthException');
      expect(err.code).to.equal(190);
      expect(err.subcode).to.be.undefined;
    });
  }); // error caused by invalid token

  describe('error caused by malformed response', function() {
    var strategy =  new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };


    var err, profile;

    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  }); // error caused by malformed response

  describe('internal error', function() {
    var strategy = new NamcheyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    }


    var err, profile;

    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error

});
