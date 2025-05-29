package com.example.contract_management_system.controller;


import com.example.contract_management_system.dto.*;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/assign")
public class AssignController {

    private final ContractService contractService;
    private final UserService userService;
    private final ContractProcessService contractProcessService;

    public AssignController(ContractService contractService, UserService userService,  ContractProcessService contractProcessService) {
        this.contractService = contractService;
        this.userService = userService;
        this.contractProcessService = contractProcessService;
    }

    @GetMapping("/drafts")
    public List<Contract> getDraftContracts() {
        return contractService.getDraftContracts();
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> assignContract(@RequestBody AssignContractRequest request) {
        boolean success = contractProcessService.assignContract(request);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "分配成功"));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("success", false, "message", "分配失败"));
        }
    }


    @GetMapping("/name")
    public Map<String, Object> getContractName(@RequestParam Integer id) {
        String name = contractService.getContractNameById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("name", name != null ? name : "未知合同");
        return result;
    }
    @GetMapping("/user")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

}
