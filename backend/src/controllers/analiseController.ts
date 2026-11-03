import { NextFunction, Request, Response } from 'express';
import * as analiseService from '../services/analiseService';

export async function obterAnalise(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await analiseService.obterAnalise());
  } catch (err) {
    next(err);
  }
}