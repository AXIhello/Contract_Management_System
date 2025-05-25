package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.Contract;

public interface ContractService extends IService<Contract> {
    boolean draftContract(Contract contract);
    //boolean uploadAttachment(int conNum, String fileName, String path, String type);
    //获取已起草合同
    List<Contract> getDraftContracts();
    boolean assignContract(AssignContractRequest request);

    public String getContractNameById(String id) {
        return contractMapper.findContractNameById(id);
    }

    // 创建新合同
    boolean createContract(Contract contract);
}
