package com.example.contract_management_system.service.impl;

import com.example.contract_management_system.mapper.ContractAttachmentMapper;
import com.example.contract_management_system.pojo.ContractAttachment;
import com.example.contract_management_system.service.ContractAttachmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ContractAttachmentServiceImpl implements ContractAttachmentService {
    private static final Logger logger = LoggerFactory.getLogger(ContractAttachmentServiceImpl.class);

    @Autowired
    private ContractAttachmentMapper contractAttachmentMapper;

    @Value("${file.upload.path}")
    private String uploadPath;

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
    public boolean uploadAndSaveAttachment(Integer conNum, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            logger.warn("上传的文件为空");
            return false;
        }

        // 验证文件类型
        String originalFileName = file.getOriginalFilename();
        if (!isValidFileType(originalFileName)) {
            logger.warn("不支持的文件类型: {}", originalFileName);
            return false;
        }

        try {
            // 确保上传目录存在
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                logger.info("创建上传目录: {}", uploadPath);
                boolean created = uploadDir.mkdirs();
                if (!created) {
                    logger.error("创建上传目录失败: {}", uploadPath);
                    return false;
                }
            }

            // 生成唯一文件名
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;
            String relativePath = "contract/attachment/" + fileName;
            String filePath = uploadPath + File.separator + fileName;
            logger.info("准备保存文件到: {}", filePath);

            // 保存文件到磁盘
            File destFile = new File(filePath);
            file.transferTo(destFile);
            logger.info("文件保存成功: {}", filePath);

            // 获取文件类型
            String fileType = getFileType(originalFileName);

            // 保存附件信息到数据库
            ContractAttachment attachment = new ContractAttachment();
            attachment.setConNum(conNum);
            attachment.setFileName(originalFileName);
            attachment.setPath(relativePath);
            attachment.setType(fileType);
            attachment.setUploadTime(new Date());

            boolean saved = saveAttachment(attachment);
            if (saved) {
                logger.info("附件信息保存到数据库成功");
            } else {
                logger.error("附件信息保存到数据库失败");
                // 如果数据库保存失败，删除已上传的文件
                destFile.delete();
            }
            return saved;

        } catch (IOException e) {
            logger.error("文件上传失败", e);
            return false;
        }
    }

    @Override
    public List<Pair<String, String>> getAttachmentsByConNum(Integer conNum) {
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
                    boolean deleted = file.delete();
                    if (!deleted) {
                        logger.warn("文件删除失败: {}", attachment.getPath());
                    }
                }
                // 删除数据库记录
                return contractAttachmentMapper.deleteById(id) > 0;
            }
            return false;
        } catch (Exception e) {
            logger.error("删除附件失败", e);
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

    /**
     * 验证文件类型是否合法
     */
    private boolean isValidFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return false;
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        String[] allowedExtensions = {"doc", "docx", "pdf", "jpg", "jpeg", "png", "bmp", "gif"};

        for (String allowedExt : allowedExtensions) {
            if (allowedExt.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public ResponseEntity<byte[]> downloadAttachment(Integer id) {
        try {
            ContractAttachment attachment = contractAttachmentMapper.selectById(id);
            if (attachment == null) {
                logger.error("附件不存在: {}", id);
                return ResponseEntity.notFound().build();
            }

            File file = new File(uploadPath + File.separator + attachment.getPath());
            if (!file.exists()) {
                logger.error("附件文件不存在: {}", file.getAbsolutePath());
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(file.toPath());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                new String(attachment.getFileName().getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (Exception e) {
            logger.error("下载附件失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}