function response(res, success, data, error) {
  return res.json({
    success,
    content: {
      data,
      error,
    },
  })
}

export default response
