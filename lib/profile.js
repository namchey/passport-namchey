/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = (json) => {

  if ('string' == typeof json) {
    json = JSON.parse(json);
  }

  var profile = {};
  profile.id = json.id;
  profile.username = json.username;
  profile.displayName = json.displayName;
  profile.name = json.displayName;

  //profile.gender = json.gender;
  profile.profileUrl = json.link;
  profile.photos = [{value: json.imgPath.thumbnail}];

  if (json.email) {
    profile.emails = [{ value: json.email }];
  }

  return profile;
};
