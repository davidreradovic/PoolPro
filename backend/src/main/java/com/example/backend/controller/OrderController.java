package com.example.backend.controller;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderHasItemRepository orderHasItemRepository;
    private final OrderComplaintRepository orderComplaintRepository;
    private final CartRepository cartRepository;
    private final CartHasItemRepository cartHasItemRepository;
    private final ClientRepository clientRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderHasItemRepository orderHasItemRepository,
            OrderComplaintRepository orderComplaintRepository,
            CartRepository cartRepository,
            CartHasItemRepository cartHasItemRepository,
            ClientRepository clientRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderHasItemRepository = orderHasItemRepository;
        this.orderComplaintRepository = orderComplaintRepository;
        this.cartRepository = cartRepository;
        this.cartHasItemRepository = cartHasItemRepository;
        this.clientRepository = clientRepository;
    }

    @PostMapping("/checkout/{clientId}")
    @PreAuthorize("hasRole('CLIENT')")
    public Object checkout(
            @PathVariable Integer clientId,
            @RequestBody Map<String, Object> request
    ) {
        String address = (String) request.get("address");

        if (address == null || address.trim().isEmpty()) {
            return "Address is required";
        }

        Client client = clientRepository.findById(clientId).orElse(null);

        if (client == null) {
            return "Client not found";
        }

        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);

        if (cart == null) {
            return "Cart not found";
        }

        var cartItems = cartHasItemRepository.findByCart_IdCart(cart.getIdCart());

        if (cartItems.isEmpty()) {
            return "Cart is empty";
        }

        BigDecimal total = cartItems.stream()
                .map(ci -> ci.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setClient(client);
        order.setAddress(address);
        order.setStatus(Order.OrderStatus.pending);
        order.setTotalPrice(total);

        Order savedOrder = orderRepository.save(order);

        for (CartHasItem cartItem : cartItems) {
            OrderHasItemId id = new OrderHasItemId(
                    savedOrder.getIdOrder(),
                    cartItem.getItem().getIdItem()
            );

            OrderHasItem orderItem = new OrderHasItem();
            orderItem.setId(id);
            orderItem.setOrder(savedOrder);
            orderItem.setItem(cartItem.getItem());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());

            orderHasItemRepository.save(orderItem);
        }

        cartHasItemRepository.deleteAll(cartItems);

        return Map.of(
                "idOrder", savedOrder.getIdOrder(),
                "clientId", savedOrder.getClient().getIdClient(),
                "status", savedOrder.getStatus(),
                "totalPrice", savedOrder.getTotalPrice(),
                "address", savedOrder.getAddress(),
                "message", "Order created successfully"
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapOrder)
                .toList();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getOrderById(@PathVariable Integer orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return "Order not found";
        }

        var items = orderHasItemRepository.findByOrder_IdOrder(orderId);

        return Map.of(
                "idOrder", order.getIdOrder(),
                "clientId", order.getClient().getIdClient(),
                "status", order.getStatus(),
                "totalPrice", order.getTotalPrice(),
                "address", order.getAddress(),
                "createdAt", order.getCreatedAt(),
                "items", items.stream()
                        .map(oi -> Map.of(
                                "idItem", oi.getItem().getIdItem(),
                                "title", oi.getItem().getTitle(),
                                "quantity", oi.getQuantity(),
                                "price", oi.getPrice(),
                                "subtotal", oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity()))
                        ))
                        .toList()
        );
    }

    @GetMapping("/client/{clientId}")
   @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getOrdersByClient(@PathVariable Integer clientId) {
        return orderRepository.findByClient_IdClient(clientId)
                .stream()
                .map(this::mapOrder)
                .toList();
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestParam Order.OrderStatus status
    ) {
        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return "Order not found";
        }

        order.setStatus(status);
        Order saved = orderRepository.save(order);

        return Map.of(
                "idOrder", saved.getIdOrder(),
                "status", saved.getStatus(),
                "message", "Order status updated"
        );
    }

    @PostMapping("/{orderId}/complaints")
    @PreAuthorize("hasRole('CLIENT')")
    public Object createComplaint(
            @PathVariable Integer orderId,
            @RequestBody Map<String, Object> request
    ) {

        String comment = (String) request.get("comment");

        if (comment == null || comment.trim().isEmpty()) {
            return "Complaint comment is required";
        }

        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return "Order not found";
        }

        OrderComplaint complaint = new OrderComplaint();
        complaint.setOrder(order);
        complaint.setComment(comment);

        OrderComplaint saved = orderComplaintRepository.save(complaint);
        Map<String, Object> response = new HashMap<>();

        response.put("idOrderComplaint", saved.getIdOrderComplaint());
        response.put("orderId", order.getIdOrder());
        response.put("comment", saved.getComment());
        response.put("timestamp", saved.getTimestamp());

        return response;
    }

    @GetMapping("/{orderId}/complaints")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getComplaints(@PathVariable Integer orderId) {
        return orderComplaintRepository.findByOrder_IdOrder(orderId)
                .stream()
                .map(c -> Map.of(
                        "idOrderComplaint", c.getIdOrderComplaint(),
                        "comment", c.getComment(),
                        "timestamp", c.getTimestamp()
                ))
                .toList();
    }

    private Map<String, Object> mapOrder(Order order) {
        return Map.of(
                "idOrder", order.getIdOrder(),
                "clientId", order.getClient().getIdClient(),
                "status", order.getStatus(),
                "totalPrice", order.getTotalPrice(),
                "address", order.getAddress(),
                "createdAt", order.getCreatedAt()
        );
    }
}