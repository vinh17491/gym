import { Router, Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';

const productsRouter = Router();
export default productsRouter;

productsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, brand, page, limit, sort } = req.query;
    const result = await productsService.list({
      search: search as string,
      category: category as string,
      brand: brand as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 24,
      sort: sort as string
    });
    res.json({ success: true, data: result.products, pagination: { page: result.page, limit: result.limit, total: result.total, pages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
});

productsRouter.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list({ page: 1, limit: 12, sort: 'featured' });
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/new', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list({ page: 1, limit: 12, sort: 'newest' });
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/sale', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list({ page: 1, limit: 12, sort: 'sale' });
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/filters', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = await productsService.getFilters();
    res.json({ success: true, data: filters });
  } catch (err) { next(err); }
});

productsRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;
    // Try by slug first, then by numeric ID
    let product = await productsService.getBySlug(slug);
    if (!product && /^\d+$/.test(slug)) {
      product = await productsService.getById(parseInt(slug));
    }
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});
