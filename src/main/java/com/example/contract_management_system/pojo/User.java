package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.Getter;

@Data
@TableName("users")
public class User {
    @TableId(value = "user_id", type = IdType.AUTO)
    @Getter
    private int userId;
    @Getter
    private String username;
    private String password;


}
