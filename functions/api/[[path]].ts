export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  const url = new URL(request.url);

  const API_BASE = "https://db-mind-ultra.donthulanithish53.workers.dev";

  // remove /api prefix
  const path = url.pathname.replace(/^\/api/, "");

  const targetUrl = API_BASE + path + url.search;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
};
