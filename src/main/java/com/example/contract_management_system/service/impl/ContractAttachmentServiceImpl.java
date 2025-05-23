package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.mapper.ContractAttachmentMapper;
import com.example.contract_management_system.pojo.ContractAttachment;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ContractAttachmentServiceImpl implements ContractAttachmentService {

    @Autowired
    private ContractAttachmentMapper contractAttachmentMapper;

    // 从配置文件中读取文件上传路径，如果没有配置则使用默认值
    @Value("${file.upload.path:./uploads/contracts/}")
    private String uploadPath;

    @Override
    public boolean saveAttachment(ContractAttachment attachment) {
        try {
            return contractAttachmentMapper.insert(attachment) > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean uploadAndSaveAttachment(Integer conNum, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        try {
            // 确保上传目录存在
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 生成唯一文件名，避免重名冲突
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;
            String filePath = uploadPath + fileName;

            // 保存文件到磁盘
            File destFile = new File(filePath);
            file.transferTo(destFile);

            // 获取文件类型
            String fileType = getFileType(originalFileName);

            // 保存附件信息到数据库
            ContractAttachment attachment = new ContractAttachment();
            attachment.setConNum(conNum);
            attachment.setFileName(originalFileName);
            attachment.setPath(filePath);
            attachment.setType(fileType);
            attachment.setUploadTime(new Date());

            return saveAttachment(attachment);

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<ContractAttachment> getAttachmentsByConNum(Integer conNum) {
        return contractAttachmentMapper.selectByConNum(conNum);
    }

    @Override
    public boolean deleteAttachment(Integer id) {
        try {
            // 先获取附件信息，删除文件
            ContractAttachment attachment = contractAttachmentMapper.selectById(id);
            if (attachment != null) {
                File file = new File(attachment.getPath());
                if (file.exists()) {
                    file.delete();
                }
                // 删除数据库记录
                return contractAttachmentMapper.deleteById(id) > 0;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据文件名获取文件类型
     */
    private String getFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "unknown";
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        switch (extension) {
            case "doc":
            case "docx":
                return "word";
            case "pdf":
                return "pdf";
            case "jpg":
            case "jpeg":
            case "png":
            case "bmp":
            case "gif":
                return "image";
            case "txt":
                return "text";
            default:
                return extension;
        }
    }
}