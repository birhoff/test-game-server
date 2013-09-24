var Response = function (type, data) {

};

Response.types = {
    Error: "error",
    WorldState: "worldState",
    WorldUpdate: "worldUpdate"
};

module.exports = Response;