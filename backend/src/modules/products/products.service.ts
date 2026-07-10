import { getPool } from '../../config/database';

export interface ProductListResult {
  products: any[];
  page: number;
  limit: number;
  total: number;
}

export const productsService = {
  async list(params: {
    search?: string; category?: string; brand?: string;
    page: number; limit: number; sort?: string;
  }): Promise<ProductListResult> {
    const pool = await getPool();
    const req = pool.request();
    let where = 'WHERE p.is_active = 1';
    if (params.search) {
      where += ' AND (p.product_name LIKE @search OR b.name LIKE @search2)';
      req.input('search', `%${params.search}%`);
      req.input('search2', `%${params.search}%`);
    }
    if (params.category) {
      where += ' AND c.slug = @cat';
      req.input('cat', params.category);
    }
    if (params.brand) {
      where += ' AND b.slug = @brand';
      req.input('brand', params.brand);
    }

    let order = 'ORDER BY p.id DESC';
    if (params.sort === 'price_asc') order = 'ORDER BY p.price ASC';
    else if (params.sort === 'price_desc') order = 'ORDER BY p.price DESC';
    else if (params.sort === 'name') order = 'ORDER BY p.product_name ASC';
    else if (params.sort === 'featured') order = 'ORDER BY p.is_featured DESC, p.id DESC';
    else if (params.sort === 'newest') order = 'ORDER BY p.created_at DESC';
    else if (params.sort === 'sale') where += ' AND p.is_on_sale = 1';

    const offset = (params.page - 1) * params.limit;
    const countResult = await req.query(
      `SELECT COUNT(*) as total FROM Products p LEFT JOIN Brands b ON p.brand_id=b.id LEFT JOIN Categories c ON p.category_id=c.id ${where}`
    );
    const total = countResult.recordset[0].total;

    const dataReq = pool.request();
    if (params.search) {
      dataReq.input('search', `%${params.search}%`);
      dataReq.input('search2', `%${params.search}%`);
    }
    if (params.category) dataReq.input('cat', params.category);
    if (params.brand) dataReq.input('brand', params.brand);
    const dataResult = await dataReq.query(
      `SELECT p.id, p.product_name, p.slug, p.price, p.sale_price, p.stock, p.description as short_description, p.main_image, p.is_active, b.name as brand, c.name as category, c.slug as category_slug, p.created_at FROM Products p LEFT JOIN Brands b ON p.brand_id=b.id LEFT JOIN Categories c ON p.category_id=c.id ${where} ${order} OFFSET ${offset} ROWS FETCH NEXT ${params.limit} ROWS ONLY`
    );
    return { products: dataResult.recordset, page: params.page, limit: params.limit, total };
  },

  async getBySlug(slug: string) {
    const pool = await getPool();
    const result = await pool.request()
      .input('slug', slug)
      .query(
        `SELECT p.id, p.product_name, p.slug, p.price, p.sale_price, p.stock, p.description, p.specifications, p.main_image, p.gallery_images as additional_images, p.is_active, p.is_featured, p.is_on_sale, p.flavor, p.color, p.size, p.weight, b.name as brand, b.slug as brand_slug, c.name as category, c.slug as category_slug, p.created_at FROM Products p LEFT JOIN Brands b ON p.brand_id=b.id LEFT JOIN Categories c ON p.category_id=c.id WHERE p.slug = @slug AND p.is_active = 1`
      );
    return result.recordset[0] || null;
  },

  async getFilters() {
    const pool = await getPool();
    const categories = await pool.request().query('SELECT slug, name FROM Categories WHERE is_active=1 ORDER BY name');
    const brands = await pool.request().query('SELECT slug, name FROM Brands WHERE is_active=1 ORDER BY name');
    return { categories: categories.recordset, brands: brands.recordset };
  },

  async getById(id: number) {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', id)
      .query(
        `SELECT p.id, p.product_name, p.slug, p.price, p.sale_price, p.stock, p.description, p.specifications, p.main_image, p.gallery_images as additional_images, p.is_active, p.is_featured, p.is_on_sale, p.flavor, p.color, p.size, p.weight, b.name as brand, b.slug as brand_slug, c.name as category, c.slug as category_slug, p.created_at FROM Products p LEFT JOIN Brands b ON p.brand_id=b.id LEFT JOIN Categories c ON p.category_id=c.id WHERE p.id = @id AND p.is_active = 1`
      );
    return result.recordset[0] || null;
  }
};
