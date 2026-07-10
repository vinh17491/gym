import { Router, Request, Response, NextFunction } from 'express';
import { productsService, ProductListParams } from './products.service';

const productsRouter = Router();
export default productsRouter;

function optionalNumber(value: unknown) {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function listParams(query: Request['query'], overrides: Partial<ProductListParams> = {}): ProductListParams {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 24));
  return {
    search: query.search as string,
    category: query.category as string,
    brand: query.brand as string,
    minPrice: optionalNumber(query.minPrice),
    maxPrice: optionalNumber(query.maxPrice),
    inStock: query.inStock === 'true',
    featured: query.featured === 'true',
    sort: query.sort as string,
    page,
    limit,
    ...overrides
  };
}

productsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list(listParams(req.query));
    res.json({
      success: true,
      data: result.products,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (err) { next(err); }
});

productsRouter.get('/featured', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list(listParams(req.query, { page: 1, limit: 12, featured: true, sort: 'featured' }));
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/new', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list(listParams(req.query, { page: 1, limit: 12, sort: 'newest' }));
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/sale', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productsService.list(listParams(req.query, { page: 1, limit: 12, saleOnly: true }));
    res.json({ success: true, data: result.products });
  } catch (err) { next(err); }
});

productsRouter.get('/filters', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await productsService.getFilters() });
  } catch (err) { next(err); }
});

productsRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let product = await productsService.getBySlug(req.params.slug);
    if (!product && /^\d+$/.test(req.params.slug)) product = await productsService.getById(parseInt(req.params.slug, 10));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});
