package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.mapper.ContractMapper;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    //获取起草状态的合同
    @Override
    public List<Contract> getDraftContracts() {
        return contractMapper.selectContractsByState(1); // 1 = 起草状态
    }

    @Override
    public String getContractNameById(String id) {
        return contractMapper.findContractNameById(id);
    }

    //分配合同
    @Override
    public boolean assignContract(AssignContractRequest request) {
        // 校验字段不为空
        if (request.getSigner() == null || request.getApprover() == null || request.getCosigner() == null) {
            return false;
        }

        // 插入 contract_process 表
        contractMapper.insertContractProcess(request.getContractNum(), 1, 0, request.getCosigner());
        contractMapper.insertContractProcess(request.getContractNum(), 2, 0, request.getApprover());
        contractMapper.insertContractProcess(request.getContractNum(), 3, 0, request.getSigner());

        // 更新合同状态表，设为已分配（比如2 会签完成）
        contractMapper.updateContractState(request.getContractNum(), 2);

        return true;
    }
}
