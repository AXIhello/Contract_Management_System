package com.example.contract_management_system.dto;

import lombok.Data;

@Data
public class ContractPendingDTO {
    private Integer id;           // 合同编号
    private String name;           // 合同名称
    private String drafter;        // 拟稿人名称
    private String draftDate;      // 拟稿日期（格式化后字符串）
}
