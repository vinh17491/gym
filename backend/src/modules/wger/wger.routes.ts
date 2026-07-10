import { Router, Request, Response, NextFunction } from 'express';
import { wgerService } from '../../services/wger.service';

const router = Router();

// GET /api/wger/exercises
router.get('/exercises', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { offset, limit, category, muscle, equipment, search } = req.query;
    const off = parseInt(offset as string) || 0;
    const lim = parseInt(limit as string) || 50;

    if (search) {
      const data = await wgerService.searchExercises(search as string, off, lim);
      return res.json({ success: true, data: data.results, pagination: { offset: off, limit: lim, total: data.count } });
    }
    if (muscle) {
      const data = await wgerService.getExercisesByMuscle(parseInt(muscle as string), off, lim);
      return res.json({ success: true, data: data.results, pagination: { offset: off, limit: lim, total: data.count } });
    }
    if (equipment) {
      const data = await wgerService.getExercisesByEquipment(parseInt(equipment as string), off, lim);
      return res.json({ success: true, data: data.results, pagination: { offset: off, limit: lim, total: data.count } });
    }
    const data = await wgerService.getExercises(off, lim, category ? parseInt(category as string) : undefined);
    res.json({ success: true, data: data.results, pagination: { offset: off, limit: lim, total: data.count } });
  } catch (err) { next(err); }
});

// GET /api/wger/exercises/:id
router.get('/exercises/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid exercise ID' });
    const data = await wgerService.getExerciseById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/wger/exercises/:id/images
router.get('/exercises/:id/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid exercise ID' });
    const data = await wgerService.getExerciseImages(id);
    res.json({ success: true, data: data.results });
  } catch (err) { next(err); }
});

// GET /api/wger/exercises/:id/videos
router.get('/exercises/:id/videos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid exercise ID' });
    const data = await wgerService.getExerciseVideos(id);
    res.json({ success: true, data: data.results });
  } catch (err) { next(err); }
});

// GET /api/wger/categories
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wgerService.getCategories();
    res.json({ success: true, data: data.results });
  } catch (err) { next(err); }
});

// GET /api/wger/muscles
router.get('/muscles', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wgerService.getMuscles();
    res.json({ success: true, data: data.results });
  } catch (err) { next(err); }
});

// GET /api/wger/equipment
router.get('/equipment', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await wgerService.getEquipment();
    res.json({ success: true, data: data.results });
  } catch (err) { next(err); }
});

// GET /api/wger/images
router.get('/images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { offset, limit } = req.query;
    const data = await wgerService.getExerciseImages(undefined, parseInt(offset as string) || 0, parseInt(limit as string) || 20);
    res.json({ success: true, data: data.results, pagination: { total: data.count } });
  } catch (err) { next(err); }
});

// GET /api/wger/videos
router.get('/videos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { offset, limit } = req.query;
    const data = await wgerService.getExerciseVideos(undefined, parseInt(offset as string) || 0, parseInt(limit as string) || 20);
    res.json({ success: true, data: data.results, pagination: { total: data.count } });
  } catch (err) { next(err); }
});

export default router;
