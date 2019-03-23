/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = (body) => {
  let json = body;
  if ('string' == typeof body) {
    try {
      json = JSON.parse(body);
    } catch (e) {
      console.log(e);
    }
  }
  json = json.user;
  var profile = {};
  profile.id = json._id;
  profile.username = json.username;
  profile.displayName = json.displayName;
  profile.name = json.displayName;

  //profile.gender = json.gender;
  profile.profileUrl = json.link;
  if(json.imgPath) {
    profile.photos = [{value: json.imgPath.thumbnail}];
  }

  if (json.email) {
    profile.emails = [{ value: json.email }];
  }

  return profile;
};
