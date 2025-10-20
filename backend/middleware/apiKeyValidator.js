import { Request, Response, NextFunction } from 'express';

export const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey || apiKey !== process.env.OPENROUTER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
};
