package com.example.contract_management_system.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

public class AssignContractRequest {
    @JsonProperty("conNum")
    @Setter
    @Getter
    private int conNum;    // 合同ID
    @JsonProperty("type")
    @Setter
    @Getter
    private int type;           // 操作类型
    @JsonProperty("userId")
    @Getter
    private int userId;         // 操作员ID
    @JsonProperty("time")
    @Getter
    private Timestamp time
            = new Timestamp(System.currentTimeMillis());    // 操作时间

}
