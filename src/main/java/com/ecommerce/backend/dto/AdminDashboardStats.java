package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;   // PLACED
    private long shippedOrders;   // SHIPPED
    private long deliveredOrders; // DELIVERED
    private BigDecimal totalRevenue;
}
