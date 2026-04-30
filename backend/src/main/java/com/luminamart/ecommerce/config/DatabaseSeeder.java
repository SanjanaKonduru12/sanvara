package com.luminamart.ecommerce.config;

import com.luminamart.ecommerce.model.Category;
import com.luminamart.ecommerce.model.Occasion;
import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.repository.CategoryRepository;
import com.luminamart.ecommerce.repository.OccasionRepository;
import com.luminamart.ecommerce.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseSeeder {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Bean
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
    public CommandLineRunner seedDatabase(ProductRepository productRepository,
                                          CategoryRepository categoryRepository,
                                          OccasionRepository occasionRepository) {
        return args -> {
            try {
                if (productRepository.count() > 0) {
                    return; // Database already seeded
                }

                // Categories
                Category electronics = createCategory(categoryRepository, "Electronics", "electronics", "Gadgets and devices", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80");
                Category fashion = createCategory(categoryRepository, "Fashion", "fashion", "Clothing and apparel", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80");
                Category footwear = createCategory(categoryRepository, "Footwear", "footwear", "Shoes and sneakers", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80");
                Category accessories = createCategory(categoryRepository, "Accessories", "accessories", "Watches, bags, and more", "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80");

                List<Category> categories = List.of(electronics, fashion, footwear, accessories);

                // Occasions
                Occasion casual = createOccasion(occasionRepository, "Casual Outing", "casual", "Everyday casual wear");
                Occasion formal = createOccasion(occasionRepository, "Formal Event", "formal", "Business and formal occasions");
                Occasion sport = createOccasion(occasionRepository, "Sports & Active", "sport", "Gym and outdoor activities");
                Occasion travel = createOccasion(occasionRepository, "Travel", "travel", "Travel and vacation essentials");

                List<Occasion> occasions = List.of(casual, formal, sport, travel);

                // Product Data arrays for combinations
                String[] brands = {"Nike", "Adidas", "Apple", "Samsung", "Sony", "Puma", "Casio", "Levi's", "H&M", "Zara"};
                String[] adjectives = {"Premium", "Classic", "Modern", "Essential", "Pro", "Ultra", "Slim", "Comfort", "Vintage", "Sport"};
                String[] nouns = {"Sneakers", "T-Shirt", "Headphones", "Watch", "Jacket", "Backpack", "Jeans", "Smartphone", "Boots", "Hoodie"};

                String[] imageUrsl = {
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", // red nike
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", // headphones
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", // watch
                "https://images.unsplash.com/photo-1572569438068-4098d8ce2f20?w=600&q=80", // smartwatch
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", // hoodie
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", // black t-shirt
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", // black shirt
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80", // green nike
                "https://images.unsplash.com/photo-1551028719-01c1eb562251?w=600&q=80", // white sneakers
                "https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=600&q=80"  // backpack
                };

                Random random = new Random(42);
                List<Product> products = new ArrayList<>();

                for (int i = 1; i <= 100; i++) {
                    String brand = brands[random.nextInt(brands.length)];
                    String name = brand + " " + adjectives[random.nextInt(adjectives.length)] + " " + nouns[random.nextInt(nouns.length)];
                    Category category = categories.get(random.nextInt(categories.size()));
                    Occasion occasion = occasions.get(random.nextInt(occasions.size()));
                    String imageUrl = imageUrsl[random.nextInt(imageUrsl.length)];

                    double basePrice = 20 + random.nextInt(280);
                    double rating = 3.5 + (random.nextDouble() * 1.5);

                    Product product = new Product();
                    product.setName(name);
                    product.setBrand(brand);
                    product.setSubcategory(category.getName() + " Items");
                    product.setDescription("This is a high-quality " + name + " perfect for everyday use. Made with the finest materials to ensure durability and style. Enhance your lifestyle with this premium product from " + brand + ".");
                    product.setShortDescription("Premium " + name + " by " + brand);
                    product.setImageUrl(imageUrl);
                    product.setPrice(BigDecimal.valueOf(basePrice));

                    if (random.nextBoolean()) {
                        product.setCompareAtPrice(BigDecimal.valueOf(basePrice * (1.2 + random.nextDouble() * 0.3)));
                    }

                    product.setRatingAverage((double) Math.round(rating * 10) / 10);
                    product.setReviewCount(random.nextInt(500) + 10);
                    product.setStockCount(random.nextInt(100) + 5);
                    product.setFeatured(random.nextInt(10) > 8); // ~10% featured
                    product.setAccentColor("#2563eb");
                    product.setCategory(category);
                    product.setOccasions(Set.of(occasion));

                    products.add(product);
                }

                productRepository.saveAll(products);
                log.info("Seeded 100 products to the database.");
            } catch (DataAccessException ex) {
                log.warn("Skipping demo database seed because the database is not available: {}", ex.getMostSpecificCause().getMessage());
            }
        };
    }

    private Category createCategory(CategoryRepository repo, String name, String slug, String desc, String image) {
        return repo.findBySlug(slug).orElseGet(() -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setSlug(slug);
            cat.setDescription(desc);
            cat.setImageUrl(image);
            return repo.save(cat);
        });
    }

    private Occasion createOccasion(OccasionRepository repo, String name, String slug, String desc) {
        return repo.findBySlugIgnoreCase(slug).orElseGet(() -> {
            Occasion occ = new Occasion();
            occ.setName(name);
            occ.setSlug(slug);
            occ.setDescription(desc);
            occ.setIcon("star"); // default icon
            return repo.save(occ);
        });
    }
}
