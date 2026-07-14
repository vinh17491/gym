# GYMFIT PRODUCT CATEGORIES

## STRUCTURED CATEGORIES FOR PRODUCT CATALOG

### Main Categories

1. **Protein** (Protein Supplements)
   - Whey Protein
   - Isolate Protein
   - Hydrolyzed Protein
   - Casein Protein
   - Vegan Protein
   - Mass Gainer
   - Weight Gainer
   - Meal Replacement

2. **Performance Supplements** (Athletic Enhancement)
   - Creatine
   - Pre Workout
   - BCAA
   - EAA
   - Glutamine
   - Citrulline
   - Beta Alanine
   - Electrolytes
   - Recovery Supplements

3. **Vitamins & Health** (Nutritional Support)
   - Multivitamin
   - Omega 3
   - Vitamin D
   - Zinc
   - Magnesium
   - Joint Support
   - Liver Support
   - Immune Support

4. **Fitness Equipment** (Strength Training)
   - Adjustable Dumbbells
   - Fixed Dumbbells
   - Rubber Dumbbells
   - Hex Dumbbells
   - Barbell
   - EZ Curl Bar
   - Olympic Barbell
   - Weight Plates
   - Bumper Plates
   - Kettlebells
   - Medicine Balls
   - Slam Balls
   - Sandbags

5. **Home Gym Equipment** (Comprehensive Training)
   - Bench Press
   - Squat Rack
   - Power Rack
   - Smith Machine
   - Cable Machine
   - Functional Trainer
   - Leg Press
   - Pull-up Station
   - Dip Station
   - Multigym
   - Home Gym Set

6. **Cardio Equipment** (Cardiovascular Training)
   - Treadmill
   - Exercise Bike
   - Spin Bike
   - Rowing Machine
   - Stair Climber
   - Elliptical
   - Ski Ergometer
   - Indoor Cycling

7. **Resistance Equipment** (Band-Based Training)
   - Resistance Bands
   - Mini Bands
   - Power Bands
   - Suspension Trainer
   - Battle Rope
   - Jump Rope

8. **Gym Accessories** (Supplementary Gear)
   - Gym Gloves
   - Wrist Wraps
   - Lifting Straps
   - Lifting Belt
   - Knee Sleeves
   - Elbow Sleeves
   - Chalk
   - Shaker Bottle
   - Water Bottle
   - Gym Bag
   - Foam Roller
   - Massage Ball

9. **Yoga & Mobility** (Flexibility & Recovery)
   - Yoga Mat
   - Yoga Block
   - Stretch Strap
   - Massage Roller
   - Mobility Ball

10. **Clothing** (Athletic Wear)
    - **Mens**
      - Tank Top
      - T-shirt
      - Compression Shirt
      - Hoodie
      - Shorts
      - Joggers
      - Compression Pants
    
    - **Womens**
      - Sports Bra
      - Leggings
      - Shorts
      - Crop Top
      - Jacket

11. **Footwear** (Athletic Shoes)
    - **Mens**
      - Running Shoes
      - Training Shoes
      - Weightlifting Shoes
      - Cross Training Shoes
    
    - **Womens**
      - Running Shoes
      - Training Shoes
      - Cross Training Shoes

12. **Smart Devices** (Fitness Technology)
    - Smart Watch
    - Heart Rate Monitor
    - Fitness Tracker
    - Smart Scale
    - Sleep Tracker

## SEARCH PRIORITY

### Phase 1: Research Brands by Category
1. **Visit Official Brand Websites**
   - Browse product catalogs by category
   - Extract product names, SKUs, specifications
   - Collect high-quality product images

2. **Research Major Retailers**
   - Cross-reference prices and availability
   - Gather additional product variants
   - Compare feature sets

3. **Validate Product Existence**
   - Check real market availability
   - Verify product specifications
   - Ensure image accessibility

## PRODUCT CRAWLING STRATEGY

### Protein Category Sources
1. **Optimum Nutrition**
   - Products: Gold Standard Whey, Nighttime Casein, Amino Energy
   - Flavors: Chocolate, Vanilla, Strawberry
   - Package sizes: 1.78lb, 2.64lb, 10lb

2. **MyProtein**
   - Range: Whey Protein, Vegan Protein, Mass Gainers
   - Flavors: Chocolate, Vanilla, Strawberry, Banana

3. **Dymatize**
   - Products: Elite Whey, Super Amino, IsoMize

4. **BSN**
   - Products: No-Xplode, Syntha-6, Endorush

