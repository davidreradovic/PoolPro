package com.example.backend.controller;

import com.example.backend.dto.CreateProjectCommentRequest;
import com.example.backend.entity.Project;
import com.example.backend.entity.ProjectComment;
import com.example.backend.entity.User;
import com.example.backend.repository.ProjectCommentRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/project-comments")
@CrossOrigin(origins = "*")
public class ProjectCommentController {

    private final ProjectCommentRepository projectCommentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectCommentController(
            ProjectCommentRepository projectCommentRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectCommentRepository = projectCommentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object createComment(
            @Valid @RequestBody CreateProjectCommentRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return "User not found";
        }

        Integer projectId = request.getProjectId();
        Integer replyId = request.getReplyId();
        String content = request.getContent();

        Project project = projectRepository.findById(projectId).orElse(null);

        if (project == null) {
            return "Project not found";
        }

        ProjectComment reply = null;

        if (replyId != null) {
            reply = projectCommentRepository.findById(replyId).orElse(null);

            if (reply == null) {
                return "Reply comment not found";
            }
        }

        ProjectComment comment = new ProjectComment();
        comment.setProject(project);
        comment.setUser(user);
        comment.setContent(content);
        comment.setReply(reply);

        ProjectComment saved = projectCommentRepository.save(comment);
        saved = projectCommentRepository.findById(saved.getIdProjectComment()).orElse(saved);

        Map<String, Object> response = new HashMap<>();
        response.put("idProjectComment", saved.getIdProjectComment());
        response.put("projectId", saved.getProject().getIdProject());
        response.put("userId", saved.getUser().getIdUser());
        response.put("username", saved.getUser().getUsername());
        response.put("content", saved.getContent());

        if (saved.getReply() != null) {
            response.put("replyId", saved.getReply().getIdProjectComment());
        }

        return response;
    }

    @GetMapping("/project/{projectId}")
    public Object getCommentsByProject(@PathVariable Integer projectId) {
        return projectCommentRepository.findByProject_IdProject(projectId)
                .stream()
                .map(comment -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("idProjectComment", comment.getIdProjectComment());
                    response.put("content", comment.getContent());
                    response.put("userId", comment.getUser().getIdUser());
                    response.put("username", comment.getUser().getUsername());

                    if (comment.getReply() != null) {
                        response.put("replyId", comment.getReply().getIdProjectComment());
                    }

                    return response;
                })
                .toList();
    }
}
