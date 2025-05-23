package com.example.contract_management_system.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("contract_attachment")
public class ContractAttachment {
    @TableId(type = IdType.AUTO)
    private Integer id;          // 主键（自增）

    private Integer conNum;      // 合同编号（外键）
    private String fileName;     // 文件名
    private String path;         // 上传路径
    private String type;         // 文件类型
    private Date uploadTime;     // 上传时间
}