package com.example.backend.controller;

import com.example.backend.dto.CheckoutRequest;
import com.example.backend.dto.CreateComplaintRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import jakarta.validation.Valid;
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
    private final ItemRepository itemRepository;
    private final MessageRepository messageRepository;
    private final SupervisorRepository supervisorRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderHasItemRepository orderHasItemRepository,
            OrderComplaintRepository orderComplaintRepository,
            CartRepository cartRepository,
            CartHasItemRepository cartHasItemRepository,
            ClientRepository clientRepository,
            ItemRepository itemRepository,
            MessageRepository messageRepository,
            SupervisorRepository supervisorRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderHasItemRepository = orderHasItemRepository;
        this.orderComplaintRepository = orderComplaintRepository;
        this.cartRepository = cartRepository;
        this.cartHasItemRepository = cartHasItemRepository;
        this.clientRepository = clientRepository;
        this.itemRepository = itemRepository;
        this.messageRepository = messageRepository;
        this.supervisorRepository = supervisorRepository;
    }

    @PostMapping("/checkout/{clientId}")
    @PreAuthorize("hasRole('CLIENT')")
    public Object checkout(
            @PathVariable Integer clientId,
            @Valid @RequestBody CheckoutRequest request
    ) {
        String address = request.getAddress();

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

        for (CartHasItem cartItem : cartItems) {
            Item item = cartItem.getItem();
            if (item.getQuantity() == null || item.getQuantity() < cartItem.getQuantity()) {
                return "Not enough stock for item: " + item.getTitle();
            }
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

        Map<String, Object> response = new HashMap<>();
        User clientUser = order.getClient().getUser();
        response.put("idOrder", order.getIdOrder());
        response.put("clientId", order.getClient().getIdClient());
        response.put("clientUsername", clientUser.getUsername());
        response.put("clientFirstName", clientUser.getFirstName());
        response.put("clientLastName", clientUser.getLastName());
        response.put("clientPhone", clientUser.getPhone());
        response.put("status", order.getStatus());
        response.put("totalPrice", order.getTotalPrice());
        response.put("address", order.getAddress());
        response.put("createdAt", order.getCreatedAt());
        response.put("items", items.stream()
                .map(oi -> Map.of(
                        "idItem", oi.getItem().getIdItem(),
                        "title", oi.getItem().getTitle(),
                        "quantity", oi.getQuantity(),
                        "price", oi.getPrice(),
                        "subtotal", oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity()))
                ))
                .toList());

        return response;
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

        Order.OrderStatus previousStatus = order.getStatus();

        if (previousStatus == Order.OrderStatus.pending
                && (status == Order.OrderStatus.in_progress || status == Order.OrderStatus.completed)) {
            Object stockResult = deductOrderStock(orderId);
            if (stockResult != null) {
                return stockResult;
            }
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
            @Valid @RequestBody CreateComplaintRequest request
    ) {
        String comment = request.getComment();

        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return "Order not found";
        }

        OrderComplaint complaint = new OrderComplaint();
        complaint.setOrder(order);
        complaint.setComment(comment);

        OrderComplaint saved = orderComplaintRepository.save(complaint);
        sendComplaintMessageToSupervisors(order, saved);
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
                .map(c -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("idOrderComplaint", c.getIdOrderComplaint());
                    data.put("orderId", c.getOrder().getIdOrder());
                    data.put("comment", c.getComment());
                    data.put("timestamp", c.getTimestamp());
                    User clientUser = c.getOrder().getClient().getUser();
                    if (clientUser != null) {
                        data.put("clientUserId", clientUser.getIdUser());
                        data.put("clientUsername", clientUser.getUsername());
                        data.put("clientName", clientUser.getFirstName() + " " + clientUser.getLastName());
                    }
                    return data;
                })
                .toList();
    }

    private Map<String, Object> mapOrder(Order order) {
        Map<String, Object> response = new HashMap<>();
        User clientUser = order.getClient().getUser();
        response.put("idOrder", order.getIdOrder());
        response.put("clientId", order.getClient().getIdClient());
        response.put("clientUsername", clientUser.getUsername());
        response.put("clientFirstName", clientUser.getFirstName());
        response.put("clientLastName", clientUser.getLastName());
        response.put("clientPhone", clientUser.getPhone());
        response.put("status", order.getStatus());
        response.put("totalPrice", order.getTotalPrice());
        response.put("address", order.getAddress());
        response.put("createdAt", order.getCreatedAt());
        return response;
    }

    private Object deductOrderStock(Integer orderId) {
        var orderItems = orderHasItemRepository.findByOrder_IdOrder(orderId);

        for (OrderHasItem orderItem : orderItems) {
            Item item = orderItem.getItem();
            Integer currentQuantity = item.getQuantity() == null ? 0 : item.getQuantity();
            Integer orderedQuantity = orderItem.getQuantity() == null ? 0 : orderItem.getQuantity();

            if (currentQuantity < orderedQuantity) {
                return "Not enough stock for item: " + item.getTitle();
            }
        }

        for (OrderHasItem orderItem : orderItems) {
            Item item = orderItem.getItem();
            item.setQuantity(item.getQuantity() - orderItem.getQuantity());
            itemRepository.save(item);
        }

        return null;
    }

    private void sendComplaintMessageToSupervisors(Order order, OrderComplaint complaint) {
        User clientUser = order.getClient().getUser();
        if (clientUser == null) {
            return;
        }

        String content = "[[ORDER_COMPLAINT id_order_complaint=\""
                + complaint.getIdOrderComplaint()
                + "\" order_id=\""
                + order.getIdOrder()
                + "\"]]\n"
                + complaint.getComment();

        supervisorRepository.findAll().forEach(supervisor -> {
            if (supervisor.getUser() == null) {
                return;
            }

            Message message = new Message();
            message.setSender(clientUser);
            message.setReceiver(supervisor.getUser());
            message.setContent(content);
            message.setIsRead(false);
            messageRepository.save(message);
        });
    }
}
