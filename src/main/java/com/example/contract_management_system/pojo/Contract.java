package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract")
public class Contract {
    @TableId(value = "num", type = IdType.AUTO)
    @JsonProperty("num")
    private Integer num;

    @JsonProperty("name")
    private String name;

    @TableField("user_id")
    @JsonProperty("userId")
    private Integer userId;

    @TableField("begin_time")
    @JsonProperty("beginTime")
    private Date beginTime;

    @TableField("end_time")
    @JsonProperty("endTime")
    private Date endTime;

    @JsonProperty("content")
    private String content;

    @JsonProperty("customer")
    private Integer customer;
}
