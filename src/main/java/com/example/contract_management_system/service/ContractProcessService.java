package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractProcess;

import java.util.List;

public interface ContractProcessService extends IService<ContractProcess> {
    boolean assignContract(AssignContractRequest request);
    
    // 获取待会签的合同列表
    List<Contract> getPendingCountersignContracts(Integer userId);
    
    // 根据ID获取合同信息
    Contract getContractById(Integer id);
    
    // 提交会签意见
    boolean submitCountersign(Integer contractId, String comment);
}
