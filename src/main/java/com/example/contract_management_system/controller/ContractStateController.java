package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.ContractState;
import com.example.contract_management_system.service.ContractStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contract-state")
public class ContractStateController {
    
    private final ContractStateService contractStateService;

    public ContractStateController(ContractStateService contractStateService) {
        this.contractStateService = contractStateService;
    }

//    @PutMapping("/{conNum}")
//    public boolean updateContractState(@PathVariable Integer conNum, @RequestParam Integer type) {
//        return contractStateService.updateContractState(conNum, type);
//    }
//
//    @GetMapping("/{conNum}")
//    public ContractState getContractState(@PathVariable Integer conNum) {
//        return contractStateService.getContractState(conNum);
//    }
} 