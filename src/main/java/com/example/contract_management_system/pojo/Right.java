package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.Getter;

@Data
@TableName("right")
public class Right {
    private int userId;
    private String roleName;
}
