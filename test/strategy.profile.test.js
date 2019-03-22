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

      var body = '{"id":"58da23f479e0de480b7a0d76","updatedAt":"2019-01-01T13:26:34.249Z","createdAt":"2017-03-28T08:51:00.364Z","displayName":"Deepak Bhattarai","username":"bring2dip","bio":"Yes we can.","description":"","imgPath":{"small":"https://storage.googleapis.com/namchey-gcs-asia-east/user-58da23f479e0de480b7a0d76-1512317862383-thm.jpg","medium":"https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/15590458_10202829132205922_5793841691671087094_n.jpg?oh=7b46959846bb932ab5681c64c9a939e9&oe=5A967D52","large":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-1600w.jpeg","thumbnail":"https://storage.googleapis.com/namchey-gcs-asia-east/user-58da23f479e0de480b7a0d76-1512317862383-thm.jpg","1080w":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-1080w.jpeg","480w":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-480w.jpeg","640w":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-640w.jpeg","750w":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-750w.jpeg","featured":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-1600w.jpeg","thm":"https://storage.googleapis.com/namchey-gcs-asia-east/user/58da23f479e0de480b7a0d76/user-58da23f479e0de480b7a0d76-1546323676958-thm.jpeg"},"isPhonePublic":false,"isEmailPublic":false,"isPublic":true,"socialLinks":{"namchey":"https://namchey.com/bring2dip","twitter":"https://twitter.com/bring2dip","youtube":"https://youtube.com/deepakbhattarai","instagram":"https://instagram.com/bring2dip","other":""},"slug":"bring2dip","name":"Deepak Bhattarai"}';
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
      expect(profile.gender).to.equal('male');
      expect(profile.profileUrl).to.equal('http://www.namchey.com/users/bring2dip');
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
