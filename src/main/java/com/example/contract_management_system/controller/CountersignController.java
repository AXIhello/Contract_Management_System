package com.example.contract_management_system.controller;

import com.baomidou.mybatisplus.extension.conditions.ChainWrapper;
import com.example.contract_management_system.dto.CountersignDTO;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractAttachment;
import com.example.contract_management_system.pojo.Customer;
import com.example.contract_management_system.service.ContractProcessService;
import com.example.contract_management_system.service.CustomerService;
import com.example.contract_management_system.service.UserService;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.contract_management_system.service.CustomerService;
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
    private final CustomerService customerService;;

    public CountersignController(ContractProcessService contractProcessService,
                               UserService userService,
                               CustomerService customerService) {
        this.contractProcessService = contractProcessService;
        this.userService = userService;
        this.customerService=customerService;
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

    @PreAuthorize("hasAuthority('countersign_contract')")
    @GetMapping("/contract/{id}")
    public Map<String, Object> getContractInfo(@PathVariable Integer id) {
        Contract contract = contractProcessService.getContractById(id);

        Map<String, Object> result = new HashMap<>();
        if (contract != null) {
            result.put("name", contract.getName());
            result.put("beginTime",contract.getBeginTime());
            result.put("endTime",contract.getEndTime());

            Customer customer=customerService.getBaseMapper().selectById(contract.getCustomer());
            result.put("contractNum",contract.getNum());
            result.put("customer",customer.getName());
            result.put("userId",contract.getUserId());
            result.put("content", contract.getContent());
        } else {
            result.put("name", "未知合同");
            result.put("content", "");
            result.put("attachments", List.of());
        }
        return result;
    }

    @PreAuthorize("hasAuthority('countersign_contract')")
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