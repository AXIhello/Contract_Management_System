package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.util.Pair;

import java.util.List;

@Mapper
public interface ContractAttachmentMapper extends BaseMapper<ContractAttachment> {

    /**
     * 根据合同编号查询附件列表
     * @param conNum 合同编号
     * @return 附件列表
     */
    @Select("SELECT fileName,path FROM contract_attachment " +
            "WHERE conNum  = #{conNum}")
    List<Pair<String,String>> selectByConNum(Integer conNum);
}