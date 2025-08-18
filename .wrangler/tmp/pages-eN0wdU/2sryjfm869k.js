// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/images/*",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json"
  ],
  routes: [
    {
      src: "^/api/hospitals/([^/]+)/?$",
      dest: "/api/hospitals/$1.json"
    },
    {
      src: "^/api/hospitals/?$",
      dest: "/api/hospitals/index.json"
    },
    {
      src: "^/hospitals/([^/]+)/?$",
      dest: "/index.html"
    },
    {
      src: ".*",
      dest: "/index.html"
    }
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\.wrangler\\tmp\\pages-eN0wdU\\bundledWorker-0.9614741580979944.mjs";
import { isRoutingRuleMatch } from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\.wrangler\\tmp\\pages-eN0wdU\\bundledWorker-0.9614741580979944.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=2sryjfm869k.js.map
