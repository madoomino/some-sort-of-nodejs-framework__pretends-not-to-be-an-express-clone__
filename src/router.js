const setPrototypeOf = require("setprototypeof");
const Route = require("./route");
const Layer = require("./Layer");
const parseurl = require("parseurl");

const proto = (module.exports = function (options) {
  const opts = options || {};

  function router(req, res, next) {
    router.handle(req, res, next);
  }

  setPrototypeOf(router, proto);

  router.params = {};
  router._params = [];
  router.caseSensitive = opts.caseSensitive;
  router.mergeParams = opts.mergeParams;
  router.strict = opts.strict;
  router.stack = [];

  return router;
});

proto.route = function route(path) {
  const route = new Route(path);

  const layer = new Layer(path, {}, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);

  return route;
};

proto.handle = function handle(req, res, out) {
  const self = this;
  const stack = self.stack;
  const path = getPathname(req);

  let layer;
  let match;
  let route;
  let idx = 0;

  while (match !== true && idx < stack.length) {
    layer = stack[idx++];
    match = matchLayer(layer, path);
    route = layer.route;

    if (match !== true) {
      continue;
    }

    if (!route) {
      continue;
    }

    route.stack[0].handle_request(req, res);
  }
};

function matchLayer(layer, path) {
  try {
    return layer.match(path);
  } catch (error) {
    return error;
  }
}

function getPathname(req) {
  try {
    return parseurl(req).pathname;
  } catch (error) {
    return undefined;
  }
}
