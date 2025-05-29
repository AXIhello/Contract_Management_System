package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.Date;

@Data
@TableName("contract_process")
public class ContractProcess {

    @TableField("conNum")
    private Integer conNum;      // 合同编号，外键关联 contract(num)
    private Integer type;        // 操作类型：1 会签，2 审批，3 签订
    private Integer state;       // 操作状态：0 未完成，1 已完成，2 否决
    @TableField("user_id")
    private Integer userId;     // 操作用户号
    private String content;      // 操作内容
    private Date time;           // 操作时间

    public void setContractNum(int contractNum) {
        this.conNum = contractNum;
    }

    public void setStatus(int i) {
        this.type = i;
    }

    public void setOperateTime(Timestamp time) {
        this.time = time;
    }
}
