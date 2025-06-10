package com.example.contract_management_system.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class ContractDTO {
    @Getter
    @Setter
    private int num;
    @Getter
    @Setter
    private String name;
    @Getter
    @Setter
    private int customer;
    @Getter
    @Setter
    private int state;
}
