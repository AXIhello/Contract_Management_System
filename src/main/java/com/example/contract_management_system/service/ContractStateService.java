package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.ContractState;

public interface ContractStateService extends IService<ContractState> {
    // 更新合同状态
    boolean updateContractState(Integer conNum, Integer type);
    
    // 获取合同状态
    ContractState getContractState(Integer conNum);
} 