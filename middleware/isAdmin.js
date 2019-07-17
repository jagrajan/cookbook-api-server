const isAdmin = (req, res, next) => {
  if (req.user && !req.user.admin) {
    return res.status(401).json({ error: 'not-authorized' })
  }
  next();
}

export default isAdmin;
