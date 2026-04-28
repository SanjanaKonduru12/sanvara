package com.luminamart.ecommerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class ShopperDtos {

    private ShopperDtos() {
    }

    public record CartRequest(
            @NotNull Long productId,
            @NotNull @Min(1) Integer quantity,
            String sizeOption,
            String colorOption
    ) {
    }

    public record UpdateCartRequest(
            @NotNull @Min(1) Integer quantity
    ) {
    }

    public record CartItemView(
            Long id,
            Integer quantity,
            String sizeOption,
            String colorOption,
            ProductDtos.ProductCard product,
            BigDecimal totalPrice
    ) {
    }

    public record CartSummary(
            List<CartItemView> items,
            Integer totalItems,
            BigDecimal subtotal
    ) {
    }

    public record CheckoutRequest(
            @NotBlank String shippingName,
            @NotBlank String shippingAddress,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank String postalCode,
            @NotBlank String paymentMethod
    ) {
    }

    public record OrderItemView(
            Long id,
            String productName,
            String productImage,
            Integer quantity,
            BigDecimal unitPrice,
            String sizeOption,
            String colorOption
    ) {
    }

    public record OrderView(
            Long id,
            String orderNumber,
            String status,
            BigDecimal totalAmount,
            Integer itemCount,
            String shippingName,
            String shippingAddress,
            String city,
            String state,
            String postalCode,
            String paymentMethod,
            LocalDateTime placedAt,
            List<OrderItemView> items
    ) {
    }

    public record ReviewRequest(
            @NotNull @Min(1) @Max(5) Integer rating,
            @NotBlank String title,
            @NotBlank String comment
    ) {
    }

    public record PriceAlertRequest(
            @NotNull Long productId,
            @NotNull @DecimalMin("1.0") BigDecimal targetPrice
    ) {
    }

    public record PriceAlertView(
            Long id,
            BigDecimal targetPrice,
            Boolean enabled,
            Boolean triggered,
            LocalDateTime createdAt,
            ProductDtos.ProductCard product
    ) {
    }

    public record DashboardView(
            CartSummary cart,
            Integer wishlistCount,
            Integer alertCount,
            Integer triggeredAlertCount,
            List<OrderView> recentOrders
    ) {
    }
}
