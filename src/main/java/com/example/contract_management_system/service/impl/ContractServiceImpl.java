package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.*;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ContractServiceImpl extends ServiceImpl<ContractMapper, Contract> implements ContractService {
    private static final Logger logger = LoggerFactory.getLogger(ContractServiceImpl.class);

    private final ContractMapper contractMapper;
    private final ContractStateMapper contractStateMapper;
    private final ContractStateService contractStateService;

    public ContractServiceImpl(ContractMapper contractMapper, ContractStateMapper contractStateMapper, ContractStateService contractStateService, ContractProcessMapper contractProcessMapper) {
        this.contractMapper = contractMapper;
        this.contractStateMapper = contractStateMapper;
        this.contractStateService = contractStateService;
    }

    @Override
    @Transactional
    public boolean draftContract(Contract contract) {
        logger.info("开始验证合同信息: {}", contract);

        if (contract == null) {
            logger.error("合同对象为空");
            return false;
        }

        if (contract.getName() == null) {
            logger.error("合同名称为空");
            return false;
        }

        if (contract.getCustomer() <= 0) {
            logger.error("客户编号无效: {}", contract.getCustomer());
            return false;
        }

        if (contract.getUserId() <= 0) {
            logger.error("用户ID无效: {}", contract.getUserId());
            return false;
        }

        logger.info("合同信息验证通过，开始保存");
        int result = contractMapper.insert(contract);
        logger.info("合同保存结果: {}", result > 0);
        
        if (result > 0) {
            // 创建合同状态记录
            ContractState contractState = new ContractState();
            contractState.setConNum(contract.getNum());
            contractState.setConName(contract.getName());
            contractState.setType(1); // 1表示起草状态
            contractState.setTime(new Date());
            
            boolean stateSaved = contractStateService.save(contractState);
            logger.info("合同状态保存结果: {}", stateSaved);
            return stateSaved;
        }
        
        return false;
    }

    //获取起草状态的合同
    @Override
    public List<Contract> getDraftContracts() {
        List<Integer> list = contractStateMapper.selectContractsByState(1); // 1 = 起草状态
        List<Contract>  contracts = new ArrayList<>(List.of());
        for(Integer id : list){
            contracts.add(contractMapper.selectById(id));
        }
        return contracts;
    }

    @Override
    public String getContractNameById(Integer id) {
        return contractMapper.findContractNameById(id);
    }



    @Override
    @Transactional
    public boolean createContract(Contract contract) {
        // 保存合同信息
        boolean saved = save(contract);
        if (!saved) {
            return false;
        }

        // 创建合同状态记录
        ContractState contractState = new ContractState();
        contractState.setConNum(contract.getNum());
        contractState.setConName(contract.getName());
        contractState.setType(1); // 1表示起草状态
        contractState.setTime(new Date());

        return contractStateService.save(contractState);
    }

    @Override
    public boolean existsByNum(Integer contractNum) {
        return contractMapper.selectById(contractNum) != null;
    }
}
