package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract")
public class Contract {
    private int num;             // 合同编号
    private String name;         // 合同名称
    private int customer;        // 客户编号（外键）
    private Date beginTime; // 开始时间
    private Date endTime;   // 结束时间
    private String content;      // 合同内容
    private String userName;     // 起草人用户名
}
