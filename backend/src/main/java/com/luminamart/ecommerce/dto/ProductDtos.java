package com.luminamart.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ProductDtos {

    private ProductDtos() {
    }

    public record CategorySummary(
            Long id,
            String name,
            String slug,
            String description,
            String imageUrl
    ) {
    }

    public record OccasionSummary(
            Long id,
            String name,
            String slug,
            String icon,
            String description
    ) {
    }

    public record ProductCard(
            Long id,
            String name,
            String brand,
            String subcategory,
            String shortDescription,
            String imageUrl,
            BigDecimal price,
            BigDecimal compareAtPrice,
            Double ratingAverage,
            Integer reviewCount,
            Integer stockCount,
            Boolean featured,
            String accentColor,
            CategorySummary category,
            List<String> occasions
    ) {
    }

    public record ProductDetail(
            ProductCard product,
            String description,
            List<ReviewView> reviews,
            PriceInsight priceInsight
    ) {
    }

    public record ReviewView(
            Long id,
            Integer rating,
            String title,
            String comment,
            String reviewerName,
            LocalDateTime createdAt
    ) {
    }

    public record PricePoint(
            LocalDate recordedAt,
            BigDecimal price
    ) {
    }

    public record PriceInsight(
            BigDecimal currentPrice,
            BigDecimal lowestPrice,
            BigDecimal highestPrice,
            BigDecimal averagePrice,
            BigDecimal predictedNextPrice,
            String recommendation,
            List<PricePoint> history
    ) {
    }

    public record HomeResponse(
            List<CategorySummary> categories,
            List<OccasionSummary> moods,
            List<ProductCard> featuredProducts,
            List<ProductCard> newestProducts
    ) {
    }
}
