package com.example.contract_management_system.dto;

import com.example.contract_management_system.pojo.Contract;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Data
public class ContractUpdateDTO {
        private Contract contract;
        private List<MultipartFile> newAttachments;
        private List<String> deletedAttachments;

}
