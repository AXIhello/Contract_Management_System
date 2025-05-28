package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Contract;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.repository.query.Param;



public interface ContractMapper extends BaseMapper<Contract> {

    void updateContractState(@Param("conNum") int conNum, @Param("type") int type);

    @Select("SELECT name FROM contract WHERE num = #{id}")
    String findContractNameById(@Param("num") int id);

    @Select("SELECT * FROM contract WHERE num = #{id}")
    Contract findContractById(@Param("num") int id);
}

