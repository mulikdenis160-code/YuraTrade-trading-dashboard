import { a as toRequest, n as HTTPError } from "../_libs/h3+rou3+srvx.mjs";
//#region #nitro/virtual/vite-services
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var viteServices = { ["ssr"]: lazyService(() => import("../_ssr/ssr.mjs").then((n) => n.o)) };
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_c982e29cd729efaa8639d62ee9123a5b/node_modules/nitro/dist/runtime/vite.mjs
function fetchViteEnv(viteEnvName, input, init) {
	const viteEnv = viteServices[viteEnvName];
	if (!viteEnv) throw HTTPError.status(404);
	return Promise.resolve(viteEnv.fetch(toRequest(input, init)));
}
//#endregion
//#region ../../node_modules/.pnpm/nitro@3.0.260610-beta_@electric-sql+pglite@0.5.8_chokidar@5.0.0_drizzle-orm@0.45.2_@ele_c982e29cd729efaa8639d62ee9123a5b/node_modules/nitro/dist/runtime/internal/vite/ssr-renderer.mjs
/** @param {{ req: Request }} HTTPEvent */
function ssrRenderer({ req }) {
	return fetchViteEnv("ssr", req);
}
//#endregion
export { ssrRenderer as default };
