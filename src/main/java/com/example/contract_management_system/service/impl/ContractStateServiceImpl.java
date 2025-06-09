package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.ContractMapper;
import com.example.contract_management_system.mapper.ContractStateMapper;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.pojo.ContractState;
import com.example.contract_management_system.service.ContractStateService;
import com.example.contract_management_system.service.LogService;
import com.example.contract_management_system.service.UserService;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ContractStateServiceImpl extends ServiceImpl<ContractStateMapper, ContractState> implements ContractStateService {

    private final LogService logService;
    private final ContractMapper contractMapper;
    private final UserService userService;

    public ContractStateServiceImpl(LogService logService, ContractMapper contractMapper, UserService userService) {
        this.logService = logService;
        this.contractMapper = contractMapper;
        this.userService = userService;
    }


    @Override
    public boolean updateContractState(Integer conNum, Integer type) {
        ContractState contractState = new ContractState();
        contractState.setConNum(conNum);
        contractState.setType(type);
        contractState.setTime(new Date());

        Contract contract = contractMapper.selectById(conNum);
        Integer userId = userService.getCurrentUserId();
        // 如果状态记录不存在，则插入新记录
        if (getContractState(conNum) == null) {
            logService.addLog(userId, 1, "ContractState", contract.getName());
            return save(contractState);
        }

        logService.addLog(userId, 3, "ContractState", contract.getName());
        // 如果状态记录存在，则更新状态
        return updateById(contractState);
    }
    
    @Override
    public ContractState getContractState(Integer conNum) {
        return getById(conNum);
    }
} 