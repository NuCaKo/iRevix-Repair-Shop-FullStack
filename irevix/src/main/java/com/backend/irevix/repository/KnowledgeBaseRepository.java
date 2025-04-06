package com.backend.irevix.repository;

import com.backend.irevix.model.KnowledgeBaseArticle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBaseArticle, Long> {
}
