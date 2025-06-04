package com.example.contract_management_system.controller;

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
        List<Pair<String, String>> attachmentPairs = contractAttachmentService.getAttachmentsByConNum(id);

        // 处理附件，读取文件内容并重命名
        List<Map<String, Object>> processedAttachments = new ArrayList<>();
        for (Pair<String, String> pair : attachmentPairs) {
            String fileName = pair.getFirst();  // 获取文件名
            String filePath = pair.getSecond(); // 获取文件路径

            try {
                // 读取文件内容（这里假设是读取文件的base64编码或者文件字节）
                byte[] fileContent = Files.readAllBytes(Paths.get(filePath));

                Map<String, Object> attachment = new HashMap<>();
                attachment.put("fileName", fileName);
                attachment.put("content", Base64.getEncoder().encodeToString(fileContent));
                // 或者如果你想直接传输文件字节：
                // attachment.put("content", fileContent);

                processedAttachments.add(attachment);
            } catch (IOException e) {
                // 处理文件读取异常
                Map<String, Object> attachment = new HashMap<>();
                attachment.put("fileName", fileName);
                attachment.put("content", null);
                attachment.put("error", "文件读取失败");
                processedAttachments.add(attachment);
            }
        }

        Map<String, Object> result = new HashMap<>();
        if (contract != null) {
            result.put("name", contract.getName());
            result.put("content", contract.getContent());
            result.put("attachments", processedAttachments);
        } else {
            result.put("name", "未知合同");
            result.put("content", "");
            result.put("attachments", List.of());
        }
        return result;
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