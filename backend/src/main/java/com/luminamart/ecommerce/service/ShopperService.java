package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.dto.ProductDtos;
import com.luminamart.ecommerce.dto.ShopperDtos;
import com.luminamart.ecommerce.model.CartItem;
import com.luminamart.ecommerce.model.CustomerOrder;
import com.luminamart.ecommerce.model.OrderItem;
import com.luminamart.ecommerce.model.PriceAlert;
import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.model.Review;
import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.model.WishlistItem;
import com.luminamart.ecommerce.repository.CartItemRepository;
import com.luminamart.ecommerce.repository.CustomerOrderRepository;
import com.luminamart.ecommerce.repository.PriceAlertRepository;
import com.luminamart.ecommerce.repository.ProductRepository;
import com.luminamart.ecommerce.repository.ReviewRepository;
import com.luminamart.ecommerce.repository.WishlistItemRepository;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShopperService {
    private static final Logger log = LoggerFactory.getLogger(ShopperService.class);

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CustomerOrderRepository orderRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final PriceAlertRepository priceAlertRepository;
    private final ReviewRepository reviewRepository;

    public ShopperService(CartItemRepository cartItemRepository,
                          ProductRepository productRepository,
                          CustomerOrderRepository orderRepository,
                          WishlistItemRepository wishlistItemRepository,
                          PriceAlertRepository priceAlertRepository,
                          ReviewRepository reviewRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.priceAlertRepository = priceAlertRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public ShopperDtos.CartSummary getCart(User user) {
        List<CartItem> items = cartItemRepository.findByUser(user);
        List<ShopperDtos.CartItemView> views = items.stream()
                .map(DtoMapper::toCartItemView)
                .collect(Collectors.toList());
        BigDecimal subtotal = views.stream()
                .map(ShopperDtos.CartItemView::totalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = views.stream().mapToInt(ShopperDtos.CartItemView::quantity).sum();

        return new ShopperDtos.CartSummary(views, totalItems, subtotal);
    }

    @Transactional
    public ShopperDtos.CartItemView addCartItem(User user, ShopperDtos.CartRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        if (request.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be at least 1.");
        }

        ensureStockAvailable(product, request.quantity());

        String normalizedSize = normalizeOption(request.sizeOption());
        String normalizedColor = normalizeOption(request.colorOption());

        CartItem item = cartItemRepository.findByUser(user).stream()
                .filter(existing -> existing.getProduct().getId().equals(product.getId()))
                .filter(existing -> sameOption(existing.getSizeOption(), normalizedSize))
                .filter(existing -> sameOption(existing.getColorOption(), normalizedColor))
                .findFirst()
                .orElseGet(CartItem::new);

        item.setUser(user);
        item.setProduct(product);
        item.setQuantity((item.getQuantity() == null ? 0 : item.getQuantity()) + request.quantity());
        item.setSizeOption(normalizedSize);
        item.setColorOption(normalizedColor);

        ensureStockAvailable(product, item.getQuantity());

        cartItemRepository.save(item);
        return DtoMapper.toCartItemView(item);
    }

    @Transactional
    public ShopperDtos.CartItemView updateCartItem(User user, Long itemId, ShopperDtos.UpdateCartRequest request) {
        CartItem item = cartItemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found."));

        ensureStockAvailable(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return DtoMapper.toCartItemView(item);
    }

    @Transactional
    public void removeCartItem(User user, Long itemId) {
        CartItem item = cartItemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found."));
        cartItemRepository.delete(item);
    }

    @Transactional
    public ShopperDtos.OrderView checkout(User user, ShopperDtos.CheckoutRequest request) {
        ShopperDtos.CartSummary cart = getCart(user);
        if (cart.items().isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty.");
        }

        for (ShopperDtos.CartItemView view : cart.items()) {
            Product product = productRepository.findById(view.product().id())
                    .orElseThrow(() -> new IllegalArgumentException("A product in your cart is no longer available."));
            ensureStockAvailable(product, view.quantity());
            product.setStockCount(product.getStockCount() - view.quantity());
            productRepository.save(product);
        }

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber("LM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setStatus(com.luminamart.ecommerce.model.OrderStatus.PLACED);
        order.setTotalAmount(cart.subtotal());
        order.setItemCount(cart.totalItems());
        order.setShippingName(request.shippingName());
        order.setShippingAddress(request.shippingAddress());
        order.setCity(request.city());
        order.setState(request.state());
        order.setPostalCode(request.postalCode());
        order.setPaymentMethod(request.paymentMethod());
        order.setUser(user);

        order.setStatus(com.luminamart.ecommerce.model.OrderStatus.PLACED);
        order.setTotalAmount(cart.subtotal());
        order.setItemCount(cart.totalItems());
        order.setShippingName(request.shippingName());
        order.setShippingAddress(request.shippingAddress());
        order.setCity(request.city());
        order.setState(request.state());
        order.setPostalCode(request.postalCode());
        order.setPaymentMethod(request.paymentMethod());
        order.setUser(user);

        List<OrderItem> items = cart.items().stream().map(view -> {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(view.product().id() != null ? productRepository.findById(view.product().id()).orElse(null) : null);
            item.setQuantity(view.quantity());
            item.setUnitPrice(view.product().price());
            item.setColorOption(view.colorOption());
            item.setProductNameSnapshot(view.product().name());
            item.setProductImageSnapshot(view.product().imageUrl());
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);
        CustomerOrder savedOrder = orderRepository.save(order);
        cartItemRepository.deleteByUser(user);
        return mapOrder(savedOrder);
    }

    @Transactional
    public void cancelOrder(User user, Long orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to cancel this order.");
        }

        if (order.getStatus() == com.luminamart.ecommerce.model.OrderStatus.SHIPPED || 
            order.getStatus() == com.luminamart.ecommerce.model.OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel an order that has already been shipped or delivered.");
        }

        order.setStatus(com.luminamart.ecommerce.model.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        log.info("Order {} successfully cancelled by user {}", order.getOrderNumber(), user.getEmail());

        // Optionally restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product p = item.getProduct();
                p.setStockCount(p.getStockCount() + item.getQuantity());
                productRepository.save(p);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ShopperDtos.OrderView> getOrders(User user) {
        return orderRepository.findByUserOrderByPlacedAtDesc(user).stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDtos.ReviewView addReview(User user, Long productId, ShopperDtos.ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        Review review = reviewRepository.findByProductAndUser(product, user).orElseGet(Review::new);
        Integer previousRating = review.getId() == null ? null : review.getRating();

        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.rating());
        review.setTitle(request.title().trim());
        review.setComment(request.comment().trim());
        reviewRepository.save(review);

        double totalScore = product.getRatingAverage() * product.getReviewCount();
        if (previousRating == null) {
            totalScore += request.rating();
            product.setReviewCount(product.getReviewCount() + 1);
        } else {
            totalScore = totalScore - previousRating + request.rating();
        }
        product.setRatingAverage(totalScore / product.getReviewCount());
        productRepository.save(product);

        return DtoMapper.toReviewView(review);
    }

    @Transactional(readOnly = true)
    public List<ShopperDtos.PriceAlertView> getAlerts(User user) {
        return priceAlertRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(DtoMapper::toAlertView)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShopperDtos.PriceAlertView createAlert(User user, ShopperDtos.PriceAlertRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        PriceAlert alert = new PriceAlert();
        alert.setProduct(product);
        alert.setUser(user);
        alert.setTargetPrice(request.targetPrice());
        alert.setEnabled(true);
        alert.setTriggered(false);
        priceAlertRepository.save(alert);
        return DtoMapper.toAlertView(alert);
    }

    @Transactional
    public ShopperDtos.PriceAlertView updateAlertStatus(User user, Long alertId, boolean enabled) {
        PriceAlert alert = priceAlertRepository.findByIdAndUser(alertId, user)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found."));
        alert.setEnabled(enabled);
        priceAlertRepository.save(alert);
        return DtoMapper.toAlertView(alert);
    }

    @Transactional(readOnly = true)
    public List<ShopperDtos.CartItemView> getWishlist(User user) {
        return wishlistItemRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(item -> DtoMapper.toCartItemView(buildCartItemFromWishlist(item)))
                .collect(Collectors.toList());
    }

    @Transactional
    public ShopperDtos.CartItemView addWishlistItem(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        Optional<WishlistItem> existingItem = wishlistItemRepository.findByUserAndProduct(user, product);
        if (existingItem.isPresent()) {
            return DtoMapper.toCartItemView(buildCartItemFromWishlist(existingItem.get()));
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        wishlistItemRepository.save(item);
        return DtoMapper.toCartItemView(buildCartItemFromWishlist(item));
    }

    @Transactional
    public void removeWishlistItem(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        wishlistItemRepository.deleteByUserAndProduct(user, product);
    }

    @Transactional(readOnly = true)
    public ShopperDtos.DashboardView getDashboard(User user) {
        ShopperDtos.CartSummary cart = getCart(user);
        int wishlistCount = wishlistItemRepository.findByUserOrderByCreatedAtDesc(user).size();
        List<ShopperDtos.PriceAlertView> alerts = getAlerts(user);
        int triggeredCount = (int) alerts.stream().filter(ShopperDtos.PriceAlertView::triggered).count();
        List<ShopperDtos.OrderView> recentOrders = getOrders(user).stream().limit(3).collect(Collectors.toList());

        return new ShopperDtos.DashboardView(cart, wishlistCount, alerts.size(), triggeredCount, recentOrders);
    }

    private ShopperDtos.OrderView mapOrder(CustomerOrder order) {
        List<ShopperDtos.OrderItemView> items = Optional.ofNullable(order.getItems()).orElseGet(Collections::emptyList).stream()
                .map(DtoMapper::toOrderItemView)
                .collect(Collectors.toList());
        return new ShopperDtos.OrderView(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus() == null ? "PLACED" : order.getStatus().name(),
                Optional.ofNullable(order.getTotalAmount()).orElse(BigDecimal.ZERO),
                Optional.ofNullable(order.getItemCount()).orElse(0),
                order.getShippingName(),
                order.getShippingAddress(),
                order.getCity(),
                order.getState(),
                order.getPostalCode(),
                order.getPaymentMethod(),
                order.getPlacedAt(),
                items
        );
    }

    private CartItem buildCartItemFromWishlist(WishlistItem wishlistItem) {
        CartItem cartItem = new CartItem();
        cartItem.setId(wishlistItem.getId());
        cartItem.setProduct(wishlistItem.getProduct());
        cartItem.setUser(wishlistItem.getUser());
        cartItem.setQuantity(1);
        return cartItem;
    }

    private void ensureStockAvailable(Product product, int quantity) {
        if (product.getStockCount() == null || product.getStockCount() <= 0) {
            throw new IllegalArgumentException("This product is currently out of stock.");
        }
        if (quantity > product.getStockCount()) {
            throw new IllegalArgumentException("Only " + product.getStockCount() + " unit(s) are available right now.");
        }
    }

    private String normalizeOption(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }

    private boolean sameOption(String left, String right) {
        String normalizedLeft = left == null ? "" : left.trim().toLowerCase(Locale.ROOT);
        String normalizedRight = right == null ? "" : right.trim().toLowerCase(Locale.ROOT);
        return normalizedLeft.equals(normalizedRight);
    }
}