5. **MuscleTech**
   - Products: Lab Series, Nitro Tech, Vapor X5

### Performance Supplements Sources
1. **Creatine Products**
   - Creatine Monohydrate (Optimum, Dymatize, BSN)
   - Creatine HCL (Nature’s Way)

2. **Pre Workout**
   - C4 Pre-Workout (BSN)
   - Pump Chill (Dymatize)
   - Pre Jym (JYM Supplement)

3. **BCAAs & EAAs**
   - BCAA Powders (Optimum, BSN)
   - EAA Supplements (MuscleTech, Bulk)

### Equipment Sources
1. **Rogue Fitness**
   - Adjustable Dumbbells
   - Barbells & Weight Plates
   - Strength Equipment

2. **Bowflex**
   - Adjustable Dumbbells (4-24lb)
   - Home Gyms

3. **TRX**
   - Suspension Trainers
   - Resistance Bands

4. **Gymshark**
   - Activewear
   - Gym Clothes

5. **Nike & Adidas**
   - Running Shoes
   - Training Shoes

### Technology & Smart Devices
1. **Garmin**
   - Forerunner Series
   - Fenix Series

2. **Fitbit**
   - Charge Series
   - Versa Series

3. **Apple**
   - Apple Watch (if applicable)

## DATA COLLECTION CHECKLIST

### Product Information Required
- [ ] Product Name (Exact match)
- [ ] Brand (Verified)
- [ ] Category & Sub-category
- [ ] Description (Official brand description)
- [ ] Specifications (Weight, serving size, etc.)
- [ ] Price (Current market price)
- [ ] SKU/Barcode (If available)
- [ ] Main Product Image (Official packaging)
- [ ] Gallery Images (Product shots, usage)
- [ ] Review Rating (Star rating from official site)
- [ ] Stock Status (Available/OOS)

### Validation Steps
1. **URL Verification**
   - Product page loads without 404/403
   - All image URLs accessible
   - Page contains product information

2. **Image Validation**
   - Image exists and loads
   - High resolution (>1MB)
   - Product clearly visible
   - No watermarks or overlays
   - Matches product description

3. **Data Accuracy**
   - Product name matches official branding
   - Specifications are accurate to source
   - Price reflects current market rate
   - Stock status is current

## DUPLICATION PREVENTION

### Checkpoints
- SKU uniqueness across catalog
- Product name similarity (fuzzy matching)
- Image hash comparison
- Brand + product name combination
- Specifications match within tolerance

## SQL INSERT GENERATION

### Insert Statements Structure
```sql
INSERT INTO Products (
    product_name, brand_id, category_id, sub_category,
    description, specifications, features,
    sku, price, sale_price, stock,
    rating, review_count, main_image, gallery_images
) VALUES
-- Product 1
('Gold Standard 100% Whey Protein - Double Rich Chocolate', 1, 1, 'Chocolate',
 'Optimum Nutrition\'s award-winning Whey protein formula...', 
 '24g protein per serving, 5.5g BCAAs, 11g sugars', 
 'Ultra-filtered whey protein isolate, 24g protein', 
 'ON-GOLD-5LB-CHOC-2024',
 54.99, NULL, 150,
 4.6, 2845,
 'https://example.com/on-golden-standard.jpg',
 'https://example.com/on-golden-standard-1.jpg,https://example.com/on-golden-standard-2.jpg,https://example.com/on-golden-standard-3.jpg');
GO
```

## TELEGRAM NOTIFICATIONS

### Progress Updates
- **Phase 1**: Research completion (20 products)
- **Phase 2**: Validation completion (30 products)
- **Phase 3**: SQL generation & seeding
- **Phase 4**: Final report generation

### Content Types
- Product count milestones
- Category completion status
- Image validation results
- Quality scores
- Database operation results

## FINAL VALIDATION METRICS

### Quality Targets
- ✅ 95% image validation rate
- ✅ <1% duplicate detection
- ✅ 100% product existence verification
- ✅ All categories represented
- ✅ Complete inventory for 12 main categories
- ✅ Average rating >4 stars for products
- ✅ Current price information

### Acceptance Criteria
- All products verified from real market
- Images match exact products
- No SQL injection vulnerabilities
- Proper JSON formatting for specs/features
- Comprehensive product catalog for GymFit Store
# HISTORICAL REFERENCE — NOT CURRENT SOURCE OF TRUTH

Retained as point-in-time catalog evidence. Use current source/database and the [TASK-007 handoff](../../TASK-007_FINAL_HANDOFF.md).
