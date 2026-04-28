package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.dto.ProductDtos;
import com.luminamart.ecommerce.dto.ShopperDtos;
import com.luminamart.ecommerce.model.CartItem;
import com.luminamart.ecommerce.model.Category;
import com.luminamart.ecommerce.model.Occasion;
import com.luminamart.ecommerce.model.OrderItem;
import com.luminamart.ecommerce.model.PriceAlert;
import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.model.Review;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public final class DtoMapper {

    private static final String DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80";

    private DtoMapper() {
    }

    public static ProductDtos.CategorySummary toCategorySummary(Category category) {
        return new ProductDtos.CategorySummary(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl()
        );
    }

    public static ProductDtos.OccasionSummary toOccasionSummary(Occasion occasion) {
        return new ProductDtos.OccasionSummary(
                occasion.getId(),
                occasion.getName(),
                occasion.getSlug(),
                occasion.getIcon(),
                occasion.getDescription()
        );
    }

    public static ProductDtos.ProductCard toProductCard(Product product) {
        List<String> occasions = product.getOccasions().stream()
                .map(Occasion::getName)
                .collect(Collectors.toList());

        return new ProductDtos.ProductCard(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getSubcategory(),
                product.getShortDescription(),
                resolveProductImage(product),
                product.getPrice(),
                product.getCompareAtPrice(),
                product.getRatingAverage(),
                product.getReviewCount(),
                product.getStockCount(),
                product.getFeatured(),
                product.getAccentColor(),
                toCategorySummary(product.getCategory()),
                occasions
        );
    }

    public static ProductDtos.ReviewView toReviewView(Review review) {
        String reviewerName = review.getUser().getFirstName() + " " + review.getUser().getLastName();
        return new ProductDtos.ReviewView(
                review.getId(),
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                reviewerName,
                review.getCreatedAt()
        );
    }

    public static ShopperDtos.CartItemView toCartItemView(CartItem item) {
        ProductDtos.ProductCard productCard = toProductCard(item.getProduct());
        BigDecimal totalPrice = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new ShopperDtos.CartItemView(
                item.getId(),
                item.getQuantity(),
                item.getSizeOption(),
                item.getColorOption(),
                productCard,
                totalPrice
        );
    }

    public static ShopperDtos.OrderItemView toOrderItemView(OrderItem item) {
        return new ShopperDtos.OrderItemView(
                item.getId(),
                item.getProductNameSnapshot(),
                item.getProductImageSnapshot(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSizeOption(),
                item.getColorOption()
        );
    }

    public static ShopperDtos.PriceAlertView toAlertView(PriceAlert alert) {
        return new ShopperDtos.PriceAlertView(
                alert.getId(),
                alert.getTargetPrice(),
                alert.getEnabled(),
                alert.getTriggered(),
                alert.getCreatedAt(),
                toProductCard(alert.getProduct())
        );
    }

    private static String resolveProductImage(Product product) {
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            return product.getImageUrl();
        }

        if (product.getCategory() != null
                && product.getCategory().getImageUrl() != null
                && !product.getCategory().getImageUrl().isBlank()) {
            return product.getCategory().getImageUrl();
        }

        return DEFAULT_PRODUCT_IMAGE;
    }
}
