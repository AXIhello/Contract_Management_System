package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.mapper.ContractMapper;
import com.example.contract_management_system.pojo.Contract;
import com.example.contract_management_system.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ContractServiceImpl implements ContractService {

    @Autowired
    private ContractMapper contractMapper;

    @Override
    public boolean draftContract(Contract contract) {
        if (contract == null || contract.getName() == null || contract.getCustomer() <= 0 || contract.getUserName()==null)
            return false;
        return contractMapper.insert(contract) > 0;
    }
//
//    @Override
//    public boolean uploadAttachment(int conNum, String fileName, String path, String type) {
//        if (fileName == null || path == null || type == null || conNum <= 0)
//            return false;
//
//        LocalDateTime uploadTime = LocalDateTime.now();
//        return contractMapper.insertAttachment(conNum, fileName, path, type, uploadTime) > 0;
//    }
    //获取起草状态的合同
    @Override
    public List<Contract> getDraftContracts() {
        return contractMapper.selectContractsByState(1); // 1 = 起草状态
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
