package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.ContractStateMapper;
import com.example.contract_management_system.pojo.ContractState;
import com.example.contract_management_system.service.ContractStateService;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ContractStateServiceImpl extends ServiceImpl<ContractStateMapper, ContractState> implements ContractStateService {
    
    @Override
    public boolean updateContractState(Integer conNum, Integer type) {
        ContractState contractState = new ContractState();
        contractState.setConNum(conNum);
        contractState.setType(type);
        contractState.setTime(new Date());
        
        // 如果状态记录不存在，则插入新记录
        if (getContractState(conNum) == null) {
            return save(contractState);
        }
        
        // 如果状态记录存在，则更新状态
        return updateById(contractState);
    }
    
    @Override
    public ContractState getContractState(Integer conNum) {
        return getById(conNum);
    }
} 