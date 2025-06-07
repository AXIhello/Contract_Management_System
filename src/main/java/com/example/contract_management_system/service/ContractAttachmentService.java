package com.example.contract_management_system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.contract_management_system.pojo.ContractAttachment;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

public interface ContractAttachmentService extends IService<ContractAttachment> {

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
    List<Pair<String,String>> getAttachmentsByConNum(Integer conNum);

    /**
     * 删除附件
     * @param path 附件路径
     * @return 是否删除成功
     */
    boolean deleteAttachment(String path);

    /**
     * 下载附件
     * @param relativePath 附件存储路径
     * @return 文件字节数组和响应头
     */
    Resource downloadAttachment(String relativePath);
}