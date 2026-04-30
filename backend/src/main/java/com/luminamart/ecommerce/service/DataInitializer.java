package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.model.Category;
import com.luminamart.ecommerce.model.Occasion;
import com.luminamart.ecommerce.model.PriceHistory;
import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.repository.CategoryRepository;
import com.luminamart.ecommerce.repository.OccasionRepository;
import com.luminamart.ecommerce.repository.PriceHistoryRepository;
import com.luminamart.ecommerce.repository.ProductRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final OccasionRepository occasionRepository;
    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           OccasionRepository occasionRepository,
                           ProductRepository productRepository,
                           PriceHistoryRepository priceHistoryRepository) {
        this.categoryRepository = categoryRepository;
        this.occasionRepository = occasionRepository;
        this.productRepository = productRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (productRepository.count() >= 120) {
                return;
            }

            Category clothing = createCategory("Clothing", "clothing", "Wardrobe staples for men, women, and kids.", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80");
        Category menClothing = createCategory("Men Clothing", "men-clothing", "Tailored essentials, relaxed layers, and work-ready menswear.", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80");
        Category womenClothing = createCategory("Women Clothing", "women-clothing", "From elevated basics to event-ready statement outfits.", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80");
        Category footwear = createCategory("Footwear", "footwear", "Shoes designed for comfort and style.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80");
        Category accessories = createCategory("Accessories", "accessories", "Finish your look with premium accessories.", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80");
        Category electronics = createCategory("Electronics", "electronics", "Smart devices and everyday tech essentials.", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80");
        Category kids = createCategory("Kids", "kids", "Comfort-first clothes and shoes for play, school, and celebrations.", "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=900&q=80");

        Occasion casual = createOccasion("Casual", "🔥", "Relaxed looks that work for weekends and city strolls.");
        Occasion party = createOccasion("Party", "✨", "Statement styles for evenings and celebrations.");
        Occasion formal = createOccasion("Formal", "💼", "Polished outfits for meetings and interviews.");
        Occasion sports = createOccasion("Sports", "🏃", "Activewear built for high energy and movement.");
        Occasion festive = createOccasion("Festive", "🎉", "Bold, joyful pieces for festival season.");

        createProduct("Luminamart Flex Knit Hoodie", "Lumi Studio", "A breathable hoodie with soft stretch and relaxed fit.", "Perfect for weekend layering or athleisure style.", "https://images.unsplash.com/photo-1520975914034-37d1427d7118?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(casual, sports)), new BigDecimal("49.99"), new BigDecimal("69.99"), true, "#111827", 4.7, 82, Arrays.asList("69.99", "64.99", "59.99", "54.99", "49.99"));
        createProduct("Midnight Satin Party Dress", "Noir Label", "Elegant dress with fluid drape and modern shimmer.", "Styled for after-dark events and memorable first impressions.", "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(party, festive)), new BigDecimal("129.99"), new BigDecimal("159.99"), true, "#111827", 4.9, 64, Arrays.asList("149.99", "139.99", "134.99", "129.99", "129.99"));
        createProduct("Structured Leather Loafers", "Linea", "Timeless leather shoes with plush cushioning.", "Designed for comfort through long days in the office.", "https://images.unsplash.com/photo-1528701800489-20edbaa3e91e?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(formal, casual)), new BigDecimal("89.99"), new BigDecimal("109.99"), false, "#4b5563", 4.5, 74, Arrays.asList("109.99", "104.99", "99.99", "94.99", "89.99"));
        createProduct("Motion Pro Trainer", "AeroFit", "High-performance runners with responsive cushioning.", "A trusted pick for gym sessions and morning jogs.", "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(sports, casual)), new BigDecimal("99.99"), new BigDecimal("129.99"), true, "#111827", 4.8, 48, Arrays.asList("125.99", "119.99", "114.99", "109.99", "99.99"));
        createProduct("Festival Fringe Tote", "Woven & Co", "A bold bag with bright fringe and practical capacity.", "Carry essentials in style across summer gatherings.", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80", accessories, new HashSet<>(Arrays.asList(festive, casual)), new BigDecimal("34.99"), new BigDecimal("44.99"), false, "#d97706", 4.3, 29, Arrays.asList("44.99", "42.99", "39.99", "37.99", "34.99"));
        createProduct("Signature Aviator Sunglasses", "LuniEyes", "Lightweight on-trend frames with UV protection.", "Perfect for sunny day styling and everyday wear.", "https://images.unsplash.com/photo-1521335629791-ce4aec67dd64?auto=format&fit=crop&w=800&q=80", accessories, new HashSet<>(Arrays.asList(casual, festive)), new BigDecimal("59.99"), new BigDecimal("79.99"), true, "#f59e0b", 4.6, 52, Arrays.asList("79.99", "74.99", "69.99", "64.99", "59.99"));
        createProduct("Urban Leather Backpack", "PackHouse", "A structured backpack built for daily commuting and style.", "Organize your essentials with padded laptop protection and sleek design.", "https://images.unsplash.com/photo-1517949908112-6454355291fe?auto=format&fit=crop&w=800&q=80", accessories, new HashSet<>(Arrays.asList(casual, formal)), new BigDecimal("79.99"), new BigDecimal("99.99"), true, "#0f172a", 4.4, 38, Arrays.asList("99.99", "94.99", "89.99", "84.99", "79.99"));
        createProduct("Neon Mesh Training Tee", "Pulse Gear", "A moisture-wicking tee designed for intense workouts.", "Stay cool while training with four-way stretch performance fabric.", "https://images.unsplash.com/photo-1526401485004-2fd9f82bb501?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(sports, casual)), new BigDecimal("29.99"), new BigDecimal("39.99"), false, "#2563eb", 4.2, 27, Arrays.asList("39.99", "36.99", "34.99", "32.99", "29.99"));
        createProduct("Premium Noise Cancelling Headphones", "SoundWave", "Luxurious over-ear headphones with crystal clear audio.", "Perfect for music, work, and everyday listening.", "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=800&q=80", electronics, new HashSet<>(Arrays.asList(formal, casual)), new BigDecimal("199.99"), new BigDecimal("249.99"), true, "#111827", 4.9, 120, Arrays.asList("249.99", "239.99", "219.99", "209.99", "199.99"));
        createProduct("Smart Pixel Compact Camera", "FramePro", "A pocket camera built for quick portraits and vivid street photography.", "Capture sharp, creative shots with AI scene detection.", "https://images.unsplash.com/photo-1519183071298-a2962be90b2b?auto=format&fit=crop&w=800&q=80", electronics, new HashSet<>(Arrays.asList(casual, party)), new BigDecimal("249.99"), new BigDecimal("299.99"), true, "#0f172a", 4.8, 40, Arrays.asList("299.99", "289.99", "279.99", "269.99", "249.99"));
        createProduct("Kids Cozy Hoodie", "TinyTrend", "Soft fleece hoodie with playful prints and easy layering.", "Perfect for school days and weekend adventures.", "https://images.unsplash.com/photo-1520974735194-2184fccc04aa?auto=format&fit=crop&w=800&q=80", kids, new HashSet<>(Arrays.asList(casual, sports)), new BigDecimal("24.99"), new BigDecimal("34.99"), false, "#2563eb", 4.6, 15, Arrays.asList("34.99", "32.99", "29.99", "27.99", "24.99"));
        createProduct("Mini Star Joggers", "KidSprint", "Soft joggers with stretch waistband and playful star details.", "Comfortable movement gear for active youngsters.", "https://images.unsplash.com/photo-1543286386-2f7b44fcd1eb?auto=format&fit=crop&w=800&q=80", kids, new HashSet<>(Arrays.asList(casual, sports)), new BigDecimal("21.99"), new BigDecimal("29.99"), false, "#111827", 4.3, 22, Arrays.asList("29.99", "27.99", "25.99", "23.99", "21.99"));
        createProduct("Executive Slim Shirt", "OfficeAura", "A polished shirt for board meetings and formal events.", "Sharp tailoring with soft stretch for all-day comfort.", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(formal)), new BigDecimal("59.99"), new BigDecimal("74.99"), true, "#0f172a", 4.5, 91, Arrays.asList("74.99", "69.99", "64.99", "62.99", "59.99"));
        createProduct("Luxe Evening Heels", "VelvetStep", "Refined heels with cushioned insoles and sparkling finish.", "Perfect for special nights out and festive gatherings.", "https://images.unsplash.com/photo-1519183071298-a2962be90b2b?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(party, formal, festive)), new BigDecimal("139.99"), new BigDecimal("169.99"), true, "#7c3aed", 4.7, 36, Arrays.asList("169.99", "159.99", "149.99", "144.99", "139.99"));
        createProduct("Metro Oxford Shirt", "North Avenue", "A crisp button-down tailored for office hours and polished dinners.", "Breathable stretch cotton with a modern slim silhouette.", "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(formal, casual)), new BigDecimal("54.99"), new BigDecimal("69.99"), false, "#1e293b", 4.4, 58, Arrays.asList("69.99", "66.99", "62.99", "58.99", "54.99"));
        createProduct("Weekend Linen Co-ord", "Serein", "A relaxed two-piece set for warm days and easy styling.", "Lightweight linen blend with a breezy drape.", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(casual, festive)), new BigDecimal("84.99"), new BigDecimal("109.99"), true, "#c084fc", 4.7, 44, Arrays.asList("109.99", "104.99", "99.99", "92.99", "84.99"));
        createProduct("City Pleat Trousers", "House Form", "Structured trousers with fluid movement and all-day comfort.", "An easy match for workwear and elevated evening looks.", "https://images.unsplash.com/photo-1506629905607-d405b7aebc2f?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(formal, party)), new BigDecimal("64.99"), new BigDecimal("84.99"), false, "#475569", 4.5, 63, Arrays.asList("84.99", "79.99", "74.99", "69.99", "64.99"));
        createProduct("Junior Festival Kurta Set", "Little Loom", "A bright festive set built for comfort and celebration.", "Soft fabric and playful detail for family events.", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", clothing, new HashSet<>(Arrays.asList(festive, party)), new BigDecimal("39.99"), new BigDecimal("54.99"), false, "#f97316", 4.6, 31, Arrays.asList("54.99", "49.99", "46.99", "43.99", "39.99"));
        createProduct("Nimbus Running Watch", "PulseLab", "A fitness watch with GPS, recovery insights, and bright AMOLED display.", "Tracks workouts, sleep, and daily health metrics.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", electronics, new HashSet<>(Arrays.asList(sports, casual)), new BigDecimal("149.99"), new BigDecimal("179.99"), true, "#0f172a", 4.8, 96, Arrays.asList("179.99", "174.99", "169.99", "159.99", "149.99"));
        createProduct("Slate 14 Productivity Laptop", "Vertex", "A lightweight laptop tuned for study, work, and creative flow.", "Fast SSD storage and all-day battery for hybrid schedules.", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", electronics, new HashSet<>(Arrays.asList(formal, casual)), new BigDecimal("799.99"), new BigDecimal("899.99"), true, "#111827", 4.7, 73, Arrays.asList("899.99", "879.99", "849.99", "829.99", "799.99"));
        createProduct("Pocket Sound Mini Speaker", "EchoPeak", "A portable Bluetooth speaker with room-filling sound and bold bass.", "Compact enough for travel and weekend hangouts.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", electronics, new HashSet<>(Arrays.asList(party, casual)), new BigDecimal("79.99"), new BigDecimal("99.99"), false, "#0f172a", 4.4, 41, Arrays.asList("99.99", "94.99", "89.99", "84.99", "79.99"));
        createProduct("Glass Shield Phone Case", "GripLine", "A durable transparent case with reinforced corners and matte grip.", "Protective daily carry without hiding your phone style.", "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80", accessories, new HashSet<>(Arrays.asList(casual, sports)), new BigDecimal("19.99"), new BigDecimal("29.99"), false, "#38bdf8", 4.1, 87, Arrays.asList("29.99", "27.99", "24.99", "22.99", "19.99"));
        createProduct("Studio Chain Shoulder Bag", "Maison Loop", "A compact bag with polished hardware and easy day-to-night styling.", "Fits essentials while keeping the silhouette refined.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", accessories, new HashSet<>(Arrays.asList(party, formal)), new BigDecimal("74.99"), new BigDecimal("94.99"), true, "#111827", 4.5, 39, Arrays.asList("94.99", "89.99", "84.99", "79.99", "74.99"));
        createProduct("TrailGrip Sneakers", "Summit Way", "Stable all-terrain sneakers built for long walks and active weekends.", "Supportive sole and breathable knit upper.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(sports, casual)), new BigDecimal("109.99"), new BigDecimal("134.99"), true, "#0f172a", 4.8, 66, Arrays.asList("134.99", "129.99", "124.99", "119.99", "109.99"));
        createProduct("Velour Party Sandals", "Sparkline", "Dress sandals with a cushioned sole and subtle crystal detailing.", "Designed for celebrations that go late into the night.", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(party, festive)), new BigDecimal("94.99"), new BigDecimal("119.99"), false, "#db2777", 4.6, 27, Arrays.asList("119.99", "114.99", "109.99", "102.99", "94.99"));
        createProduct("PlaySprint School Shoes", "Tiny Steps", "Reliable everyday school shoes with cushioned support and grip.", "Built for classroom days and playground runs.", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80", footwear, new HashSet<>(Arrays.asList(formal, casual)), new BigDecimal("34.99"), new BigDecimal("44.99"), false, "#1f2937", 4.3, 24, Arrays.asList("44.99", "42.99", "39.99", "37.99", "34.99"));

        seedSeries(menClothing, "Casual Wear", "Weekend", "Northline", casual, sports, List.of("Overshirt", "Polo", "Cargo Pants", "Knit Hoodie", "Travel Tee"), List.of("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"), new BigDecimal("34.99"), "Soft structure, clean lines, and easy layering for everyday wear.", "#2563EB");
        seedSeries(menClothing, "Formal Wear", "Office", "Crestline", formal, party, List.of("Oxford Shirt", "Tailored Blazer", "Pleated Trousers", "Merino Knit", "Derby Coat"), List.of("https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80"), new BigDecimal("59.99"), "Structured tailoring with stretch comfort for long workdays and evening plans.", "#1D4ED8");
        seedSeries(womenClothing, "Everyday", "City", "Serein", casual, formal, List.of("Linen Set", "Wrap Dress", "Wide-Leg Pants", "Soft Blouse", "Midi Skirt"), List.of("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"), new BigDecimal("44.99"), "Breezy silhouettes with polished details that move from errands to dinner effortlessly.", "#38BDF8");
        seedSeries(womenClothing, "Party Wear", "Evening", "Velora", party, festive, List.of("Satin Dress", "Sequin Top", "Statement Heels", "Tailored Jumpsuit", "Crystal Skirt"), List.of("https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"), new BigDecimal("69.99"), "Party-ready shine, flattering fits, and refined glamour for memorable nights.", "#DB2777");
        seedSeries(kids, "Kids Active", "Play", "TinyTrail", casual, sports, List.of("Graphic Hoodie", "Jogger Set", "Play Tee", "School Jacket", "Mini Sneakers"), List.of("https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"), new BigDecimal("19.99"), "Durable comfort and playful styling made for school runs, weekends, and movement.", "#F97316");
        seedSeries(electronics, "Smart Devices", "Connected", "PulseLab", casual, formal, List.of("Wireless Earbuds", "Productivity Laptop", "Smart Watch", "Bluetooth Speaker", "Compact Camera"), List.of("https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"), new BigDecimal("79.99"), "Reliable tech essentials designed for entertainment, focus, and smooth daily routines.", "#0F172A");
        seedSeries(footwear, "Performance", "Motion", "AeroFit", sports, casual, List.of("Training Sneakers", "Runner", "Court Shoe", "Trail Shoe", "Recovery Slides"), List.of("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80"), new BigDecimal("49.99"), "Responsive cushioning, stable support, and all-day comfort for movement-heavy schedules.", "#111827");
            seedSeries(accessories, "Finishers", "Accent", "Maison Loop", festive, party, List.of("Shoulder Bag", "Aviator Shades", "Chain Wallet", "Statement Watch", "Travel Backpack"), List.of("https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1521335629791-ce4aec67dd64?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"), new BigDecimal("24.99"), "High-impact finishing pieces that lift a look instantly without sacrificing practicality.", "#38BDF8");
        } catch (DataAccessException ex) {
            log.warn("Skipping catalog data initialization because the database is not available: {}", ex.getMostSpecificCause().getMessage());
        }
    }

    private Category createCategory(String name, String slug, String description, String imageUrl) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category category = new Category();
            category.setName(name);
            category.setSlug(slug);
            category.setDescription(description);
            category.setImageUrl(imageUrl);
            return categoryRepository.save(category);
        });
    }

    private Occasion createOccasion(String name, String icon, String description) {
        return createOccasion(name, name.trim().toLowerCase(Locale.ROOT), defaultOccasionIcon(name), description);
    }

    private Occasion createOccasion(String name, String slug, String icon, String description) {
        return occasionRepository.findBySlugIgnoreCase(slug).orElseGet(() -> {
            Occasion occasion = new Occasion();
            occasion.setName(name);
            occasion.setSlug(slug);
            occasion.setIcon(icon);
            occasion.setDescription(description);
            return occasionRepository.save(occasion);
        });
    }

    private void createProduct(String name,
                               String brand,
                               String description,
                               String shortDescription,
                               String imageUrl,
                               Category category,
                               java.util.Set<Occasion> occasions,
                               BigDecimal price,
                               BigDecimal compareAtPrice,
                               boolean featured,
                               String accentColor,
                               double ratingAverage,
                               int reviewCount,
                               java.util.List<String> pricePoints) {
        createProduct(
                name,
                brand,
                resolveSubcategory(category, name),
                description,
                shortDescription,
                imageUrl,
                category,
                occasions,
                price,
                compareAtPrice,
                featured,
                accentColor,
                ratingAverage,
                reviewCount,
                30,
                pricePoints
        );
    }

    private void createProduct(String name,
                               String brand,
                               String subcategory,
                               String description,
                               String shortDescription,
                               String imageUrl,
                               Category category,
                               java.util.Set<Occasion> occasions,
                               BigDecimal price,
                               BigDecimal compareAtPrice,
                               boolean featured,
                               String accentColor,
                               double ratingAverage,
                               int reviewCount,
                               int stockCount,
                               java.util.List<String> pricePoints) {
        if (productRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        product.setSubcategory(subcategory);
        product.setDescription(description);
        product.setShortDescription(shortDescription);
        product.setImageUrl(imageUrl);
        product.setPrice(price);
        product.setCompareAtPrice(compareAtPrice);
        product.setCategory(category);
        product.setOccasions(occasions);
        product.setFeatured(featured);
        product.setAccentColor(accentColor);
        product.setRatingAverage(roundRating(ratingAverage));
        product.setReviewCount(reviewCount);
        product.setStockCount(stockCount);

        Product savedProduct = productRepository.save(product);
        int daysAgo = pricePoints.size();
        for (String raw : pricePoints) {
            PriceHistory history = new PriceHistory();
            history.setProduct(savedProduct);
            history.setPrice(new BigDecimal(raw));
            history.setRecordedAt(LocalDate.now().minusDays(daysAgo--));
            priceHistoryRepository.save(history);
        }
    }

    private void seedSeries(Category category,
                            String subcategory,
                            String collection,
                            String brand,
                            Occasion primaryOccasion,
                            Occasion secondaryOccasion,
                            List<String> productTypes,
                            List<String> imageUrls,
                            BigDecimal basePrice,
                            String descriptionStem,
                            String accentColor) {
        List<String> stylePrefixes = List.of("Essential", "Signature", "Modern", "Elevated");
        for (int styleIndex = 0; styleIndex < stylePrefixes.size(); styleIndex++) {
            for (int productIndex = 0; productIndex < productTypes.size(); productIndex++) {
                String productType = productTypes.get(productIndex);
                String name = stylePrefixes.get(styleIndex) + " " + collection + " " + productType;
                BigDecimal price = basePrice
                        .add(BigDecimal.valueOf(styleIndex * 8L))
                        .add(BigDecimal.valueOf(productIndex * 6L))
                        .setScale(2, RoundingMode.HALF_UP);
                BigDecimal compareAtPrice = price
                        .add(BigDecimal.valueOf(18 + (styleIndex * 3L)))
                        .setScale(2, RoundingMode.HALF_UP);

                createProduct(
                        name,
                        brand,
                        subcategory,
                        descriptionStem + " " + productType + " edition with premium materials and dependable finishing.",
                        "Made for " + primaryOccasion.getName().toLowerCase(Locale.ROOT) + " moments with " + productType.toLowerCase(Locale.ROOT) + " styling.",
                        imageUrls.get((styleIndex + productIndex) % imageUrls.size()),
                        category,
                        new LinkedHashSet<>(List.of(primaryOccasion, secondaryOccasion)),
                        price,
                        compareAtPrice,
                        styleIndex == 0 && productIndex < 3,
                        accentColor,
                        4.1 + ((styleIndex + productIndex) % 8) * 0.1,
                        24 + (styleIndex * 11) + (productIndex * 7),
                        18 + (styleIndex * 5) + (productIndex * 4),
                        buildPricePoints(price, compareAtPrice)
                );
            }
        }
    }

    private List<String> buildPricePoints(BigDecimal currentPrice, BigDecimal compareAtPrice) {
        BigDecimal delta = compareAtPrice.subtract(currentPrice).divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
        return List.of(
                compareAtPrice.setScale(2, RoundingMode.HALF_UP).toPlainString(),
                compareAtPrice.subtract(delta).setScale(2, RoundingMode.HALF_UP).toPlainString(),
                compareAtPrice.subtract(delta.multiply(BigDecimal.valueOf(2))).setScale(2, RoundingMode.HALF_UP).toPlainString(),
                compareAtPrice.subtract(delta.multiply(BigDecimal.valueOf(3))).setScale(2, RoundingMode.HALF_UP).toPlainString(),
                currentPrice.setScale(2, RoundingMode.HALF_UP).toPlainString()
        );
    }

    private double roundRating(double rating) {
        return BigDecimal.valueOf(rating).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private String defaultOccasionIcon(String name) {
        return switch (name.toLowerCase(Locale.ROOT)) {
            case "casual" -> "CAS";
            case "party" -> "PRY";
            case "formal" -> "FRM";
            case "festive" -> "FST";
            case "sports" -> "SPT";
            default -> name.substring(0, Math.min(3, name.length())).toUpperCase(Locale.ROOT);
        };
    }

    private String resolveSubcategory(Category category, String productName) {
        String lowerName = productName.toLowerCase(Locale.ROOT);
        if (category.getSlug().equals("men-clothing")) {
            return lowerName.contains("formal") || lowerName.contains("office") ? "Formal Wear" : "Casual Wear";
        }
        if (category.getSlug().equals("women-clothing")) {
            return lowerName.contains("party") || lowerName.contains("evening") ? "Party Wear" : "Everyday";
        }
        if (category.getSlug().equals("kids")) {
            return "Kids";
        }
        if (lowerName.contains("kids") || lowerName.contains("mini")) {
            return "Kids";
        }
        if (category.getSlug().equals("electronics")) {
            return "Gadgets";
        }
        if (category.getSlug().equals("accessories")) {
            return "Essentials";
        }
        if (category.getSlug().equals("footwear")) {
            if (lowerName.contains("heels") || lowerName.contains("sandals")) {
                return "Women";
            }
            if (lowerName.contains("school")) {
                return "Kids";
            }
            return "Men";
        }
        if (lowerName.contains("dress")
                || lowerName.contains("linen")
                || lowerName.contains("bag")
                || lowerName.contains("shoulder")
                || lowerName.contains("satin")) {
            return "Women";
        }
        return "Men";
    }
}
