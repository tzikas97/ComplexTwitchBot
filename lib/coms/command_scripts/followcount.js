// Possible messages for this command.
const messages = {
		// The user was found and has the appropriate data.
		worked: '%name%, %cName% has %count% follower%s%.',
		// The user was not found in the Twitch API.
		notFound: '%name%, user not found.'
	};

// Export a function that returns a function. The first function is called when
// all of the commands are loaded. It's passed an object that compiles a bunch
// of commonly used used modules, etc. See the /lib/coms/common.js file. In this
// case, deconstruct the twitchAPI and utils modules.
module.exports = ({ tAPI, u }) => function({ channel, params, perms }) {
	// Default to the channel object and in a resolved Promise.
	let prom = Promise.resolve(channel);
	// If there is at least 1 parameter and the user attempting the command is
	// "modUp" then they can change the checking channel.
	if(params.use) {
		// Change prom to this Twitch API function using the first parameter.
		prom = tAPI.userByName(params[0])
			// If the user isn't found, the function will resolve to `null` and
			// this utility function will `throw` to skip to the catch.
			.then(u.throwOnNull);
	}
	// Return the Promise ASAP.
	return prom
	// Once the Promise is resolved, we can operate on the checking channel.
	.then(check =>
		// We need the `check` variable in scope.
		// Pass the id of the checking channel to the Twitch API followers
		// function.
		tAPI.followers(check._id)
		// Once that returns, deconstruct the response object "res" and the
		// _total, _cursor, and follows from the body. `_total` is the total
		// amount of followers, `_cursor` is the offset of the paging
		// represented as a timestamp, and `follows` is the list of followers
		// for the checking channel.
		.then(({ res, body: { _total, _cursor, follows } }) => {
			// Check to make sure that the status code is 200 and if not, throw
			// null to skip to the catch.
			if(res.statusCode !== 200) {
				throw null;
			}
			// Get the response message.
			let msg = messages.worked,
				// The context object for the response message.
				context = {
					// The display-able name for the checking channel.
					cName: check.name,
					// The follow count for the checking channel.
					count: _total,
					// If the follow count is not 1, this is "s" -- otherwise ""
					s: u.s(_total)
				};
			// Return the Promise that comes from `this.reply`.
			return this.reply(msg, context);
		})
	)
	// Catch anything that was thrown during the time that the command has been
	// running.
	.catch(err => {
		// Channel doesn't exist, is inaccessible, or something else.
		if(err === null) {
			return this.reply(messages.notFound);
		}
	});
};
