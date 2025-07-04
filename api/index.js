import('../dist/todo/server/server.mjs')
  .then(module => module.reqHandler)
  .catch(error => {
    console.error('Failed to load server module:', error);
    throw error;
  });


export default async (req, res) => {
  const { reqHandler: app } = await import('../dist/todo/server/server.mjs');

  const originalSetHeader = res.setHeader;
  console.log('req[user-agent]', req.headers['user-agent']);

  console.log('res.getHeaderNames() in index', res.getHeaderNames());
  console.log('req.headers in index', req.headers.cookie);


  // Intercept headers to ensure cookies are set
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Setting cookie:', value);
    }
    return originalSetHeader.call(this, name, value);
  };

  res.setHeader('Set-Cookie', 'test_cookie=verified; HttpOnly; Secure; SameSite=Lax');

  return app(req, res);
};
