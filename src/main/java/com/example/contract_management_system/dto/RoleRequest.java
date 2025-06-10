package com.example.contract_management_system.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

public class RoleRequest {
    @JsonProperty("oldName")
    @Getter
    @Setter
    private String oldName;
    @JsonProperty("name")
    @Getter
    @Setter
    private String name;
    @JsonProperty("desc")
    @Getter
    @Setter
    private String desc;
    @JsonProperty("perms")
    @Getter
    @Setter
    private List<String> perms;
}
