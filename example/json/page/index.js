next(null, {
  code: 0,
  request: {
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    body: req.body,
  },
});
