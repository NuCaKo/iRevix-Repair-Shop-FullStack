package com.backend.irevix.service;

import com.backend.irevix.model.RepairNote;
import com.backend.irevix.repository.RepairNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RepairNoteService {

    private final RepairNoteRepository repairNoteRepository;

    @Autowired
    public RepairNoteService(RepairNoteRepository repairNoteRepository) {
        this.repairNoteRepository = repairNoteRepository;
    }

    public RepairNote saveRepairNote(RepairNote note) {
        return repairNoteRepository.save(note);
    }

    public List<RepairNote> getNotesByRepairOrderId(Long repairOrderId) {
        return repairNoteRepository.findByRepairOrderId(repairOrderId);
    }
}
