package com.example.contract_management_system.controller;

import com.example.contract_management_system.dto.CountersignDTO;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractAttachment;
import com.example.contract_management_system.service.ContractProcessService;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

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

    //获取会签意见
    @GetMapping("/contents/{contractNum}")
    public List<CountersignDTO> getCountersign(@PathVariable Integer contractNum) {
        return contractProcessService.getCountersignContent(contractNum);
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

        Map<String, Object> result = new HashMap<>();
        if (contract != null) {
            result.put("name", contract.getName());
            result.put("beginTime",contract.getBeginTime());
            result.put("endTime",contract.getEndTime());
            result.put("contractNum",contract.getNum());
            result.put("customer",contract.getCustomer());
            result.put("userId",contract.getUserId());
            result.put("content", contract.getContent());
        } else {
            result.put("name", "未知合同");
            result.put("content", "");
            result.put("attachments", List.of());
        }
        return result;
    }


    private String getMimeType(String fileExtension) {
        switch (fileExtension) {
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls":
                return "application/vnd.ms-excel";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "png":
                return "image/png";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "gif":
                return "image/gif";
            case "txt":
                return "text/plain";
            case "zip":
                return "application/zip";
            case "rar":
                return "application/x-rar-compressed";
            default:
                return "application/octet-stream";
        }
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