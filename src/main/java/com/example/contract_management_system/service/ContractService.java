package com.example.contract_management_system.service;

import com.example.contract_management_system.pojo.Contract;

public interface ContractService {
    boolean draftContract(Contract contract);
    //boolean uploadAttachment(int conNum, String fileName, String path, String type);
}
