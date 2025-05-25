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
        if (contract == null || contract.getName() == null || contract.getCustomer() <= 0 || contract.getUserId() <= 0)
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
}
