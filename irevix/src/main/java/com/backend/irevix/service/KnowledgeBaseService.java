package com.backend.irevix.service;

import com.backend.irevix.model.KnowledgeBaseArticle;
import com.backend.irevix.repository.KnowledgeBaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KnowledgeBaseService {

    @Autowired
    private KnowledgeBaseRepository knowledgeBaseRepository;
    public List<KnowledgeBaseArticle> getArticles() {
        return knowledgeBaseRepository.findAll();
    }
}
