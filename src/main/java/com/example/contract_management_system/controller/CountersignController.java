package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractAttachment;
import com.example.contract_management_system.service.ContractProcessService;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/countersign")
public class CountersignController {

    private final ContractProcessService contractProcessService;
    private final UserService userService;
    private final ContractAttachmentService contractAttachmentService;

    public CountersignController(ContractProcessService contractProcessService, 
                               UserService userService,
                               ContractAttachmentService contractAttachmentService) {
        this.contractProcessService = contractProcessService;
        this.userService = userService;
        this.contractAttachmentService = contractAttachmentService;
    }

    @GetMapping("/pending")
    public List<Contract> getPendingCountersignContracts() {
        // 获取当前登录用户ID
        Integer currentUserId = userService.getCurrentUserId();
        if (currentUserId == null) {
            throw new RuntimeException("用户未登录");
        }
        // 获取待会签的合同列表
        return contractProcessService.getPendingCountersignContracts(currentUserId);
    }

    @GetMapping("/contract/{id}")
    public Map<String, Object> getContractInfo(@PathVariable Integer id) {
        Contract contract = contractProcessService.getContractById(id);
        List<ContractAttachment> attachments = contractAttachmentService.getAttachmentsByConNum(id);
        
        Map<String, Object> result = new HashMap<>();
        if (contract != null) {
            result.put("name", contract.getName());
            result.put("content", contract.getContent());
            result.put("attachments", attachments);
        } else {
            result.put("name", "未知合同");
            result.put("content", "");
            result.put("attachments", List.of());
        }
        return result;
    }

    @GetMapping("/attachment/{id}")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Integer id) {
        return contractAttachmentService.downloadAttachment(id);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitCountersign(@RequestBody Map<String, Object> request) {
        Integer contractId = Integer.parseInt((String) request.get("contractId"));
        String comment = (String) request.get("comment");
        
        boolean success = contractProcessService.submitCountersign(contractId, comment);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "会签提交成功"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "会签提交失败"));
        }
    }
} 