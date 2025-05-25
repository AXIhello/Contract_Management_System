package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract_state")
public class ContractState {
    private Integer conNum;      // 合同编号，外键关联 contract(num)
    private String conName;      // 合同名称（冗余字段用于查询显示）
    private Integer type;        // 合同状态：1 起草，2 会签完成，3 定稿完成，4 审批完成，5 签订完成
    private Date time;           // 完成时间
}
