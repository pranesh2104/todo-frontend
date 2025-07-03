import('../dist/todo/server/server.mjs')
  .then(module => module.default)
  .catch(error => {
    console.error('Failed to load server module:', error);
    throw error;
  });


export default async (req, res) => {
  const { default: app } = await import('../dist/todo/server/server.mjs');

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
