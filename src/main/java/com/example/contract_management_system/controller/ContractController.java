package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contracts")
public class ContractController {
    
    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    public boolean createContract(@RequestBody Contract contract) {
        return contractService.createContract(contract);
    }

} 