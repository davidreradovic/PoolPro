package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "item_photo")
public class ItemPhoto {
    @Id
    @Column(name = "iditem_photo")
    private Integer idItemPhoto;

    @Column(nullable = false, length = 255)
    private String img;

    @Column(nullable = false, length = 45)
    private String title;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id_item")
    private Item item;

    public Integer getIdItemPhoto() { return idItemPhoto; }
    public void setIdItemPhoto(Integer idItemPhoto) { this.idItemPhoto = idItemPhoto; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
}
