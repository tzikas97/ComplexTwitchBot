// Load the ab-request library. This library is similar to the normal request
// library, which it uses internally, but now it returns Promises.
const request = require('ab-request'),
	
	// Require the configuration file.
	config = require('../config'),
	
	// Make a request detaults function using Twitch Kraken API related data.
	kraken = request.defaults({
		// The base headers to use.
		headers: {
			// The Twitch Kraken API Client ID.
			'Client-ID': config.twitch.api.clientID,
			// The Twitch Kraken API version to use.
			Accept: 'application/vnd.twitchtv.v5+json'
		},
		// The Twitch Kraken API base URL.
		baseUrl: 'https://api.twitch.tv/kraken/',
		// Automatically parse the JSON that it returns.
		json: true
	});

// Get a user object from a username.
function getUserByName(login = '') {
	// Use the Twitch Kraken API defaults.
	return kraken({
		// The "users" endpoint of the Twitch API
		url: 'users',
		// Put the passed login into the querystring.
		qs: { login }
	})
	// Destructure the returned data.
	.then(({ req, body: { _total, users: [ user ] } }) => {
		// If the total is 1 or more.
		if(_total) {
			// Return the first user object.
			return user;
		}
		// Didn't find a user from the username, return null.
		return null;
	});
}

// Get a user object from a user ID.
function getUser(id = '') {
	// Use the Twitch Kraken API defaults.
	return kraken({
		// The "users/#####" endpoint.
		url: `users/${id}`
	});
}

// Get a channel's follow list from a user ID. Can pass a limit on the amount of
// data to return and an offset to offset the data. The offset could also be a
// string to represent a cursor.
function followers(channelID = '', limit = 20, offset = 0, dir = 'desc') {
	// Building the querystring.
	let qs = { limit, direction: dir };
	// If the offset is a string, it's the cursor instead.
	if(typeof offset === 'string') {
		qs.cursor = offset;
	}
	else {
		// Otherwise, it's just the offset.
		qs.offset = offset;
	}
	// Use the Twitch Kraken API defaults.
	return kraken({
		// The "channels/#####/follows" endpoints.
		url: `channels/${channelID}/follows`,
		// Put the formed qs from the arguments passed in.
		qs
	});
}

// Export the functions
module.exports = {
	followers,
	getUser,
	getUserByName
};