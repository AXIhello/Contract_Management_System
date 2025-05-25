package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.mapper.ContractMapper;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ContractServiceImpl implements ContractService {
    private static final Logger logger = LoggerFactory.getLogger(ContractServiceImpl.class);

    @Autowired
    private ContractMapper contractMapper;

    @Override
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
        return result > 0;
    }
}
