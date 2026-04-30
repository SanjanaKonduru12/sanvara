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
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class DtoMapper {

    private static final String DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80";

    private DtoMapper() {
    }

    public static ProductDtos.CategorySummary toCategorySummary(Category category) {
        if (category == null) {
            return null;
        }

        return new ProductDtos.CategorySummary(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl()
        );
    }

    public static ProductDtos.OccasionSummary toOccasionSummary(Occasion occasion) {
        if (occasion == null) {
            return null;
        }

        return new ProductDtos.OccasionSummary(
                occasion.getId(),
                occasion.getName(),
                occasion.getSlug(),
                occasion.getIcon(),
                occasion.getDescription()
        );
    }

    public static ProductDtos.ProductCard toProductCard(Product product) {
        if (product == null) {
            return null;
        }

        List<String> occasions = Optional.ofNullable(product.getOccasions()).orElseGet(Collections::emptySet).stream()
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
        String reviewerName = "Customer";
        if (review.getUser() != null) {
            reviewerName = List.of(review.getUser().getFirstName(), review.getUser().getLastName()).stream()
                    .filter(name -> name != null && !name.isBlank())
                    .collect(Collectors.joining(" "));
            if (reviewerName.isBlank()) {
                reviewerName = review.getUser().getEmail();
            }
        }

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
        BigDecimal unitPrice = Optional.ofNullable(item.getProduct())
                .map(Product::getPrice)
                .orElse(BigDecimal.ZERO);
        int quantity = Optional.ofNullable(item.getQuantity()).orElse(0);
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        return new ShopperDtos.CartItemView(
                item.getId(),
                quantity,
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
        if (product != null && product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            return product.getImageUrl();
        }

        if (product != null
                && product.getCategory() != null
                && product.getCategory().getImageUrl() != null
                && !product.getCategory().getImageUrl().isBlank()) {
            return product.getCategory().getImageUrl();
        }

        return DEFAULT_PRODUCT_IMAGE;
    }
}
