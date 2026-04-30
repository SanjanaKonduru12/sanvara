package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.dto.ProductDtos;
import com.luminamart.ecommerce.model.Occasion;
import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.model.Review;
import com.luminamart.ecommerce.repository.CategoryRepository;
import com.luminamart.ecommerce.repository.OccasionRepository;
import com.luminamart.ecommerce.repository.PriceHistoryRepository;
import com.luminamart.ecommerce.repository.ProductRepository;
import com.luminamart.ecommerce.repository.ReviewRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OccasionRepository occasionRepository;
    private final ReviewRepository reviewRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          OccasionRepository occasionRepository,
                          ReviewRepository reviewRepository,
                          PriceHistoryRepository priceHistoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.occasionRepository = occasionRepository;
        this.reviewRepository = reviewRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Transactional(readOnly = true)
    public ProductDtos.HomeResponse getHomeData() {
        List<ProductDtos.CategorySummary> categories = categoryRepository.findAll(Sort.by("name")).stream()
                .map(DtoMapper::toCategorySummary)
                .collect(Collectors.toList());

        List<ProductDtos.OccasionSummary> occasions = occasionRepository.findAll(Sort.by("name")).stream()
                .map(DtoMapper::toOccasionSummary)
                .collect(Collectors.toList());

        List<ProductDtos.ProductCard> featured = productRepository.findTop6ByFeaturedTrueOrderByRatingAverageDesc().stream()
                .map(DtoMapper::toProductCard)
                .collect(Collectors.toList());

        List<ProductDtos.ProductCard> newest = productRepository.findTop8ByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toProductCard)
                .collect(Collectors.toList());

        return new ProductDtos.HomeResponse(categories, occasions, featured, newest);
    }

    @Transactional(readOnly = true)
    public ProductDtos.ProductDetail getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        List<Review> reviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);
        List<ProductDtos.ReviewView> reviewViews = reviews.stream()
                .map(DtoMapper::toReviewView)
                .collect(Collectors.toList());

        List<ProductDtos.PricePoint> history = priceHistoryRepository.findByProductOrderByRecordedAtAsc(product).stream()
                .map(price -> new ProductDtos.PricePoint(price.getRecordedAt(), price.getPrice()))
                .collect(Collectors.toList());

        ProductDtos.PriceInsight insight = buildPriceInsight(product.getPrice(), history);
        return new ProductDtos.ProductDetail(DtoMapper.toProductCard(product), product.getDescription(), reviewViews, insight);
    }

    @Transactional(readOnly = true)
    public List<ProductDtos.ProductCard> searchProducts(String search,
                                                        String categorySlug,
                                                        Long occasionId,
                                                        String occasionName,
                                                        BigDecimal minPrice,
                                                        BigDecimal maxPrice,
                                                        Double minRating,
                                                        Boolean inStock,
                                                        String sort) {
        Specification<Product> spec = Specification.where(null);

        if (search != null && !search.isBlank()) {
            String text = "%" + normalizeKey(search) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), text),
                    cb.like(cb.lower(root.get("shortDescription")), text),
                    cb.like(cb.lower(root.get("brand")), text),
                    cb.like(cb.lower(root.get("subcategory")), text)
            ));
        }

        if (categorySlug != null && !categorySlug.isBlank()) {
            String normalizedCategory = normalizeKey(categorySlug);
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category").get("slug")), normalizedCategory));
        }

        if (occasionId != null) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                Join<Product, Occasion> join = root.join("occasions", JoinType.LEFT);
                return cb.equal(join.get("id"), occasionId);
            });
        }

        if (occasionName != null && !occasionName.isBlank()) {
            String text = normalizeKey(occasionName);
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                Join<Product, Occasion> join = root.join("occasions", JoinType.LEFT);
                return cb.or(
                        cb.equal(cb.lower(join.get("name")), text),
                        cb.equal(cb.lower(join.get("slug")), text)
                );
            });
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.ge(root.get("price"), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.le(root.get("price"), maxPrice));
        }

        if (minRating != null) {
            spec = spec.and((root, query, cb) -> cb.ge(root.get("ratingAverage"), minRating));
        }

        if (Boolean.TRUE.equals(inStock)) {
            spec = spec.and((root, query, cb) -> cb.gt(root.get("stockCount"), 0));
        }

        Sort sortOrder = resolveSort(sort);
        return productRepository.findAll(spec, sortOrder).stream()
                .map(DtoMapper::toProductCard)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDtos.ProductCard> getRecommendations(Long occasionId) {
        if (occasionId == null) {
            return productRepository.findTop6ByFeaturedTrueOrderByRatingAverageDesc().stream()
                    .map(DtoMapper::toProductCard)
                    .collect(Collectors.toList());
        }

        Occasion occasion = occasionRepository.findById(occasionId)
                .orElseThrow(() -> new IllegalArgumentException("Occasion not found."));

        Specification<Product> spec = (root, query, cb) -> {
            query.distinct(true);
            Join<Product, Occasion> join = root.join("occasions", JoinType.LEFT);
            return cb.equal(join.get("id"), occasion.getId());
        };

        return productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "ratingAverage")).stream()
                .map(DtoMapper::toProductCard)
                .collect(Collectors.toList());
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sort) {
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "ratingAverage");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private ProductDtos.PriceInsight buildPriceInsight(BigDecimal currentPrice, List<ProductDtos.PricePoint> history) {
        BigDecimal normalizedCurrentPrice = Optional.ofNullable(currentPrice).orElse(BigDecimal.ZERO);
        List<ProductDtos.PricePoint> normalizedHistory = Optional.ofNullable(history).orElseGet(Collections::emptyList);

        if (normalizedHistory.isEmpty()) {
            return new ProductDtos.PriceInsight(
                    normalizedCurrentPrice,
                    normalizedCurrentPrice,
                    normalizedCurrentPrice,
                    normalizedCurrentPrice,
                    normalizedCurrentPrice,
                    "Price data is loading.",
                    normalizedHistory
            );
        }

        BigDecimal lowest = normalizedHistory.stream().map(ProductDtos.PricePoint::price).min(BigDecimal::compareTo).orElse(normalizedCurrentPrice);
        BigDecimal highest = normalizedHistory.stream().map(ProductDtos.PricePoint::price).max(BigDecimal::compareTo).orElse(normalizedCurrentPrice);
        BigDecimal average = normalizedHistory.stream()
                .map(ProductDtos.PricePoint::price)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(normalizedHistory.size()), 2, RoundingMode.HALF_UP);

        BigDecimal predicted = normalizedCurrentPrice;
        if (normalizedHistory.size() >= 2) {
            BigDecimal firstPrice = normalizedHistory.get(0).price();
            BigDecimal latestPrice = normalizedHistory.get(normalizedHistory.size() - 1).price();
            BigDecimal trend = latestPrice.subtract(firstPrice)
                    .divide(BigDecimal.valueOf(normalizedHistory.size() - 1), 2, RoundingMode.HALF_UP);
            predicted = latestPrice.add(trend.multiply(BigDecimal.valueOf(0.75)));
            if (predicted.compareTo(BigDecimal.ZERO) < 0) {
                predicted = latestPrice;
            }
        }

        String recommendation = predicted.compareTo(normalizedCurrentPrice) <= 0
                ? "The product is trending downward. Great time to buy."
                : "Price may climb soon. Grab it while it is still affordable.";

        return new ProductDtos.PriceInsight(normalizedCurrentPrice, lowest, highest, average, predicted, recommendation, normalizedHistory);
    }

    private String normalizeKey(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
