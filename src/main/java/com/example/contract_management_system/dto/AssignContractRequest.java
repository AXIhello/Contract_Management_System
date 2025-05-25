package com.example.contract_management_system.dto;

import lombok.Getter;

public class AssignContractRequest {
    @Getter
    private int contractNum;
    // 也可以改为 List<ContractProcess> 结构
    @Getter
    private String signer;     // 签订人
    @Getter
    private String approver;   // 审批人
    @Getter
    private String cosigner;   // 会签人

}
