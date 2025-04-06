package com.backend.irevix.controller;

import com.backend.irevix.model.KnowledgeBaseArticle;
import com.backend.irevix.service.KnowledgeBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge-base")
public class KnowledgeBaseController {

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @GetMapping
    public List<KnowledgeBaseArticle> getArticles() {
        return knowledgeBaseService.getArticles();
    }
}
