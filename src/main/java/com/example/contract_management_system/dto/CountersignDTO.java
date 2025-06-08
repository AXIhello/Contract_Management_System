package com.example.contract_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CountersignDTO {
    private String username;  // 会签人用户名
    private String content;   // 会签意见内容
}
