package com.example.contract_management_system.controller;


import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contract")
public class AssignController {

    @Autowired
    private ContractService contractService;

    @GetMapping("/drafts")
    public List<Contract> getDraftContracts() {
        return contractService.getDraftContracts();
    }

    @PostMapping("/assign")
    public ResponseEntity<String> assignContract(@RequestBody AssignContractRequest request) {
        boolean success = contractService.assignContract(request);
        return success ? ResponseEntity.ok("分配成功") : ResponseEntity.badRequest().body("分配失败");
    }

    @GetMapping("/name")
    public Map<String, Object> getContractName(@RequestParam String id) {
        String name = contractService.getContractNameById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("name", name != null ? name : "未知合同");
        return result;
    }

}
