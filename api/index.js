// import {
//   AngularNodeAppEngine,
//   writeResponseToNodeResponse,
// } from '@angular/ssr/node';


import('../dist/todo/server/server.mjs')
  .then(module => module.default)
  .catch(error => {
    console.error('Failed to load server module:', error);
    throw error;
  });




export default async (req, res) => {
  const { default: app } = await import('../dist/todo/server/server.mjs');
  // const angularApp = new AngularNodeAppEngine();

  // app.use('/**', (req, res, next) => {
  //   console.log('from index.js res', res.getHeaderNames());
  //   console.log('from index.js req', req.headers);

  //   angularApp
  //     .handle(req)
  //     .then((response) =>
  //       response ? writeResponseToNodeResponse(response, res) : next(),
  //     )
  //     .catch(next);
  // });


  const originalSetHeader = res.setHeader;
  console.log('req[user-agent]', req.headers['user-agent']);

  console.log('res.headers ', res.getHeaderNames());


  // Intercept headers to ensure cookies are set
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Setting cookie:', value);
    }
    return originalSetHeader.call(this, name, value);
  };

  return app(req, res);
};
