import { Router, Request, Response, NextFunction } from 'express';
import { productsService, ProductListParams } from './products.service';
import { AppError } from '../../middleware/errorHandler';

const productsRouter = Router();
export default productsRouter;

const supportedSorts = new Set(['price_asc', 'price_desc', 'name', 'featured', 'newest', 'sale']);

function optionalNonNegativeNumber(value: unknown, name: string) {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new AppError(400, `${name} must be a number greater than or equal to 0`);
  return parsed;
}

function listParams(query: Request['query'], overrides: Partial<ProductListParams> = {}): ProductListParams {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 24 : Number(query.limit);
  if (!Number.isSafeInteger(page) || page < 1) throw new AppError(400, 'page must be an integer greater than or equal to 1');
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new AppError(400, 'limit must be an integer between 1 and 100');

  const minPrice = optionalNonNegativeNumber(query.minPrice, 'minPrice');
  const maxPrice = optionalNonNegativeNumber(query.maxPrice, 'maxPrice');
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError(400, 'minPrice must be less than or equal to maxPrice');
  }
  const sort = query.sort as string | undefined;
  if (sort && !supportedSorts.has(sort)) throw new AppError(400, 'Unsupported product sort');

  const params: ProductListParams = {
    search: query.search as string,
    category: query.category as string,
    brand: query.brand as string,
    minPrice,
    maxPrice,
    inStock: query.inStock === 'true',
    featured: query.featured === 'true',
    sort,
    page,
    limit,
    ...overrides
  };
  return params;
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
    const result = await productsService.list(listParams(req.query, { page: 1, limit: 12, saleOnly: true, sort: 'sale' }));
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
