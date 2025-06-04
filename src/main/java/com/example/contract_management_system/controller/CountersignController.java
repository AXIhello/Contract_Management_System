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
                // 读取文件内容
                byte[] fileContent = Files.readAllBytes(Paths.get(filePath));

                // 获取文件扩展名，用于确定MIME类型
                String fileExtension = "";
                int lastDotIndex = fileName.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    fileExtension = fileName.substring(lastDotIndex + 1).toLowerCase();
                }

                // 根据文件类型设置MIME类型
                String mimeType = getMimeType(fileExtension);

                Map<String, Object> attachment = new HashMap<>();
                attachment.put("fileName", fileName);
                attachment.put("fileSize", fileContent.length);
                attachment.put("mimeType", mimeType);
                // 方式1: Base64编码 - 适合所有文件类型，前端使用 data URL
                attachment.put("content", Base64.getEncoder().encodeToString(fileContent));
                // 前端可以使用: data:${mimeType};base64,${content} 创建下载链接

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