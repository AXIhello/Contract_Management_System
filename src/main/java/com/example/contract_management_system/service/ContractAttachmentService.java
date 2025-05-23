package com.example.contract_management_system.service;

import com.example.contract_management_system.pojo.ContractAttachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContractAttachmentService {

    /**
     * 保存合同附件
     * @param attachment 附件信息
     * @return 是否保存成功
     */
    boolean saveAttachment(ContractAttachment attachment);

    /**
     * 上传并保存合同附件
     * @param conNum 合同编号
     * @param file 上传的文件
     * @return 是否成功
     */
    boolean uploadAndSaveAttachment(Integer conNum, MultipartFile file);

    /**
     * 根据合同编号获取附件列表
     * @param conNum 合同编号
     * @return 附件列表
     */
    List<ContractAttachment> getAttachmentsByConNum(Integer conNum);

    /**
     * 删除附件
     * @param id 附件ID
     * @return 是否删除成功
     */
    boolean deleteAttachment(Integer id);
}