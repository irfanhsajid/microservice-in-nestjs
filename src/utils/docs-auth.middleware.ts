import { NextFunction, Response } from 'express';

export const docsAuthMiddleware = (req, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    next();
  } else {
    if (req.session) {
      res.clearCookie('session');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  }
};
