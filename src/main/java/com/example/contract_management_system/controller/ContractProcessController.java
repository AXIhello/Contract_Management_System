package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.ContractProcess;
import com.example.contract_management_system.service.ContractProcessService;
import com.example.contract_management_system.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contract-process")
public class ContractProcessController {

    private final ContractProcessService contractProcessService;
    private final UserService userService;

    @Autowired
    public ContractProcessController(ContractProcessService contractProcessService, UserService userService) {
        this.contractProcessService = contractProcessService;
        this.userService = userService;
    }

    @GetMapping("/pending")
    public List<ContractProcess> getPendingProcessesForCurrentUser() throws Exception {
        Integer userId = userService.getCurrentUserId();
        if (userId == null) {
            throw new Exception("用户未登录");
        }

        return contractProcessService.getPendingProcessesByUserId(userId);
    }
}
