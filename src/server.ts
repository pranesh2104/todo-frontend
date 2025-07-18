import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContext } from '@netlify/angular-runtime/context.mjs'
// import compression from 'compression';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();


// app.use(compression());

app.set('trust proxy', true);

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  // console.log('from server.ts res', res.getHeaderNames());
  // console.log('from server.ts req', req.headers);
  // console.log('url ', req.originalUrl);
  // console.log('res in server.ts ', res.getHeader('Set-Cookie'));
  // console.log('req in server.ts', req.headers);

  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        // Pass cookies to SSR response
        console.log('res ', res);

        const cookies = req.get('Cookie') || '';
        console.log('cookie from server.ts ', cookies);

        // response.headers['Set-Cookie'] = cookies;
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    }
    )
    .catch(next);
});

export async function netlifyAppEngineHandler(request: any): Promise<any> {
  const context = getContext()

  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // const pathname = new URL(request.url).pathname;
  // if (pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  const result = await angularApp.handle(request, context);
  console.log({ result });

  return result || new Response('Not found', { status: 404 });
}

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
// export default app;
/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(netlifyAppEngineHandler);
