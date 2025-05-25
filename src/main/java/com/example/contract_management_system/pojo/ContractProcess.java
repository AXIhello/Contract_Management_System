package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract_process")
public class ContractProcess {
    private Integer conNum;      // 合同编号，外键关联 contract(num)
    private Integer type;        // 操作类型：1 会签，2 审批，3 签订
    private Integer state;       // 操作状态：0 未完成，1 已完成，2 否决
    private String userName;     // 操作人
    private String content;      // 操作内容
    private Date time;           // 操作时间
}
