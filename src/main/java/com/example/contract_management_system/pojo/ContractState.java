package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract_state")
public class ContractState {
    @TableId(value = "conNum", type = IdType.INPUT)
    private Integer conNum;          // 合同编号
    
    @TableField("conName")
    private String conName;          // 合同名称
    
    private Integer type;            // 合同状态：1-起草，2-会签完成，3-定稿完成，4-审批完成，5-签订完成
    private Date time;               // 完成时间
}
