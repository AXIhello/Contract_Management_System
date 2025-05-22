package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("users")
public class User {
    private int user_id;
    private String username;
    private String password;

    public void setName(String name) {
        this.username = name;
    }
}
