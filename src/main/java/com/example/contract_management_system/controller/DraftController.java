package com.example.contract_management_system.controller;

import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contract")
public class DraftController {

    @Autowired
    private ContractService contractService;

    @PostMapping("/draft")
    public Map<String, Object> draftContract(
            @RequestParam("contractName") String contractName,
            @RequestParam("startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam("endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam("contractContent") String contractContent,
            @RequestParam("clientName") int customer, // 客户ID，前端传来的是 int 类型的 customer 外键
            @RequestParam("userName") int userId;
    ) {
        Map<String, Object> response = new HashMap<>();

        Contract contract = new Contract();
        contract.setName(contractName);
        contract.setBeginTime(startDate);
        contract.setEndTime(endDate);
        contract.setContent(contractContent);
        contract.setCustomer(clientId);
        contract.setUserName(userName);

        boolean success = contractService.draftContract(contract);
        if (success) {
            response.put("success", true);
            response.put("message", "合同起草成功");
        } else {
            response.put("success", false);
            response.put("message", "合同起草失败");
        }
        return response;
    }
}
