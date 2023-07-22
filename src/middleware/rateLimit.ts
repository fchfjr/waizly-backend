import { Request, Response, NextFunction } from "express";

const postVisitCache = new Map<string, number>();

const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.id;

  if (postVisitCache.has(postId)) {
    const lastVisitTimestamp = postVisitCache.get(postId);

    const elapsedTime: number | undefined = lastVisitTimestamp
      ? Date.now() - lastVisitTimestamp
      : undefined;

    if (elapsedTime && elapsedTime <= 20 * 1000) {
      return res.status(429).json({
        message:
          "Too many requests from this IP for this post, please try again later.",
      });
    }
  }

  postVisitCache.set(postId, Date.now());

  next();
};

export default rateLimitMiddleware;
