package com.example.contract_management_system.controller;

import com.example.contract_management_system.dto.ContractPendingDTO;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/getToBeFinishedContracts")
    public List<ContractPendingDTO> getToBeFinishedContracts() {
        System.out.println("✔ 已进入 getToBeFinishedContracts 控制器");
        return contractService.getToBeFinishedContracts();
    }

} 