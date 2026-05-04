package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "photo")
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_photo")
    private Integer idPhoto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_task")
    private Task task;

    @Column(name = "img", length = 255)
    private String img;

    public Integer getIdPhoto() { return idPhoto; }
    public void setIdPhoto(Integer idPhoto) { this.idPhoto = idPhoto; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}
