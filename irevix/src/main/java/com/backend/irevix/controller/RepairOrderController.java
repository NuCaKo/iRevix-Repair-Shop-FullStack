package com.backend.irevix.controller;

import com.backend.irevix.model.Repair;
import com.backend.irevix.model.RepairImage;
import com.backend.irevix.model.RepairNote;
import com.backend.irevix.model.RepairOrder;
import com.backend.irevix.repository.RepairOrderRepository;
import com.backend.irevix.service.RepairNoteService;
import com.backend.irevix.service.RepairOrderService;
import com.backend.irevix.service.RepairImageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/repair-orders")
@CrossOrigin(origins = "*")
public class RepairOrderController {

    private final RepairOrderService repairOrderService;
    private final RepairImageService repairImageService;
    private final RepairNoteService repairNoteService;
    private final RepairOrderRepository repairOrderRepository;

    @Autowired
    public RepairOrderController(
            RepairOrderService repairOrderService,
            RepairImageService repairImageService,
            RepairNoteService repairNoteService,
            RepairOrderRepository repairOrderRepository
    ) {
        this.repairOrderService = repairOrderService;
        this.repairImageService = repairImageService;
        this.repairNoteService = repairNoteService;
        this.repairOrderRepository = repairOrderRepository;
    }

    @GetMapping
    public List<RepairOrder> getAllRepairOrders() {
        return repairOrderService.getAllRepairOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairOrder> getRepairOrderById(@PathVariable Long id) {
        return repairOrderService.getRepairOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RepairOrder createRepairOrder(@RequestBody RepairOrder repairOrder) {
        return repairOrderService.saveRepairOrder(repairOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairOrder> updateRepairOrder(
            @PathVariable Long id, @RequestBody RepairOrder repairOrder) {
        if (!repairOrderService.getRepairOrderById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        repairOrder.setId(id);
        return ResponseEntity.ok(repairOrderService.saveRepairOrder(repairOrder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepairOrder(@PathVariable Long id) {
        if (!repairOrderService.getRepairOrderById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        repairOrderService.deleteRepairOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRepairOrderStatus(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> requestBody) {

        String newStatus = requestBody != null ? requestBody.get("status") : null;

        return repairOrderService.getRepairOrderById(id)
                .map(repairOrder -> {
                    if (newStatus != null) {
                        repairOrder.setStatus(newStatus);
                        repairOrderService.saveRepairOrder(repairOrder);
                        return ResponseEntity.ok().build();
                    } else {
                        return ResponseEntity.badRequest().body("Status is missing");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/technician/{technicianId}")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @PathVariable Long technicianId) {

        return repairOrderService.getRepairOrderById(id)
                .map(repairOrder -> {
                    repairOrder.setTechnicianId(technicianId);
                    repairOrderService.saveRepairOrder(repairOrder);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadRepairImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile file,
            @RequestParam("type") String type) {

        String uploadDir = System.getProperty("user.dir") + "/uploads/repair-images/";

        try {
            Files.createDirectories(Paths.get(uploadDir));

            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir, fileName);
            file.transferTo(uploadPath.toFile());

            String imageUrl = "/uploads/repair-images/" + fileName;

            RepairOrder repairOrder = repairOrderService.getRepairOrderById(id)
                    .orElseThrow(() -> new RuntimeException("Repair order not found"));

            RepairImage repairImage = new RepairImage();
            repairImage.setImageUrl(imageUrl);
            repairImage.setType(type);
            repairImage.setRepairOrder(repairOrder);

            repairImageService.saveRepairImage(repairImage);

            return ResponseEntity.ok("Image uploaded successfully");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-pdf")
    public ResponseEntity<?> uploadPdf(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Fiziksel klasör yolu
            String uploadsDir = System.getProperty("user.dir") + "/uploads/service-reports/";
            String filename = "service_report_" + id + ".pdf";

            File uploadDir = new File(uploadsDir);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            // Kaydet
            Path filePath = Paths.get(uploadsDir + filename);
            Files.write(filePath, file.getBytes());

            // Veritabanına yaz
            RepairOrder repair = repairOrderRepository.findById(id).orElse(null);
            if (repair == null) return ResponseEntity.notFound().build();

            String relativePath = "/uploads/service-reports/" + filename;
            repair.setServiceReportUrl(relativePath);
            repairOrderRepository.save(repair);

            return ResponseEntity.ok("PDF uploaded and saved.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload PDF: " + e.getMessage());
        }
    }



    @GetMapping("/{id}/service-report")
    public ResponseEntity<RepairOrder> getServiceReport(@PathVariable Long id) {
        return repairOrderService.getRepairOrderById(id)
                .map(repairOrder -> {
                    if (repairOrder.getServiceReportUrl() != null) {
                        return ResponseEntity.ok(repairOrder);
                    } else {
                        return ResponseEntity.notFound().build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
