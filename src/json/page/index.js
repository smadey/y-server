next(null, {
  req: {
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    body: req.body,
  },
});
