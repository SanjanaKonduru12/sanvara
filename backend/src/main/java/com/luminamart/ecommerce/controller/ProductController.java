package com.luminamart.ecommerce.controller;

import com.luminamart.ecommerce.dto.ProductDtos;
import com.luminamart.ecommerce.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/home")
    public ResponseEntity<ProductDtos.HomeResponse> home() {
        return ResponseEntity.ok(productService.getHomeData());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ProductDtos.CategorySummary>> categories() {
        return ResponseEntity.ok(productService.getHomeData().categories());
    }

    @GetMapping("/occasions")
    public ResponseEntity<List<ProductDtos.OccasionSummary>> occasions() {
        return ResponseEntity.ok(productService.getHomeData().moods());
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDtos.ProductCard>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long occasionId,
            @RequestParam(required = false, name = "occasion") String occasionName,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(productService.searchProducts(
                query,
                category,
                occasionId,
                occasionName,
                minPrice,
                maxPrice,
                minRating,
                inStock,
                sort
        ));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDtos.ProductDetail> productDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<ProductDtos.ProductCard>> recommendations(@RequestParam(required = false) Long occasionId) {
        return ResponseEntity.ok(productService.getRecommendations(occasionId));
    }
}
