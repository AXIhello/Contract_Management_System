package com.example.contract_management_system;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.contract_management_system.mapper")
public class ContractManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContractManagementSystemApplication.class, args);
    }

}
