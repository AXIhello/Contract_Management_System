package com.example.contract_management_system.controller;

import com.example.contract_management_system.util.Result;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.core.io.Resource;

import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.contract_management_system.service.ContractAttachmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.util.Pair;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contract/attachment")
public class ContractAttachmentController {

    @Autowired
    private ContractAttachmentService contractAttachmentService;


    //附件相关
    /**
     * 获取指定合同编号的所有附件
     */
    @GetMapping("/get/{conNum}")
    public ResponseEntity<List<Map<String, String>>> getAttachmentsByConNum(@PathVariable Integer conNum) {
        List<Pair<String, String>> attachments = contractAttachmentService.getAttachmentsByConNum(conNum);

        List<Map<String, String>> result = attachments.stream()
                .map(pair -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("fileName", pair.getFirst()); // Pair#getFirst()
                    map.put("fileUrl", pair.getSecond()); // Pair#getSecond()
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 删除指定的附件
     */

    @DeleteMapping("/delete")
    public Result<Void> deleteAttachment(@RequestParam String path) {
        System.out.println("进入删除接口，path=" + path);
        boolean success = contractAttachmentService.deleteAttachment(path);
        if (success) {
            return Result.success(); // 成功返回 200、"操作成功"、null
        } else {
            return Result.error("删除失败");
        }
    }



    /**
     * 上传附件
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadAttachment(
            @RequestParam("conNum") Integer conNum,
            @RequestParam("file") MultipartFile file) {

        boolean success = contractAttachmentService.uploadAndSaveAttachment(conNum, file);

        if (success) {
            return ResponseEntity.ok(Map.of("code", 200, "msg", "上传成功"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("code", 400, "msg", "上传失败"));
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadAttachment(@RequestParam String filepath) {
        Resource fileResource = contractAttachmentService.downloadAttachment(filepath);
        String fileName = fileResource.getFilename();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileResource);
    }


}
