package com.example.contract_management_system.pojo;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("customer")
public class Customer {
    @TableId(value = "num", type = IdType.AUTO)
    private Integer num;
    private String name;
    private String address;
    private String tel;
    private String fax;
    private String code;
    private String bank;
    private String account;
    private String note;
}
