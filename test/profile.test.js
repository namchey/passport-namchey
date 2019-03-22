/* global describe, it, before, expect */
/* jshint expr: true */

var Profile = require('../lib/profile')
  , fs = require('fs')


describe('Profile.parse', function() {

  describe('profile with picture attribute in orginal format', function() {
    var profile;

    before(function(done) {
      fs.readFile('test/fixtures/picture.json', 'utf8', function(err, data) {
        if (err) { return done(err); }
        profile = Profile.parse(data);
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.photos).to.have.length(1);
      expect(profile.photos[0].value).to.equal('https://storage.googleapis.com/namchey-gcs-asia-east/user/57c566a4f3158f51474a3a9b/user-57c566a4f3158f51474a3a9b-1548310297607-thm.jpeg');
      expect(profile.emails).to.be.undefined;
    });
  });

});
