package com.example.contract_management_system;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@MapperScan("com.example.contract_management_system.mapper")
@EnableTransactionManagement

public class ContractManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContractManagementSystemApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminRole(JdbcTemplate jdbcTemplate) {
        return args -> {
            String checkSql = "SELECT COUNT(*) FROM role WHERE name = '管理员'";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class);
            if (count != null && count == 0) {
                String insertSql = "INSERT INTO role (name, description, functions) VALUES ('管理员', '系统默认管理员', 'draft_contract,finalize_contract,query_contract,delete_contract,countersign_contract,approve_contract,sign_contract,assign_countersign,assign_approve,assign_sign,query_process,add_user,edit_user,query_user,delete_user,add_role,edit_role,query_role,delete_role,add_func,edit_func,query_func,delete_func,assign_perm,add_client,edit_client,query_client,delete_client')";
                jdbcTemplate.update(insertSql);
                System.out.println("已自动插入默认管理员角色");
            }
        };
    }
}
