// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/*",
    "/static/*",
    "/images/*",
    "/*.js",
    "/*.css",
    "/*.json",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json"
  ],
  routes: [
    {
      src: ".*",
      dest: "/index.html"
    }
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\.wrangler\\tmp\\pages-rQqK4C\\bundledWorker-0.24994706289280533.mjs";
import { isRoutingRuleMatch } from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "P:\\Galeon projects\\galeon-community-hospital-map\\main\\.wrangler\\tmp\\pages-rQqK4C\\bundledWorker-0.24994706289280533.mjs";
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
        if (worker.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return worker.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=86yyg3qh3fc.js.map
