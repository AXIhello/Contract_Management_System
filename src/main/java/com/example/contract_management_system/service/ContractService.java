package com.example.contract_management_system.service;

import com.example.contract_management_system.dto.AssignContractRequest;
import com.example.contract_management_system.pojo.Contract;

import java.util.List;

public interface ContractService {
    boolean draftContract(Contract contract);
    //boolean uploadAttachment(int conNum, String fileName, String path, String type);
    //获取已起草合同
    List<Contract> getDraftContracts();
    boolean assignContract(AssignContractRequest request);

    public String getContractNameById(String id);

}
