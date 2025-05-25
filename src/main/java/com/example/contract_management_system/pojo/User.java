package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("users")
public class User {
    @TableId(value = "user_id", type = IdType.AUTO)
    private Integer userid;
    private String username;
    private String password;
}
