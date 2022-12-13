const redis = require("redis");

// Creates a new Redis client
// If REDIS_HOST is not set, the default host is localhost
// If REDIS_PORT is not set, the default port is 6379
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    legacyMode: true 
});

redisClient.on("error", function(err) {
    console.log("Error " + err);
});

redisClient.connect()

// Sets the key "octocat" to a value of "Mona the octocat"
redisClient.set("octocat", "Mona the Octocat", function (err, reply) { console.log("Reply: ", reply) });
// Sets a key to "octocat", field to "species", and "value" to "Cat and Octopus"
redisClient.hset("species", "octocat", "Cat and Octopus", function (err, reply) { console.log("Reply: ", reply) });
// Sets a key to "octocat", field to "species", and "value" to "Dinosaur and Octopus"
redisClient.hset("species", "dinotocat", "Dinosaur and Octopus", function (err, reply) { console.log("Reply: ", reply) });
// Sets a key to "octocat", field to "species", and "value" to "Cat and Robot"
redisClient.hset(["species", "robotocat", "Cat and Robot"], function (err, reply) { console.log("Reply: ", reply) });

// Gets all fields in "species" key
redisClient.hkeys("species", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    redisClient.disconnect();
});
