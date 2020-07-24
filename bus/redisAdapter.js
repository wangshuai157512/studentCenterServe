const redis = require("redis");

const RDS_PORT = 6379;
const RDS_HOST = '127.0.0.1';
const RDS_PWD = 'tiany';
const RDS_OPTS = {auth_pass:RDS_PWD};
// var client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);

const client = redis.createClient(RDS_PORT,RDS_HOST);

const get = function(key) {
	return new Promise(function(resolve, reject) {
		client.get(key, function(error, result) {
			if (error) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	})
};

const set = function(key, value, time) {
	return new Promise(function(resolve, reject) {
		client.set(key, value, function(error, result) {
			if (error) {
				reject(err);
			} else {
				if (time) {
					client.expire(key, time);
				}
				resolve(result);
			}
		})
	})
};

module.exports = {
	get: get,
	set: set,
}
