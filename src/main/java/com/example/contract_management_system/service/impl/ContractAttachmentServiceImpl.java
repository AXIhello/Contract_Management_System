package com.example.contract_management_system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.contract_management_system.mapper.ContractAttachmentMapper;
import com.example.contract_management_system.mapper.ContractMapper;
import com.example.contract_management_system.pojo.*;
import com.example.contract_management_system.service.ContractAttachmentService;
import com.example.contract_management_system.service.LogService;
import com.example.contract_management_system.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ContractAttachmentServiceImpl extends ServiceImpl<ContractAttachmentMapper, ContractAttachment> implements ContractAttachmentService {
    private static final Logger logger = LoggerFactory.getLogger(ContractAttachmentServiceImpl.class);

    private final ContractAttachmentMapper contractAttachmentMapper;
    private final ContractMapper contractMapper;

    @Value("${file.upload.path}")
    private String uploadPath;

    private final LogService logService;
    private final UserService userService;

    public ContractAttachmentServiceImpl(ContractAttachmentMapper contractAttachmentMapper, ContractMapper contractMapper, LogService logService, UserService userService) {
        this.contractAttachmentMapper = contractAttachmentMapper;
        this.contractMapper = contractMapper;
        this.logService = logService;
        this.userService = userService;
    }

    @Override
    public boolean saveAttachment(ContractAttachment attachment) {
        try {
            return contractAttachmentMapper.insert(attachment) > 0;
        } catch (Exception e) {
            logger.error("保存附件信息到数据库失败", e);
            return false;
        }
    }

    @Override
    public boolean uploadAndSaveAttachment( Integer conNum, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            logger.warn("上传的文件为空");
            return false;
        }

        String originalFileName = file.getOriginalFilename();
        if (!isValidFileType(originalFileName)) {
            logger.warn("不支持的文件类型: {}", originalFileName);
            return false;
        }

        try {
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                logger.info("创建上传目录: {}", uploadPath);
                boolean created = uploadDir.mkdirs();
                if (!created) {
                    logger.error("创建上传目录失败: {}", uploadPath);
                    return false;
                }
            }

            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + fileExtension;
            String relativePath = "contract/attachment/" + fileName;
            String filePath = uploadPath + File.separator + fileName;
            logger.info("准备保存文件到: {}", filePath);

            File destFile = new File(filePath);
            file.transferTo(destFile);
            logger.info("文件保存成功: {}", filePath);

            String fileType = getFileType(originalFileName);

            ContractAttachment attachment = new ContractAttachment();
            attachment.setConNum(conNum);
            attachment.setFileName(originalFileName);
            attachment.setPath(relativePath);
            attachment.setType(fileType);
            attachment.setUploadTime(new Date());

            Contract contract = contractMapper.selectById(conNum);

            boolean saved = saveAttachment(attachment);
            if (saved) {
                logger.info("附件信息保存到数据库成功");
                Integer userId = userService.getCurrentUserId();
                logService.addLog(userId, 1, "ContractAttachment", contract.getName()+ " " + originalFileName);
            } else {
                logger.error("附件信息保存到数据库失败");
                destFile.delete();
            }
            return saved;
        } catch (IOException e) {
            logger.error("上传文件失败", e);
            return false;
        }
    }

    @Override
    public List<Pair<String, String>> getAttachmentsByConNum(Integer conNum) {
        return contractAttachmentMapper.selectByConNum(conNum);
    }

    @Override
    public boolean deleteAttachment(String relativePath) {
        try {
            QueryWrapper<ContractAttachment> wrapper = new QueryWrapper<>();
            wrapper.eq("path", relativePath);
            List<ContractAttachment> attachments = contractAttachmentMapper.selectList(wrapper);
            int rows = contractAttachmentMapper.delete(wrapper);

            if (rows > 0) {
                Integer userId = userService.getCurrentUserId();
                logService.addLog(userId, 2, "ContractAttachment", relativePath);
            }

            String fullPath = uploadPath + File.separator + new File(relativePath).getName();
            File file = new File(fullPath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (!deleted) {
                    logger.warn("文件删除失败: {}", fullPath);
                }
            }
            return rows > 0;
        } catch (Exception e) {
            logger.error("删除附件失败", e);
            return false;
        }
    }

    @Value("${file.upload.path}")
    private String uploadBasePath;
    @Override
    public Resource downloadAttachment(String relativePath) {
        Path filePath = Paths.get(uploadBasePath).resolve(Paths.get(relativePath).getFileName().toString()).normalize();
        File file = filePath.toFile();

        if (!file.exists() || !file.isFile()) {
            throw new RuntimeException("文件不存在：" + filePath);
        }

        try {
            return new UrlResource(file.toURI());
        } catch (MalformedURLException e) {
            throw new RuntimeException("文件路径无效：" + filePath, e);
        }
    }

    private boolean isValidFileType(String fileName) {
        String lowerName = fileName.toLowerCase();
        return lowerName.endsWith(".pdf") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerName.endsWith(".jpg") || lowerName.endsWith(".png") || lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx");
    }

    private String getFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "unknown";
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }
}