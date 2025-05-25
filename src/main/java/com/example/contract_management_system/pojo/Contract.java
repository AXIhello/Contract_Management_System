package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract")
public class Contract {
    @TableId(value = "num", type = IdType.AUTO) // 主键，自动递增
    private Integer num;             // 合同编号
    private String name;             // 合同名称
    private Integer customer;        // 客户编号
    @TableField("begin_time")
    private Date beginTime;          // 开始时间
    @TableField("end_time")
    private Date endTime;            // 结束时间
    private String content;          // 合同内容
    private Integer userId;          // 起草人ID（外键关联users表）
}