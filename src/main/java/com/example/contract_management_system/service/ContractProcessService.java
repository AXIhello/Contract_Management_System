package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.ContractProcess;

public interface ContractProcessService extends IService<ContractProcess> {
    boolean assignContract(AssignContractRequest request);
}
