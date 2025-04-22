import { Application } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';


//detects routes that comes in with /api/v1/ and if it detects that immediately forwards it to legacy & proxies for it
export function setupLegacyProxy(app: Application) {
  const proxyOptions: Options = {
    pathFilter: '/api/v1/**',           
    target: 'http://legacy-backend:8003',
    changeOrigin: true,
  };

  app.use(createProxyMiddleware(proxyOptions));
}
