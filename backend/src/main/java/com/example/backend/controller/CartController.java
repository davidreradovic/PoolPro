package com.example.backend.controller;

import com.example.backend.dto.AddToCartRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartRepository cartRepository;
    private final CartHasItemRepository cartHasItemRepository;
    private final ItemRepository itemRepository;
    private final ClientRepository clientRepository;

    public CartController(
            CartRepository cartRepository,
            CartHasItemRepository cartHasItemRepository,
            ItemRepository itemRepository,
            ClientRepository clientRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartHasItemRepository = cartHasItemRepository;
        this.itemRepository = itemRepository;
        this.clientRepository = clientRepository;
    }

    @PostMapping("/{clientId}/add")
    @PreAuthorize("hasRole('CLIENT')")
    public Object addItemToCart(
            @PathVariable Integer clientId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        Integer itemId = request.getItemId();
        Integer quantity = request.getQuantity();

        Client client = clientRepository.findById(clientId).orElse(null);
        if (client == null) {
            return "Client not found";
        }

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found";
        }

        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);

        if (cart == null) {
            cart = new Cart();
            cart.setClient(client);
            cart = cartRepository.save(cart);
        }

        CartHasItemId id = new CartHasItemId();
        id.setIdCart(cart.getIdCart());
        id.setIdItem(item.getIdItem());

        CartHasItem cartItem = cartHasItemRepository.findById(id).orElse(null);

        if (cartItem == null) {
            cartItem = new CartHasItem();
            cartItem.setId(id);
            cartItem.setCart(cart);
            cartItem.setItem(item);
            cartItem.setQuantity(quantity);
            cartItem.setPrice(item.getUnitPrice());
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        cartHasItemRepository.save(cartItem);

        return "Item added to cart";
    }

    @GetMapping("/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('SUPERVISOR')")
    public Object getCart(@PathVariable Integer clientId) {
        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);

        if (cart == null) {
            return "Cart is empty";
        }

        var items = cartHasItemRepository.findByCart_IdCart(cart.getIdCart());

        BigDecimal total = items.stream()
                .map(ci -> ci.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "idCart", cart.getIdCart(),
                "clientId", cart.getClient().getIdClient(),
                "items", items.stream()
                        .map(ci -> Map.of(
                                "idItem", ci.getItem().getIdItem(),
                                "title", ci.getItem().getTitle(),
                                "category", ci.getItem().getCategory(),
                                "quantity", ci.getQuantity(),
                                "unitPrice", ci.getPrice(),
                                "subtotal", ci.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()))
                        ))
                        .toList(),
                "total", total
        );
    }

    @PutMapping("/{clientId}/update")
    @PreAuthorize("hasRole('CLIENT')")
    public Object updateQuantity(
            @PathVariable Integer clientId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        Integer itemId = request.getItemId();
        Integer quantity = request.getQuantity();

        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);
        if (cart == null) {
            return "Cart not found";
        }

        CartHasItemId id = new CartHasItemId();
        id.setIdCart(cart.getIdCart());
        id.setIdItem(itemId);

        CartHasItem cartItem = cartHasItemRepository.findById(id).orElse(null);

        if (cartItem == null) {
            return "Item not found in cart";
        }

        cartItem.setQuantity(quantity);
        cartHasItemRepository.save(cartItem);

        return "Cart item quantity updated";
    }

    @DeleteMapping("/{clientId}/remove/{itemId}")
    @PreAuthorize("hasRole('CLIENT')")
    public Object removeItemFromCart(
            @PathVariable Integer clientId,
            @PathVariable Integer itemId
    ) {
        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);

        if (cart == null) {
            return "Cart not found";
        }

        CartHasItemId id = new CartHasItemId();
        id.setIdCart(cart.getIdCart());
        id.setIdItem(itemId);

        CartHasItem cartItem = cartHasItemRepository.findById(id).orElse(null);

        if (cartItem == null) {
            return "Item not found in cart";
        }

        cartHasItemRepository.delete(cartItem);

        return "Item removed from cart";
    }

    @DeleteMapping("/{clientId}/clear")
    @PreAuthorize("hasRole('CLIENT')")
    public Object clearCart(@PathVariable Integer clientId) {
        Cart cart = cartRepository.findByClient_IdClient(clientId).orElse(null);

        if (cart == null) {
            return "Cart not found";
        }

        var items = cartHasItemRepository.findByCart_IdCart(cart.getIdCart());
        cartHasItemRepository.deleteAll(items);

        return "Cart cleared";
    }
}
