package com.example.backend.dto;

public class CreateProjectRequest {

    private Integer idSupervisor;
    private Integer idClient;
    private String title;
    private String description;
    private Boolean publicProject;

    public Integer getIdSupervisor() {
        return idSupervisor;
    }

    public void setIdSupervisor(Integer idSupervisor) {
        this.idSupervisor = idSupervisor;
    }

    public Integer getIdClient() {
        return idClient;
    }

    public void setIdClient(Integer idClient) {
        this.idClient = idClient;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getPublicProject() {
        return publicProject;
    }

    public void setPublicProject(Boolean publicProject) {
        this.publicProject = publicProject;
    }
}