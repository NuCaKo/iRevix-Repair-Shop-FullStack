package com.backend.irevix.repository;

import com.backend.irevix.model.RepairNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepairNoteRepository extends JpaRepository<RepairNote, Long> {
    List<RepairNote> findByRepairOrderId(Long repairOrderId);
}
