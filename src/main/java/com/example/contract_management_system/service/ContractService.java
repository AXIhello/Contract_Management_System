package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.Contract;

import java.util.List;

public interface ContractService extends IService<Contract> {
    boolean draftContract(Contract contract);
    //boolean uploadAttachment(int conNum, String fileName, String path, String type);
    //获取已起草合同
    List<Contract> getDraftContracts();


    String getContractNameById(Integer id);

    // 创建新合同
    boolean createContract(Contract contract);

    boolean existsByNum(Integer contractNum);
}
